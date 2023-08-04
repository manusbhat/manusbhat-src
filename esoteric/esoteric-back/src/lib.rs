use std::{
    env,
    result::Result, fmt::Display
};
use std::ops::Add;
use std::time::{Duration, SystemTimeError};
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json, RequestPartsExt
};
use axum::{
    headers::{authorization::Bearer, Authorization},
    TypedHeader,
};
use jsonwebtoken::{
    decode,
    DecodingKey, 
    EncodingKey, Validation, 
};
use sqlx::sqlite;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Clone)]
pub struct AppState {
    db: sqlite::SqlitePool,
    private_key: EncodingKey,
    public_key: DecodingKey
}

impl AppState {
    pub fn db(&self) -> &sqlite::SqlitePool {
        &self.db
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

    ServerError(String),

    InsufficientPermissions(),
}

impl std::error::Error for Error {}

#[derive(Deserialize, Serialize)]
pub struct UserCredentials {
    username: String,
    password: String,
    access: u64
}

pub const CLAIM_ZERO_ACCESS: i64 =   0i64;
pub const CLAIM_FULL_ACCESS: i64 = 255i64;

pub const REFRESH_TOKEN_EXPIRATION_SECONDS: Duration = Duration::new(30 * 24 * 60 * 60, 0);
pub const ACCESS_TOKEN_EXPIRATION_SECONDS: Duration = Duration::new(30 * 24 * 60 * 60, 0);


/* direct from server */
#[derive(Debug, Serialize, Deserialize)]
pub struct AdminServerClaim {
    id: i64,
    username: String,
    token_type: String,
    access: i64,
    exp: u64
}

/* comes from client, although originally signed by server */
#[derive(Debug)]
pub struct AdminClientClaim<const L: i64 = 0>{
    id: i64,
    token_type: String,
    exp: u64
}

impl AdminClientClaim {
    pub fn token_type(&self) -> &str {
        &self.token_type
    }

    pub fn exp(&self) -> u64 {
        self.exp
    }
}

pub type UserClaim = AdminClientClaim< { CLAIM_ZERO_ACCESS } >;
pub type RootAdminClaim = AdminClientClaim< { CLAIM_FULL_ACCESS } >;

impl AdminServerClaim {
    pub fn new(id: i64, username: String, access: i64) -> Result<Self, SystemTimeError> {
        Ok(Self {
            id,
            username,
            token_type: "access".to_string(),
            access,
            exp: std::time::SystemTime::now()
                    .add(ACCESS_TOKEN_EXPIRATION_SECONDS)
                    .duration_since(std::time::UNIX_EPOCH)?
                    .as_secs()
        })
    }
}

impl<const L: i64> AdminClientClaim<L> {
    pub fn new(server: AdminServerClaim) -> Result<Self, Error> {
        if (server.access & L) != L {
            return Err(Error::InsufficientPermissions());
        }

        Ok(Self {
            id: server.id,
            token_type: server.token_type,
            exp: server.exp
        })
    }
}

/* https://github.com/tokio-rs/axum/blob/main/examples/jwt/src/main.rs */
#[async_trait]
impl<const L: i64> FromRequestParts<AppState> for AdminClientClaim<L> { 
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, _state: &AppState) -> Result<Self, Self::Rejection> {
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| Error::InvalidToken())?;

        // Decode the user data into a server claim
        let token_data = decode::<AdminServerClaim>(bearer.token(), &_state.public_key, &Validation::default())
            .map_err(|_| Error::InvalidToken())?;

        // convert the server claim to a client claim
        AdminClientClaim::new(token_data.claims)
    }
}

impl Error {
    fn message(&self) -> &str {
        match self {
            Error::InvalidCredentials() =>        "Invalid username or password",
            Error::InvalidToken() =>              "Invalid token",
            Error::InsufficientPermissions() =>   "Missing permissions",
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
            Error::InvalidToken() =>              StatusCode::BAD_REQUEST,
            Error::InsufficientPermissions() =>   StatusCode::BAD_REQUEST,
            Error::ServerError(_) =>              StatusCode::INTERNAL_SERVER_ERROR
        };

        let body = Json(json!({ "error": self.message() }));

        (status, body).into_response()
    }
}

impl AppState {
    pub fn new(db: sqlite::SqlitePool) ->  Result<AppState, env::VarError> {
        let keyseed = env::var("ESOTERIC_AUTH_KEYSEED")?;
    
        let private_key = EncodingKey::from_secret(keyseed.as_bytes());
        let public_key  = DecodingKey::from_secret(keyseed.as_bytes()); 
        
        Ok(AppState {
            db,
            private_key,
            public_key
        })
    }
}

pub async fn status() -> &'static str {
    "OK"
}