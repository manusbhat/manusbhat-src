use std::net::SocketAddr;
use std::time::SystemTimeError;
use std::ops::Add;
use rand_core::{OsRng, RngCore};
use argon2::{
    password_hash::{
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};
use axum::{
    routing::{get, post, delete}, 
    Router, Json, async_trait, 
    extract::{FromRequestParts, State}, 
    TypedHeader, 
    headers::{Authorization, authorization::Bearer}, 
    http::request::Parts, 
    RequestPartsExt
};
use jsonwebtoken::{encode, Header, decode, Validation};
use sqlx::{sqlite::SqlitePool, Sqlite, migrate::MigrateDatabase};
use serde::{Deserialize, Serialize};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tower_http::trace::TraceLayer;


use esoteric_back::{status, Error, AppState, AdminServerClaim, RootAdminClaim, REFRESH_TOKEN_EXPIRATION_SECONDS};

const DATABASE_URL: &str = "sqlite:auth.db";
const PORT: u16 = 3192;

#[derive(Debug, Deserialize)]
struct Credentials {
    username: String,
    password: String
}

#[derive(Debug, Serialize)]
struct AuthorizeResult {
    id: i64,
    username: String,
    access_claim: AdminServerClaim,
    access_token: String,
    refresh_claim: RefreshClaim,
    refresh_token: String
}

#[derive(Debug, Serialize)]
struct ReauthorizeResult {
    access_claim: AdminServerClaim,
    access_token: String
}

#[derive(Debug, Serialize, Deserialize)]
struct RefreshClaim {
    id: i64,
    token_type: String,
    exp: u64
}

impl RefreshClaim {
    fn new(id: i64) -> Result<Self, SystemTimeError> {
        Ok(Self {
            id,
            token_type: "refresh".to_string(),
            exp: std::time::SystemTime::now()
                    .add(REFRESH_TOKEN_EXPIRATION_SECONDS)
                    .duration_since(std::time::UNIX_EPOCH)?
                    .as_secs()
        })
    }   

    fn id(&self) -> i64 {
        self.id
    }

    fn exp(&self) -> u64 {
        self.exp
    }
}

#[async_trait]
impl FromRequestParts<AppState> for RefreshClaim {
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, _state: &AppState) -> Result<Self, Self::Rejection> {
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| Error::InvalidToken())?;

        // Decode the user data
        let token_data = decode::<Self>(bearer.token(), &_state.public_key(), &Validation::default())
            .map_err(|_| Error::InvalidToken())?;

        Ok(token_data.claims)
    }
}

async fn authorize(State(handle): State<AppState>, Json(payload): Json<Credentials>) -> Result<Json<AuthorizeResult>, Error> {
    // Check if the user sent the credentials
    if payload.username.is_empty() || payload.password.is_empty() {
        return Err(Error::InvalidCredentials());
    }

    /* salt not used since digest contains salt, but still kept for now */
    let (id, password_digest, access): (i64, String, i64) = sqlx::query_as(
        "SELECT id, password_digest, role FROM users WHERE username = ?"
    )
        .bind(payload.username.clone())
        .fetch_one(handle.db())
        .await
        .map_err(|_| Error::InvalidCredentials())?;
    
    // Check if the password is correct
    let argon = Argon2::default();
    let true_password = PasswordHash::new(&password_digest)
        .map_err(|_| Error::ServerError("Could not decode password digest".to_string()))?;
    
    if argon.verify_password(payload.password.as_bytes(), &true_password).is_err() {
        return Err(Error::InvalidCredentials());
    }

    /* successful credentials */

    let claims = AdminServerClaim::new(id,  payload.username.clone(), access)
        .map_err(|_| Error::ServerError("Could not create access token".to_string()))?;
    let refresh_claims = RefreshClaim::new(id)
        .map_err(|_| Error::ServerError("Could not create refresh token".to_string()))?;

    // Create the access token
    let access_token = encode(&Header::default(), &claims, handle.private_key())
        .map_err(|_| Error::ServerError("Could not create access token".to_string()))?;

    let refresh_token = encode(&Header::default(), &refresh_claims, handle.private_key())
        .map_err(|_| Error::ServerError("Could not create refresh token".to_string()))?; 

    // Send the authorized token
    Ok(Json(AuthorizeResult {
        id,
        username: payload.username,
        access_claim: claims,
        access_token,
        refresh_claim: refresh_claims,
        refresh_token
    }))
}

async fn reauthorize(State(handle): State<AppState>, refresh_claim: RefreshClaim) -> Result<Json<ReauthorizeResult>, Error> {
    let (access, username): (i64, String) = sqlx::query_as(
        "SELECT role, username FROM users WHERE id = ?"
    )
        .bind(refresh_claim.id)
        .fetch_one(handle.db())
        .await
        .map_err(|_| Error::InvalidCredentials())?;

    let claims: AdminServerClaim = AdminServerClaim::new(refresh_claim.id, username, access)
        .map_err(|_| Error::ServerError("Could not create access token".to_string()))?;

    // Create the access token
    let access_token = encode(&Header::default(), &claims, handle.private_key())
        .map_err(|_| Error::ServerError("Could not create access token".to_string()))?;

    // Send the authorized token
    Ok(Json(ReauthorizeResult {
        access_claim: claims,
        access_token
    }))
}

#[derive(Debug, Deserialize)]
struct UserCreateIn {
    username: String,
    password: String,
    access: i64
}

async fn user_create(State(handle): State<AppState>, _: RootAdminClaim, Json(user): Json<UserCreateIn>) -> Result<(), Error> {
    /* create with password */
    /* we use i32 to avoid javascript loss of precision */
    let id = (OsRng::default().next_u64() % (i32::MAX as u64)) as i64;
    let salt = SaltString::generate(&mut OsRng);
    let argon = Argon2::default();
    let password_digest = argon.hash_password(user.password.as_bytes(), &salt)
        .map_err(|_| Error::ServerError("Could not hash password".to_string()))?;
    let role = user.access;

    sqlx::query("INSERT INTO users (id, username, password_digest, role) VALUES (?, ?, ?, ?)")
        .bind(id)
        .bind(user.username)
        .bind(password_digest.to_string())
        .bind(role)
        .execute(handle.db())
        .await
        .map_err(|_| Error::ServerError("Could not create user".to_string()))?;

    Ok(())
}

async fn user_delete(State(handle): State<AppState>,  _: RootAdminClaim, Json(username): Json<String>) -> Result<(), Error> {
    /* delete user from database */
    sqlx::query("DELETE FROM users WHERE username = ?")
        .bind(username)
        .execute(handle.db())
        .await
        .map_err(|_| Error::ServerError("Could not delete user".to_string()))?;

    Ok(())
}

#[derive(Debug, Deserialize, Serialize)]
struct UsersResultItem {
    id: i64,
    username: String,
    access: i64
}

async fn users(State(handle): State<AppState>, _: RootAdminClaim) -> Result<Json<Vec<UsersResultItem>>, Error> {
    Ok(Json(sqlx::query_as("SELECT id, username, role FROM users")
        .fetch_all(handle.db())
        .await
        .map_err(|_| Error::ServerError("Could not fetch user".to_string()))?
        .into_iter()
        .map(|(id, username, access)| UsersResultItem {id, username, access })
        .collect()
    ))
}

/* based off of https://github.com/tokio-rs/axum/blob/main/examples/jwt/src/main.rs */
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    if !Sqlite::database_exists(DATABASE_URL).await.expect("Error checkin") {
        Sqlite::create_database(DATABASE_URL).await.expect("Error creating database");
    }

    let db = SqlitePool::connect(DATABASE_URL).await.expect("Error connecting to database");

    sqlx::query("
        CREATE TABLE IF NOT EXISTS 
        users (
            id BIGINT PRIMARY KEY  NOT NULL,
            username          TEXT NOT NULL UNIQUE,
            password_digest   TEXT NOT NULL,
            role            BIGINT NOT NULL
        );"
    )
        .execute(&db).await.expect("Error creating initial table");

    sqlx::query("
        CREATE INDEX IF NOT EXISTS 
        username_index ON users (username);"
    )
        .execute(&db).await.expect("Error creating initial index");

    let state = AppState::new(db)?;

    let app = Router::new()
        .route("/auth/authorize", post(authorize))
        .route("/auth/reauthorize", post(reauthorize))
        .route("/auth/user", post(user_create))
        .route("/auth/user", delete(user_delete))
        .route("/auth/users", get(users))
        .route("/auth/status", get(status))
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], PORT));

    tracing::debug!("axum::init");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}