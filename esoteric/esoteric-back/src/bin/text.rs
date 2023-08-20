use std::collections::HashMap;
use std::fs;
use std::net::SocketAddr;
use std::sync::Arc;


use axum::{routing::{get}, Router, Json};
use axum::extract::Path;
use serde::{Deserialize, Serialize};
use sqlx::{Executor, Sqlite, SqlitePool};
use sqlx::migrate::MigrateDatabase;
use tower_http::trace::TraceLayer;
use tower_http::services::ServeDir;


use esoteric_back::handlers::{stats, status};
use esoteric_back::logging::init_log;
use esoteric_back::state::{AppState, Error};

const DATABASE_URL: &str = "sqlite:text.db";
const PORT: u16 = 3195;

type TagName = String;
type ArticleName = String;

async fn blob(Path((tag, blob)): Path<(TagName, ArticleName)>) -> Result<Json<String>, Error> {
    let blob = fs::read_to_string(format!("./tags/{}/{}", tag, blob))
        .map_err(|_| Error::ServerError("Error reading blob".to_string()))?;

    Ok(Json(blob))
}

async fn tags() -> Result<Json<HashMap<TagName, Vec<ArticleName>>>, Error> {
    // not really sure i like functional programming...
    // wtf is this
    let tags = fs::read_dir("./tags")
        .map_err(|_| Error::ServerError("Error reading tags directory".to_string()))?
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_dir())
        .map(|tag| {
            let dir_name = tag.file_name().to_string_lossy().to_string();
            let articles = fs::read_dir(tag.path())
                .map(|articles| {
                    articles
                        .filter_map(|article| article.ok())
                        .filter_map(|article| {
                            let article_name = article.file_name().to_string_lossy().to_string();

                            if article_name.ends_with(".md") {
                                Some(article_name)
                            } else {
                                None
                            }
                        })
                        .collect()
                })
                .unwrap_or_else(|_| Vec::new());

            (dir_name, articles)
        })
        .collect();

    Ok(Json(tags))
}

/* based off of https://github.com/tokio-rs/axum/blob/main/examples/jwt/src/main.rs */
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>>  {
    init_log();

    if !Sqlite::database_exists(DATABASE_URL).await.expect("Error checkin") {
        Sqlite::create_database(DATABASE_URL).await.expect("Error creating database");
    }

    let db = SqlitePool::connect(DATABASE_URL).await.expect("Error connecting to database");
    create_tables(&db).await;

    let state = AppState::new(Arc::new(db))?;

    let app = Router::new()
        .route("/text/", get(tags))
        .route("/text/:tag/:blob", get(blob))
        .nest_service("/text/static/", ServeDir::new("tags/"))
        /* health functions */
        .route("/text/status", get(status))
        .route("/text/stats", get(stats))
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], PORT));

    println!("text::init");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}

async fn create_tables(db: &SqlitePool) {
    // for now just do file io, now db
}