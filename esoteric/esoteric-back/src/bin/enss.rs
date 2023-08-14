use std::collections::HashMap;
use std::fs;
use std::io::Write;

use std::net::SocketAddr;
use std::sync::Arc;

use axum::{routing::{get, post}, Router, Json, debug_handler};
use axum::extract::{Path, State, Multipart, Query};
use axum::http::{header};
use axum::response::IntoResponse;

use sqlx::{sqlite::SqlitePool, Sqlite, Executor, query_as};
use serde::{Deserialize, Serialize};
use sqlx::migrate::MigrateDatabase;
use ::chrono::{
    DateTime,
    Utc,
    serde::ts_seconds_option
};
use axum::body::Bytes;
use tokio::sync;
use tower_http::trace::TraceLayer;
use esoteric_back::{
    auth::UserClaim,
    handlers::{stats, status},
    logging::init_log,
    state::{AppState, Error, ProblemID, ProblemSetID, SubmissionID, UserID},
    state::Error::{InvalidArgument, ServerError}
};
use crate::{
    libenss::executor::execution_thread,
    libenss::setup::resync
};
use crate::libenss::setup::create_tables;

mod libenss;

const DATABASE_URL: &str = "sqlite://enss.db";
const PORT: u16 = 3193;

const SUBMISSIONS: &str = "submissions";
const PROBLEM_SETS: &str = "problem_sets";
const MAX_FILE_SIZE: usize = 16 * 1024;

enum Language {
    GPP
}

impl Language {
    fn from(string: &str) -> Result<Self, String> {
        if string == "GNU G++20" {
            return Ok(Language::GPP)
        }
        Err("Invalid language".to_string())
    }

    fn to_db(&self) -> &'static str {
        match self {
            Language::GPP => "GNU G++20"
        }
    }

    fn to_ext(&self) -> &'static str {
        match self {
            Language::GPP => "cpp"
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct ProblemSetDescriptor {
    name: ProblemSetID
}

async fn problem_sets(State(handle): State<AppState>)
    -> Result<Json<Vec<ProblemSetDescriptor>>, Error>
{
    let res: Vec<ProblemSetDescriptor> = sqlx::query_as("SELECT id FROM problem_sets")
        .fetch_all(handle.db())
        .await
        .map_err(|_| ServerError("Could not query problem sets".to_string()))?

        .into_iter()
        .map(|(res, )| ProblemSetDescriptor { name: res })
        .collect();

    Ok(Json(res))
}

#[derive(Debug, Serialize, Deserialize)]
struct ProblemIndex {
    name: ProblemID,
    rating: i32,
}

async fn problems(State(handle): State<AppState>, Path(problem_set): Path<String>)
    -> Result<Json<Vec<ProblemIndex>>, Error>
{
    let res: Vec<ProblemIndex> = sqlx::query_as("
            SELECT id, rating FROM problems
            WHERE problem_set_id = ?
            ORDER BY rating ASC
         "
    )
        .bind(problem_set)
        .fetch_all(handle.db())
        .await
        .map_err(|e| ServerError("Could not select problems".to_string() + &e.to_string()))?
        .into_iter()
        .map(|(name, rating)| ProblemIndex { name, rating })
        .collect();

    Ok(Json(res))
}

#[derive(Debug, Serialize, Deserialize)]
struct Problem {
    rating: i32,
    #[serde(with = "ts_seconds_option")]
    submission_close: Option<DateTime<Utc>>,
    kb_limit: i32,
    ms_limit: i32,
    content: String
}

async fn problem(State(handle): State<AppState>,
                 Path((set, problem)): Path<(ProblemSetID, ProblemID)>)
    -> Result<Json<Problem>, Error>
{
    let (rating, kb_limit, ms_limit, open, close): (i32, i32, i32, Option<DateTime<Utc>>, Option<DateTime<Utc>>) =
        query_as("SELECT rating, kb_limit, ms_limit, statement_release, submission_close FROM problems WHERE id = ?")
            .bind(problem.clone())
            .fetch_one(handle.db())
            .await
            .map_err(|e| ServerError("Could not query problem limit".to_string() + &e.to_string()))?;

    let content =
        fs::read_to_string(PROBLEM_SETS.to_string() + "/" + &set + "/" + &problem + "/index.md")
            .map_err(|_| ServerError("Could not read contents".to_string()))?;

    if let Some(open) = open {
        if open < Utc::now() {
            return Err(InvalidArgument(format!(
                "This problem is not yet available publicly (opens {open})"
            ).to_string()))
        }
    }

    Ok(Json(Problem {
        rating,
        submission_close: close,
        kb_limit,
        ms_limit,
        content
    }))
}

#[derive(Debug, Serialize, Deserialize)]
struct UserSubmission {
    content: String,
    language: String
}

#[derive(Debug, Serialize)]
struct SubmissionResponse {
    id: SubmissionID
}

async fn submit(State(handle): State<AppState>,
                user: UserClaim,
                Path((_, problem)): Path<(ProblemSetID, ProblemID)>,
                mut form: Multipart)
    -> Result<Json<SubmissionResponse>, Error>
{
    let mut language: Option<Language> = None;
    let mut bytes: Option<Bytes> = None;

    while let Some(field) = form.next_field().await.map_err(|_| ServerError("Could not read form".to_string()))? {
        let name = field.name().unwrap().to_string();
        if name == "file" {
            bytes = field.bytes().await.ok();
        }
        else if name == "language" {
            language = Language::from(&(field.text()
                .await
                .map_err(|_| ServerError("Could not read language".to_string()))?)
            ).ok();
        }
    }

    let language = match language {
        None => return Err(ServerError("Invalid language".to_string())),
        Some(language) => language
    };

    if let Some(bytes) = &bytes {
        if bytes.len() > MAX_FILE_SIZE {
            return Err(InvalidArgument("File too large".to_string()));
        }
    }

    // sql record
    // ensure problem is open
    let (start, close): (Option<DateTime<Utc>>, Option<DateTime<Utc>>) =
        sqlx::query_as("SELECT statement_release, submission_close FROM problems
                            WHERE id = ?")
        .bind(problem.clone())
        .fetch_one(handle.db())
        .await
        .map_err(|_| ServerError("Could not query submission portal timestamp".to_string()))?;

    if let Some(start) = start {
        if start > Utc::now() {
            return Err(InvalidArgument("Problem is not open".to_string()));
        }
    }

    if let Some(end) = close {
        if end < Utc::now() {
            return Err(InvalidArgument("Problem is not open".to_string()));
        }
    }

    match sqlx::query("INSERT INTO submissions(user_id, problem_id, timestamp, language)
                        VALUES (?, ?, ?, ?)")
        .bind(user.id())
        .bind(problem)
        .bind(Utc::now())
        .bind(language.to_db())
        .execute(handle.db())
        .await {
        Ok(_) => (),
        Err(_) => return Err(ServerError("Could not create submission record".to_string()))
    }

    // technically prone to exploits, but whatever...
    let id: i32 = sqlx::query_scalar("SELECT MAX(id) FROM submissions")
        .fetch_one(handle.db())
        .await
        .map_err(|_| ServerError("Could not create submission record".to_string()))?;

    match fs::create_dir(SUBMISSIONS.to_string() + "/" + &id.to_string()) {
        Ok(_) => (),
        Err(e) => return Err(ServerError(e.to_string()))
    };

    fs::File::create(SUBMISSIONS.to_string() + "/" + &id.to_string() + "/main." + language.to_ext())
        .and_then(|mut file| file.write_all(bytes.unwrap().as_ref()))
        .map_err(|_| ServerError("Could not create submission file".to_string()))?;

    // start grading server
    match handle.enss_tx.unwrap().send(id).await {
        Ok(_) => (),
        Err(_) => return Err(ServerError("Could not send submission to grading server".to_string()))
    }

    Ok(Json(SubmissionResponse { id } ))
}

#[derive(Debug, Deserialize)]
struct ResultsQuery {
    problem_set: Option<ProblemSetID>,
    problem: Option<ProblemID>,
    user: Option<UserID>,
    submission: Option<SubmissionID>
}

#[derive(Debug, Serialize)]
struct TestCaseResult {
    status: i32,
    kb_used: i32,
    ms_used: i32
}

#[derive(Debug, Serialize)]
struct SubmissionResult {
    submission_id: SubmissionID,
    tests: Vec<TestCaseResult>
}

#[derive(Debug, Serialize)]
struct ResultsMasterResponse {
    problem_sets:
        HashMap<
            ProblemSetID, HashMap<
                ProblemID, HashMap<
                    UserID, HashMap<
                        SubmissionID, Vec<TestCaseResult>
                    >
                >
            >
        >
}

/* admin only in certain scenarios */
async fn submission_results(State(handle): State<AppState>,
                            user: UserClaim,
                            Query(query): Query<ResultsQuery>)
    -> Result<Json<ResultsMasterResponse>, Error>
{
    let user_id = if user.access() == 0 { Some(user.id()) } else { query.user };

    let rows: Vec<(ProblemSetID, ProblemID, UserID, SubmissionID, i32, i32, i32)> =
        sqlx::query_as(
        "
            SELECT prb.problem_set_id, sub.problem_id, sub.user_id, sub.id, res.status, res.kb_used, res.ms_used
            FROM test_case_results res
            INNER JOIN submissions sub  ON res.submission_id = sub.id
            INNER JOIN problems prb     ON sub.problem_id = prb.id
                WHERE   (prb.problem_set_id = IFNULL(?, prb.problem_set_id))
                    AND (sub.problem_id =     IFNULL(?, sub.problem_id))
                    AND (sub.user_id =        IFNULL(?, sub.user_id))
                    AND (sub.id =             IFNULL(?, sub.id));
            "
    )
        .bind(query.problem_set)
        .bind(query.problem)
        .bind(user_id)
        .bind(query.submission)
        .fetch_all(handle.db())
        .await
        .map_err(|_| ServerError("Could not perform query".to_string()))?;

    let mut result = ResultsMasterResponse { problem_sets: HashMap::new() };
    for (psid, pid, uid, sid, status, kb_used, ms_used) in rows {
        result.problem_sets
            .entry(psid)
            .or_default()
            .entry(pid)
            .or_default()
            .entry(uid)
            .or_default()
            .entry(sid)
            .or_default()
            .push(TestCaseResult { status, kb_used, ms_used });
    }

    Ok(Json(result))
}

#[derive(Debug, Serialize)]
struct ProblemsetLastResults {
    results: HashMap<ProblemID, SubmissionResult>
}

async fn problemset_submission_results(State(handle): State<AppState>,
                                       user: UserClaim,
                                       Path(problem_set): Path<ProblemSetID>)
    -> Result<Json<ProblemsetLastResults>, Error>
{
    let results: Vec<(ProblemID, SubmissionID, i32, i32, i32)> = sqlx::query_as(
        "
        WITH
        ranked_submissions AS (
            SELECT sub.id, sub.problem_id, ROW_NUMBER() OVER (PARTITION BY problem_id, user_id ORDER BY timestamp DESC) AS cardinality
            FROM submissions AS sub
            INNER JOIN problems prb ON sub.problem_id = prb.id
            WHERE prb.problem_set_id = ? AND sub.user_id = ?
        ),
        latest_submissions AS (
            SELECT id, problem_id FROM ranked_submissions WHERE cardinality = 1
        )
        SELECT problem_id, res.submission_id, res.status, res.kb_used, res.ms_used FROM test_case_results res
        INNER JOIN latest_submissions sub ON res.submission_id = sub.id;
        "
    )
        .bind(problem_set)
        .bind(user.id())
        .fetch_all(handle.db())
        .await
        .map_err(|e| ServerError("Could not find results".to_string() + &e.to_string()))?;

    let mut problem_sets = ProblemsetLastResults { results: HashMap::new() };
    for (key, submission, status, kb_used, ms_used) in results {
        problem_sets
            .results
            .entry(key)
            .or_insert(SubmissionResult { submission_id: submission, tests: Vec::new() })
            .tests
            .push(TestCaseResult { status, kb_used, ms_used });
    }

    Ok(Json(problem_sets))
}

/* file */
async fn submission(State(handle): State<AppState>, Path(submission_id): Path<i32>)
    -> Result<impl IntoResponse, Error>
{
    let language = sqlx::query_as("SELECT language FROM submissions WHERE id = ?")
        .bind(submission_id)
        .fetch_one(handle.db())
        .await
        .map(|(str, ): (String, )| Language::from(&str).unwrap_or(Language::GPP))
        .map_err(|_| ServerError("Could not query file language".to_string()))?;

    let path = PROBLEM_SETS.to_string() + "/" + &submission_id.to_string() + "/main";
    let body = fs::read_to_string(path)
        .map_err(|_| InvalidArgument("Submission does not exist".to_string()))?;

    let headers = [
        (header::CONTENT_TYPE, "text/plain; charset=utf-8".to_string()),
        (header::CONTENT_DISPOSITION, "attachment; filename=\"main.\"".to_string() + &language.to_db()),
    ];

    Ok((headers, body))
}

/* based off of https://github.com/tokio-rs/axum/blob/main/examples/jwt/src/main.rs */
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    init_log();

    if !Sqlite::database_exists(DATABASE_URL).await.expect("Error checkin") {
        Sqlite::create_database(DATABASE_URL).await.expect("Error creating database");
    }

    let db = SqlitePool::connect(DATABASE_URL).await.expect("Error connecting to database");
    // use a separate connection to avoid transaction conflicts (with last_insert_rowid)
    let executor_db = SqlitePool::connect(DATABASE_URL).await.expect("Error connecting to database");
    create_tables(&db).await;
    resync(&db).await; // resync tables with file system

    let db = Arc::new(db);

    /* thread */
    let (tx, rx) = sync::mpsc::channel(1);
    tokio::spawn( execution_thread(executor_db, rx));

    let mut state = AppState::new(db)?;
    state.enss_tx = Some(tx);


    let app = Router::new()
        .route("/enss/problem_sets", get(problem_sets))
        .route("/enss/problem_set/:problem_set/problems", get(problems))
        .route("/enss/problem_set/:problem_set/problem/:problem", get(problem))
        .route("/enss/problem_set/:problem_set/problem/:problem/submission/", post(submit))
        .route("/enss/problem_set/:problem_set/problem/:problem/submission/:submission", get(submission))
        .route("/enss/problem_set/:problem_set/last_results", get(problemset_submission_results))
        .route("/enss/results", get(submission_results))
        /* health actions */
        .route("/enss/status", get(status))
        .route("/enss/stats", get(stats))
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], PORT));

    println!("enss::init");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}
