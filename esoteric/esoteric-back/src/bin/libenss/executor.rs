use std::process::Stdio;
use sqlx::SqlitePool;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync;
use esoteric_back::state::{ProblemID, ProblemSetID, SubmissionID, TestCaseID};

// execution thread
pub async fn execution_thread(_db: SqlitePool, mut rx: sync::mpsc::Receiver<SubmissionID>) {
    loop {
        match rx.recv().await {
            Some(id) => {
                let (problem_set_id, problem_id, language): (ProblemSetID, ProblemID, String) = match
                sqlx::query_as("
                        SELECT prb.problem_set_id, sub.problem_id, sub.language
                        FROM submissions sub
                        INNER JOIN problems prb ON sub.problem_id = prb.id
                        WHERE sub.id = ?
                    ")
                    .bind(id)
                    .fetch_one(&_db)
                    .await
                {
                    Ok(res) => res,
                    Err(e) => std::panic::panic_any(e.to_string())
                };

                // query problem parameters
                let (ms_limit, kb_limit): (i32, i32) = match
                sqlx::query_as("SELECT ms_limit, kb_limit FROM problems WHERE id = ?")
                    .bind(problem_id.clone())
                    .fetch_one(&_db)
                    .await
                {
                    Ok(res) => res,
                    Err(e) => std::panic::panic_any(e)
                };

                // execute https://docs.rs/tokio/0.2.21/tokio/process/index.html
                let loc = "../../problem_sets".to_string() + "/" + &problem_set_id + "/" + &problem_id + "/ok.o";

                let mut res = match
                Command::new(loc)
                    .current_dir("./submissions/".to_string() + "/" + &id.to_string())
                    .arg(language)
                    .arg(kb_limit.to_string())
                    .arg(ms_limit.to_string())
                    .stdout(Stdio::piped())
                    .spawn()
                {
                    Ok(res) => res,
                    Err(e) => std::panic::panic_any(e.to_string())
                };

                let mut reader = BufReader::new(res.stdout.take().unwrap())
                    .lines();
                tokio::spawn(async move {
                    let status = res.wait().await
                        .expect("child process encountered an error");
                    if !status.success() {
                        panic!("child process exited with status {:?}", status.code());
                    }
                });

                /* number of test cases */
                let mut ids: Vec<TestCaseID> = Vec::new();
                if let Ok(Some(line)) = reader.next_line().await {
                    let n = line.parse::<i32>().unwrap_or(0);
                    for _ in 0..n {
                        match sqlx::query("
                                INSERT INTO test_case_results(submission_id, status, kb_used, ms_used)
                                VALUES (?, ?, ?, ?);
                            ")
                            .bind(id)
                            .bind(-2) // -2 == loading
                            .bind(0)
                            .bind(0)
                            .execute(&_db)
                            .await {
                            Ok(res) => res,
                            Err(e) => std::panic::panic_any(e.to_string())
                        };

                        let res: TestCaseID = sqlx::query_scalar("SELECT MAX(id) FROM test_case_results;")
                            .fetch_one(&_db)
                            .await
                            .expect("Could not get last insert rowid");

                        ids.push(res);
                    }
                }

                while let Ok(Some(line)) = reader.next_line().await {

                    let mut items = line
                        .split(" ")
                        .map(str::parse::<i32>)
                        .map(|res| res.unwrap_or(0));

                    let index = items.next().unwrap_or(0) as usize;

                    if let Err(e) = sqlx::query("
                            UPDATE test_case_results
                            SET status = ?, kb_used = ?, ms_used = ?
                            WHERE id = ?
                        ")
                        .bind(items.next())
                        .bind(items.next())
                        .bind(items.next())
                        .bind(ids[index])
                        .execute(&_db)
                        .await {
                        std::panic::panic_any(e)
                    };
                }
            },
            None => break
        }
    }
}

