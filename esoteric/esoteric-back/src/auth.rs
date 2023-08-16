use std::ops::Add;
use std::time::{Duration, SystemTimeError};
use axum::{TypedHeader, http::request::Parts, headers::authorization::Bearer, headers::Authorization, extract::FromRequestParts, async_trait, RequestPartsExt};
use jsonwebtoken::{decode, Validation};
use serde::{Deserialize, Serialize};
use crate::state::{AppState, Error};

#[derive(Deserialize, Serialize)]
pub struct UserCredentials {
    username: String,
    password: String,
    access: u64
}

pub const CLAIM_ZERO_ACCESS: i64 =   0i64;
pub const CLAIM_FULL_ACCESS: i64 = 255i64;

pub const REFRESH_TOKEN_EXPIRATION_SECONDS: Duration = Duration::new(30 * 24 * 60 * 60, 0);
pub const INTERNAL_TOKEN_EXPIRATION_SECONDS: Duration = Duration::new(30 * 24 * 60 * 60, 0);
pub const ACCESS_TOKEN_EXPIRATION_SECONDS: Duration = Duration::new(10 * 60, 0);


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
    access: i64,
    token_type: String,
    exp: u64
}

impl AdminClientClaim {
    pub fn id(&self) -> i64 {
        self.id
    }
    
    pub fn token_type(&self) -> &str {
        &self.token_type
    }

    pub fn access(&self) -> i64 {
        self.access
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
            access: server.access,
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
        let token_data = decode::<AdminServerClaim>(bearer.token(), _state.public_key(), &Validation::default())
            .map_err(|_| Error::InvalidToken())?;

        // convert the server claim to a client claim
        AdminClientClaim::new(token_data.claims)
    }
}
