use std::collections::{HashMap};
use std::fs;
use std::net::SocketAddr;
use std::sync::{Arc};

use axum::{routing::{get, delete}, Router, Json};
use axum::extract::{Path, State, WebSocketUpgrade};
use axum::extract::ws::{Message, WebSocket};
use axum::response::IntoResponse;
use serde::{Deserialize, Serialize};
use sqlx::migrate::MigrateDatabase;
use sqlx::{Sqlite, SqlitePool};
use tokio::sync::{mpsc, Mutex, oneshot};
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
type Slaves = HashMap<(UserID, Bucket), oneshot::Sender<()>>;
type SyncState = AppState<Arc<Mutex<Slaves>>>;

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
    pub async fn on_master_update(json: &serde_json::Value) {
        // based on json
    }

    async fn handle_notifications() {

    }
}

async fn bucket_dispatch(value: &serde_json::Value, bucket: &str) {
    match bucket {
        NUTQ_BUCKET => nutq::on_master_update(value).await,
        _ => { }
    }
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

async fn establish_slave(State(state): State<SyncState>,
                         ws: WebSocketUpgrade,
                         user: UserClaim,
                         Path(bucket): Path<Bucket>
) -> impl IntoResponse {
    ws.on_upgrade(|socket| slave_connection(socket, State(state), user, bucket))
}

async fn slave_connection(mut socket: WebSocket, State(state): State<SyncState>, user: UserClaim, bucket: Bucket) {
    // cancel if already connected
    // should probably be done with raii
    // but thats a bit hard to work with tokio (mainly cause of the async lock)
    let mut slaves = state.aux.lock().await;
    if slaves.contains_key(&(user.id(), bucket.clone())) {
        match socket.send(Message::Text("\"Resource in Use\"".to_string())).await {
            Ok(_) => { }
            Err(_) => { return; }
        }

        return;
    }

    let (kill_tx, kill_rx) = oneshot::channel();
    slaves.insert((user.id(), bucket.clone()), kill_tx);
    drop(slaves);

    let file_contents = fs::read_to_string(format!("./buckets/{}/{}.json", bucket, user.id()))
        .unwrap_or_else(|_| {
            let res = "{}".to_string();

            fs::create_dir_all(format!("./buckets/{}", bucket))
                .expect("Error creating directory");

            fs::write(format!("./buckets/{}/{}.json", bucket, user.id()), res.clone())
                .expect("Error writing file");

            res
        });

    let mut json_value: serde_json::Value = serde_json::from_str(&file_contents)
        .expect("JSON data should be consistent");

    // first send current state
    let skip = match socket.send(Message::Text(json_value.to_string())).await {
        Ok(_) => false,
        Err(_) => true
    };

    // keep receiving updates (once socket is closed by either us or someone else, we exit the connection)
    tokio::select! {
        _ = async {
            while !skip {
                match socket.recv().await {
                    Some(Ok(Message::Text(msg))) => {
                        let cont: serde_json::error::Result<Vec<Delta>> = serde_json::from_str(&msg);
                        match cont {
                            Ok(cont) => {
                                apply_updates(&mut json_value, cont);
                                bucket_dispatch(&json_value, &bucket).await;
                                fs::write(format!("./buckets/{}/{}.json", bucket, user.id()), json_value.to_string())
                                    .expect("Error writing file");
                            }
                            Err(_) => { }
                        }
                    }
                    None => { break; }
                    Some(Err(_)) => { break; }
                    Some(Ok(Message::Close(_))) => { break; }
                    _ => continue
                }
            }
        } => {},
        _ = kill_rx => {
            socket.send(Message::Close(None)).await
                .expect("Error closing socket");
        } // if slave was cancelled, exit
    }


    // remove from slaves
    let mut slaves = state.aux.lock().await;
    slaves.remove(&(user.id(), bucket));
}

async fn kill_slave(State(state): State<SyncState>, user: UserClaim, Path(bucket): Path<Bucket>) -> Result<(), Error> {
    let mut slaves = state.aux.lock().await;
    if let Some(kill_tx) = slaves.remove(&(user.id(), bucket.clone())) {
        kill_tx.send(()).expect("Error sending kill signal");
    }
    else {
        return Err(Error::InvalidArgument("Slave not found".to_string()));
    }

    Ok(())
}

// not guaranteed to be absolute latest, but generally good enough
async fn try_read_bucket(user: UserClaim, Path(bucket): Path<Bucket>)
    -> Result<Json<serde_json::Value>, Error> {
    let file_content = fs::read_to_string(format!("./buckets/{}/{}.json", bucket, user.id()))
        .map_err(|_| Error::ServerError("Error reading data block".to_string()))?;

    let json_value: serde_json::Value = serde_json::from_str(&file_content)
        .map_err(|_| Error::ServerError("Error parsing data block".to_string()))?;

    Ok(Json(json_value))
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

    let slaves: Slaves = HashMap::new();
    let arc_slaves = Arc::new(Mutex::new(slaves));
    let state = SyncState::new(Arc::new(db), arc_slaves)?;

    let app = Router::new()
        /* health functions */
        .route("/sync/status", get(status))
        .route("/sync/stats", get(stats))
        /* sync functions */
        .route("/sync/slave/:bucket", get(establish_slave))
        .route("/sync/steal/:bucket", delete(kill_slave)) // prob should be slave, but nginx...
        .route("/sync/bucket/:bucket", get(try_read_bucket))
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
