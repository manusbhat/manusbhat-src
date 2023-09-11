use std::collections::HashMap;
use std::fs;
use std::net::SocketAddr;
use std::ops::Add;
use std::sync::Arc;

use axum::{routing::{get}, Router, Json};
use axum::extract::State;
use chrono::{NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::migrate::MigrateDatabase;
use sqlx::{Sqlite, SqlitePool};
use tokio::sync::Mutex;
use tower_http::trace::TraceLayer;
use esoteric_back::auth::UserClaim;

use esoteric_back::handlers::{stats, status};
use esoteric_back::logging::init_log;
use esoteric_back::state::{AppState, Error, UserID};
use esoteric_back::util::rand_i32;

const DATABASE_URL: &str = "sqlite:sync.db";
const PORT: u16 = 3194;

const SLAVE_TOKEN_EXPIRATION_SECONDS: i32 = 20;

const NUTQ_BUCKET: &str = "nutq";

type UUID = String;
type Nonce = i32;
type Bucket = String;
type SyncState = AppState<Arc<Mutex<SlaveMap>>>;

struct SlaveEntry {
    expires: NaiveDateTime,
    slave: SlaveToken,
    waiting: bool
}

struct SlaveMap {
    slaves: HashMap<(UserID, Bucket), SlaveEntry>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct SlaveToken {
    bucket: Bucket,
    nonce: i32,
    seconds: i32
}

mod nutq {
    use super::{Serialize, Deserialize};

    #[derive(Debug, Serialize, Deserialize)]
    enum SchemeRepeat {
        None,
        Block(i32),
    }

    #[derive(Debug, Serialize, Deserialize)]
    struct SchemeState {
        id: super::UUID,

        state: Vec<i32>,
        text: String,

        // start: Option<Date>,
        // end: Option<Date>,

        repeat: SchemeRepeat,

        indentation: i32
    }

    #[derive(Debug, Serialize, Deserialize)]
    struct SchemeItem {
        id: super::UUID,

        name: String,
        syncs_to_gsync: bool,
        color_index: i32,

        schemes: Vec<SchemeItem>
    }

    // nutq needs special functions
    pub async fn on_master_update(json: serde_json::Value) {
        // based on json
    }

    async fn handle_notifications() {

    }
}

#[derive(Debug, Serialize, Deserialize)]
struct CreationParameters {
    hash: i32,
    bucket: String
}

#[derive(Debug, Serialize, Deserialize)]
struct CreationResult {
    slave: SlaveToken,
    current: Option<serde_json::Value>
}

#[derive(Debug, Serialize, Deserialize)]
struct CreationFail {
    taken_till: NaiveDateTime
}

async fn try_create_slave(State(state): State<SyncState>, user: UserClaim, Json(target): Json<CreationParameters>)
    -> Result<Json<CreationResult>, Json<CreationFail>> {
    // check if bucket exists
    let mut slaves = state.aux.lock().await;
    let key = (user.id(), target.bucket.clone());

    if let Some(entry) = slaves.slaves.get_mut(&key) {
        if entry.expires > Utc::now().naive_utc() {
            entry.waiting = true;
            return Err(Json(CreationFail { taken_till: entry.expires}))
        }
    }

    let slave = SlaveToken {
        bucket:  target.bucket.clone(),
        nonce: rand_i32(),
        seconds: SLAVE_TOKEN_EXPIRATION_SECONDS
    };

    slaves.slaves.insert(key, SlaveEntry {
        slave: slave.clone(),
        expires: Utc::now().naive_utc().add(chrono::Duration::seconds(SLAVE_TOKEN_EXPIRATION_SECONDS as i64)),
        waiting: false
    });

    let file_content = fs::read_to_string(format!("./sync/{}/{}.json", target.bucket, user.id()))
        .unwrap_or_else(|_| {
            let res = "{}".to_string();

            fs::create_dir_all(format!("./sync/{}", target.bucket))
                .expect("Error creating directory");

            fs::write(format!("./sync/{}/{}.json", target.bucket, user.id()), res.clone())
                .expect("Error writing file");

            res
        });

    // for now, always create even if hashes match...
    let json_value: serde_json::Value = serde_json::from_str(&file_content)
        .expect("JSON data should be consistent");

    return Ok(Json(
        CreationResult {
            slave,
            current: Some(json_value)
        }
    ))
}

#[derive(Debug, Serialize, Deserialize)]
struct ReadBucketIn {
    bucket: Bucket
}

// not guaranteed to be absolute latest, but generally good enough
async fn try_read_bucket(user: UserClaim, Json(bucket): Json<ReadBucketIn>)
    -> Result<Json<serde_json::Value>, Error> {
    let file_content = fs::read_to_string(format!("./sync/{}/{}.json", bucket.bucket, user.id()))
        .map_err(|_| Error::ServerError("Error reading data block".to_string()))?;

    let json_value: serde_json::Value = serde_json::from_str(&file_content)
        .map_err(|_| Error::ServerError("Error parsing data block".to_string()))?;

    Ok(Json(json_value))
}

#[derive(Debug, Serialize, Deserialize)]
enum DeltaType {
    Create,
    Delete
}

#[derive(Debug, Serialize, Deserialize)]
struct Delta {
    // numbers or strings
    path: Vec<serde_json::Value>,
    delta_type: DeltaType,
    value: serde_json::Value
}

#[derive(Debug, Serialize, Deserialize)]
struct ContinueIn {
    slave: SlaveToken,
    deltas: Vec<Delta>
}

fn apply_updates(value: &mut serde_json::Value, deltas: Vec<Delta>) {
    'delta: for delta in deltas {
        let mut current = &mut *value;

        for path in delta.path[..delta.path.len() - 1].iter() {
            if current.is_array() {
                if let serde_json::Value::Number(num) = path {
                    current = current.get_mut(num.as_u64().unwrap() as usize).unwrap();
                    continue
                }
            }
            else if current.is_object() {
                if let Some(str) = path.as_str() {
                    current = current.get_mut(str).unwrap();
                    continue
                }
            }

            continue 'delta;
        }

        if let (Some(obj), Some(num)) = (
            current.as_array_mut(),
            delta.path.last().and_then(|x| x.as_u64())
        ) {
            match delta.delta_type {
                DeltaType::Create => { obj.insert(num as usize, delta.value); }
                DeltaType::Delete => { obj.remove(num as usize); }
            }
        }
        else if let (Some(obj), Some(str)) = (
            current.as_object_mut(),
            delta.path.last().and_then(|x| x.as_str())
        ) {
            match delta.delta_type {
                DeltaType::Create => { obj.insert(str.to_string(), delta.value); },
                DeltaType::Delete => { obj.remove(str); }
            }
        }
    }
}

async fn try_continue_slave(State(state): State<SyncState>, user: UserClaim, Json(update): Json<ContinueIn>) -> Result<(), Error> {
    let mut slaves = state.aux.lock().await;

    if let Some(entry) = slaves.slaves.get_mut(&(user.id(), update.slave.bucket.clone())) {
        if entry.slave.nonce != update.slave.nonce {
            return Err(Error::InvalidToken());
        }
        else if entry.waiting {
            return Err(Error::InvalidArgument("Another device is attempting to access this resource".to_string()));
        }
    }
    else {
        return Err(Error::InvalidToken());
    }

    // retrieve current if exists and is available
    let file_contents = fs::read_to_string(format!("./sync/{}/{}.json", update.slave.bucket, user.id()))
        .map_err(|_| Error::ServerError("Error reading data block".to_string()))?;

    let mut json_value: serde_json::Value = serde_json::from_str(&file_contents)
        .map_err(|_| Error::ServerError("Error parsing data block".to_string()))?;

    // apply updates
    apply_updates(&mut json_value, update.deltas);

    // save
    fs::write(format!("./sync/{}/{}.json", update.slave.bucket, user.id()), json_value.to_string())
        .map_err(|_| Error::ServerError("Error writing data block".to_string()))?;

    // notify relevant handles
    if update.slave.bucket == NUTQ_BUCKET {
        nutq::on_master_update(json_value).await;
    }

    Ok(())
}

async fn rescind_slave(State(state): State<SyncState>, user: UserClaim, Json(slave): Json<SlaveToken>) -> Result<(), Error> {
    // pretty simple
    let mut slaves = state.aux.lock().await;
    if let Some(entry) = slaves.slaves.get(&(user.id(), slave.bucket.clone())) {
        if entry.slave.nonce == slave.nonce {
            slaves.slaves.remove(&(user.id(), slave.bucket));
            return Ok(())
        }
    }

    Err(Error::InvalidToken())
}

/* based off of https://github.com/tokio-rs/axum/blob/main/examples/jwt/src/main.rs */
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    init_log();

    if !Sqlite::database_exists(DATABASE_URL).await.expect("Error checkin") {
        Sqlite::create_database(DATABASE_URL).await.expect("Error creating database");
    }

    let db = SqlitePool::connect(DATABASE_URL).await.expect("Error connecting to database");
    create_tables(&db).await;

    let state = AppState::new(Arc::new(db), ())?;

    let app = Router::new()
        /* health functions */
        .route("/sync/status", get(status))
        .route("/sync/stats", get(stats))
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], PORT));

    println!("sync::init");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}

async fn create_tables(db: &SqlitePool) {
}
