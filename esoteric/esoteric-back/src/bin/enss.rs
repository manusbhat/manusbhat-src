use std::net::SocketAddr;
use std::sync::Arc;

use axum::{
    routing::{get, post, delete}, 
    Router, Extension, Json, middleware::AddExtension
};

use esoteric_back::{status};

use sqlx::{sqlite::SqlitePool, Pool, Sqlite};
use serde::{Deserialize, Serialize};

const DATABASE_URL: &str = "sqlite://enss.db";
const PORT: u16 = 3193;


// struct State {
//     // db_pool: sqlx::sqlite::SqlitePool,
//     public_key: i32,
//     public_value: i32
// }

// enum AuthError {
//     InvalidCredentials(),
//     InvalidToken(),

//     SQLError(sqlx::Error),
// }

// type Username = String;

// #[derive(Deserialize, Serialize)]
// struct UserCredentials {
//     username: Username,
//     password: String,
//     access: i32
// }

// async fn seed_token(handle: Extension<Arc<State>>) {
//     /* verify user password for username */

//     /* sign refresh token and current token */
// }

// async fn refresh_token(handle: Extension<Arc<State>>) {
//     /* verify refresh token */

//     /* ensure has not been deleted */

//     /* sign token */
// }

// async fn user_create(Json(user): Json<UserCredentials>, handle: Extension<Arc<State>>) -> Result<(), AuthError> {
//     /* create with password */
//     handle.db_pool.execute("INSERT INTO users (username, password) VALUES (?, ?)", user.username, user.password)
//         .await?;
// }

// async fn user_delete(Json(user): Json<Username>, handle: Extension<Arc<State>>) -> Result<(), AuthError> {
//     /* delete user from database */
//     handle.db_pool
//         .execute("DELETE FROM users WHERE username = ?")
//         .await?;
// }


/* based off of https://github.com/tokio-rs/axum/blob/main/examples/jwt/src/main.rs */
#[tokio::main]
async fn main() {
    // let state = Arc::new(State {
    //     db_pool: sqlx::sqlite::SqlitePoolOptions::new()
    //         .await
    //         .unwrap(),
    //     public_key: 0,
    //     public_value: 0
    // });

    let app = Router::new()
    //     .route("/authorize", post(seed_token))
    //     .route("/reauthorize", get(refresh_token))
    //     .route("/user", post(user_create))
    //     .route("/user", delete(user_delete))
        .route("/enss/status", get(status));
        // .layer(AddExtension::new(state));

    /* localhost:3000 */
    let addr = SocketAddr::from(([127, 0, 0, 1], PORT));
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
