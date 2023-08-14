use std::fs;
use axum::body::Body;
use axum::http::Request;
use axum::Json;
use serde::{Serialize};
use crate::state::Error;

pub async fn status() -> &'static str {
    "OK"
}

#[derive(Debug, Serialize)]
pub struct DBStats {
    db_bytes: i32,
    log_bytes: i32
}

pub async fn stats(request: Request<Body>) -> Result<Json<DBStats>, Error> {
    let path = request.uri().path();
    let mut service = path.split("/");
    service.next(); /* bypass first region */
    let next = service.next().ok_or(Error::ServerError("Invalid Path".to_string()))?;

    let db= next.to_string() + ".db";
    let log = "log/".to_string() + next + ".log";

    let meta_db = match fs::metadata(db) {
        Ok(metadata) => metadata.len(),
        Err(_) => 0
    } as i32;

    let meta_log = match fs::metadata(log) {
        Ok(metadata) => metadata.len(),
        Err(_) => 0
    } as i32;

    Ok(Json(DBStats {
        db_bytes: meta_db,
        log_bytes: meta_log
    }))
}