use std::env;
use std::fmt::Display;
use std::sync::Arc;
use axum::http::StatusCode;
use axum::Json;
use axum::response::{IntoResponse, Response};
use jsonwebtoken::{DecodingKey, EncodingKey};
use serde_json::json;
use sqlx::sqlite;


pub type UserID = i64;

pub type ProblemSetID = String;
pub type ProblemID = String;
pub type SubmissionID = i32;
pub type TestCaseID = i32;

#[derive(Clone)]
pub struct AppState<T = ()> where T: Sync {
    db: Arc<sqlite::SqlitePool>,
    private_key: EncodingKey,
    public_key: DecodingKey,

    // non shared state
    pub aux: T
}

impl<T: Sync> AppState<T> {
    pub fn db(&self) -> &sqlite::SqlitePool {
        &*self.db
    }

    pub fn private_key(&self) -> &EncodingKey {
        &self.private_key
    }

    pub fn public_key(&self) -> &DecodingKey {
        &self.public_key
    }
}

#[derive(Debug)]
pub enum Error {
    InvalidCredentials(),
    InvalidToken(),

    InvalidArgument(String),
    ServerError(String),

    InsufficientPermissions(),
}

impl std::error::Error for Error {}

impl Error {
    fn message(&self) -> &str {
        match self {
            Error::InvalidCredentials() =>        "Invalid username or password",
            Error::InvalidToken() =>              "Invalid token",
            Error::InsufficientPermissions() =>   "Missing permissions",
            Error::InvalidArgument(message) =>      message,
            Error::ServerError(message) =>      message
        }
    }
}

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let message = self.message();
        write!(f, "{}", message)
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let status = match self {
            Error::InvalidCredentials() =>        StatusCode::UNAUTHORIZED,
            Error::InvalidToken() =>              StatusCode::UNAUTHORIZED,
            Error::InsufficientPermissions() =>   StatusCode::BAD_REQUEST,
            Error::InvalidArgument(_) =>          StatusCode::BAD_REQUEST,
            Error::ServerError(_) =>              StatusCode::INTERNAL_SERVER_ERROR
        };

        let body = Json(json!({ "error": self.message() }));

        (status, body).into_response()
    }
}

impl<T: Sync> AppState<T> {
    pub fn new(db: Arc<sqlite::SqlitePool>, aux: T) ->  Result<AppState<T>, env::VarError> {
        let keyseed = env::var("ESOTERIC_AUTH_KEYSEED").expect("ESOTERIC_AUTH_KEYSEED not set");

        let private_key = EncodingKey::from_secret(keyseed.as_bytes());
        let public_key  = DecodingKey::from_secret(keyseed.as_bytes());

        Ok(AppState {
            db,
            private_key,
            public_key,
            aux
        })
    }
}
