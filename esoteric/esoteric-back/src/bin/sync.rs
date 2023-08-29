use std::error::Error;
use std::net::SocketAddr;
use std::sync::Arc;


use axum::{
    routing::{get}, 
    Router
};
use serde::{Deserialize, Serialize};
use sqlx::migrate::MigrateDatabase;
use sqlx::{Executor, Sqlite, SqlitePool};
use tower_http::trace::TraceLayer;


use esoteric_back::handlers::{stats, status};
use esoteric_back::logging::init_log;
use esoteric_back::state::AppState;

const DATABASE_URL: &str = "sqlite:sync.db";
const PORT: u16 = 3194;

type UUID = String;

#[derive(Debug, Serialize, Deserialize)]
struct SlaveToken {
    token_id: i32,
    container: String
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
    async fn on_master_update() {
        // based on json
    }

    async fn handle_notifications() {

    }
}
//
// async fn get_slave() -> Result<> {
//
// }
//
// async fn continue_slave() {
//
// }
//
// async fn rescind_slave() {
//
// }

async fn retrieve(old_version: i32) {
    // if old_version is latest, just tell them that
}

/* based off of https://github.com/tokio-rs/axum/blob/main/examples/jwt/src/main.rs */
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    init_log();

    if !Sqlite::database_exists(DATABASE_URL).await.expect("Error checkin") {
        Sqlite::create_database(DATABASE_URL).await.expect("Error creating database");
    }

    let db = SqlitePool::connect(DATABASE_URL).await.expect("Error connecting to database");
    create_tables(&db).await;

    let state = AppState::new(Arc::new(db))?;

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
    db.execute("
        CREATE TABLE IF NOT EXISTS
        users (
            id  BIGINT PRIMARY KEY NOT NULL,
            username          TEXT NOT NULL UNIQUE,
            password_digest   TEXT NOT NULL,
            role            BIGINT NOT NULL,
            creation_date     DATE NOT NULL
        );"
    )
        .await.expect("Error creating initial table");

    db.execute("
        CREATE INDEX IF NOT EXISTS
        username_index ON users(username);"
    )
        .await.expect("Error creating initial index");
}
