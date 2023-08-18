
/* kind of inefficient to be honest, but we don't have that many problems so this is a fine setup */
/* also deletes and renames (for problems, problem_sets renames are fine) for now are kind of bad */
use std::fs;
use chrono::{DateTime, NaiveDateTime, Utc};
use sqlx::{Executor, SqlitePool};
use tokio::process::Command;
use esoteric_back::markup::process_markup_meta;
use crate::PROBLEM_SETS;

pub async fn create_tables(db: &SqlitePool) {
    /* problem set table */
    db.execute("
        CREATE TABLE IF NOT EXISTS
        problem_sets(
            id TEXT PRIMARY KEY NOT NULL
        );")
        .await.expect("Could not create problem set table");


    /* problem table */
    db.execute("
        CREATE TABLE IF NOT EXISTS
        problems (
            id TEXT PRIMARY KEY NOT NULL,
            problem_set_id TEXT NOT NULL,
            rating          INT NOT NULL,
            kb_limit        INT NOT NULL,
            ms_limit        INT NOT NULL,
            statement_release   DATE,
            submission_close    DATE,

            FOREIGN KEY(problem_set_id) REFERENCES problem_sets(id)
        );")
        .await.expect("Could not create problem table");

    db.execute("
        CREATE INDEX IF NOT EXISTS
        problems_parent_index ON problems(problem_set_id);"
    )
        .await.expect("Error creating problem parent index");

    /* submissions table */
    db.execute("
        CREATE TABLE IF NOT EXISTS
        submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            user_id         BIGINT NOT NULL,
            problem_id        TEXT NOT NULL,
            timestamp         DATE NOT NULL,
            language          TEXT NOT NULL,

            FOREIGN KEY(problem_id) REFERENCES problems(id)
        );")
        .await.expect("Could not create submissions table");

    db.execute("
        CREATE INDEX IF NOT EXISTS
        submissions_parent_index ON submissions(problem_id);"
    )
        .await.expect("Error creating submission parentindex");

    /* test_case_result table */
    db.execute("
        CREATE TABLE IF NOT EXISTS
        test_case_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            submission_id    BIGINT NOT NULL,
            status              INT NOT NULL,
            kb_used             INT NOT NULL,
            ms_used             INT NOT NULL,

            FOREIGN KEY(submission_id) REFERENCES submissions(id)
        );")
        .await.expect("Could not create test case results table");

    db.execute("
        CREATE INDEX IF NOT EXISTS
        test_case_parent_index ON test_case_results(submission_id);"
    )
        .await.expect("Error creating test case parent index");
}

pub async fn resync(db: &SqlitePool) {
    let problem_sets = fs::read_dir(PROBLEM_SETS).unwrap()
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.file_name().to_str().unwrap().to_string());

    for problem_set in problem_sets {
        /* resync list of problems */
        let problems = fs::read_dir(PROBLEM_SETS.to_string() + "/" + &problem_set).unwrap()
            .filter_map(|entry| entry.ok())
            .map(|entry| entry.file_name().to_str().unwrap().to_string());

        sqlx::query("INSERT OR REPLACE INTO problem_sets(id) VALUES (?)")
            .bind(problem_set.clone())
            .execute(db)
            .await
            .expect("Could not insert problem set");

        for problem in problems {
            let file_contents = fs::read_to_string(PROBLEM_SETS.to_string() + "/" + &problem_set + "/" + &problem + "/ok.cpp").unwrap();
            let mut cached = false;
            if let Ok(cache_contents) = fs::read_to_string(PROBLEM_SETS.to_string() + "/" + &problem_set + "/" + &problem + "/ok.cpp.cache") {
                if file_contents == cache_contents {
                    cached = true
                }
            }

            /* compile ok.cpp */
            if !cached {
                let status = Command::new("g++")
                    .current_dir("./problem_sets/".to_string() + &problem_set + "/" + &problem)
                    .arg("-o").arg("ok.o")
                    .arg("-I").arg("../../../libgrade")
                    .arg("-std=c++20")
                    .arg("ok.cpp")
                    .status()
                    .await
                    .expect("Grader should be compilable");

                if !status.success() {
                    panic!("Grader should be compilable");
                }

                fs::copy("./problem_sets/".to_string() + &problem_set + "/" + &problem + "/ok.cpp",
                         "./problem_sets/".to_string() + &problem_set + "/" + &problem + "/ok.cpp.cache").unwrap();
            }

            let headers =
                process_markup_meta(&(PROBLEM_SETS.to_string() + "/" + &problem_set + "/" + &problem + "/index.md"));

            let open: Option<DateTime<Utc>> = headers
                .get("open")
                .and_then(|value| NaiveDateTime::parse_from_str(value, "%Y-%m-%dT%H:%M").ok())
                .map(|naive_datetime| DateTime::from_utc(naive_datetime, Utc));

            let close: Option<DateTime<Utc>> = headers
                .get("close")
                .and_then(|value| NaiveDateTime::parse_from_str(value, "%Y-%m-%dT%H:%M").ok())
                .map(|naive_datetime| DateTime::from_utc(naive_datetime, Utc));

            let rating: i32 = headers
                .get("rating").unwrap_or(&"0".to_string())
                .parse().unwrap_or(0);

            let ms_limit = headers
                .get("ms_limit").unwrap_or(&"0".to_string())
                .parse().unwrap_or(0);

            let kb_limit = headers
                .get("kb_limit").unwrap_or(&"0".to_string())
                .parse().unwrap_or(0);

            sqlx::query("
                    INSERT OR REPLACE INTO
                    problems(id, problem_set_id, rating, kb_limit, ms_limit, statement_release, submission_close)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ")
                .bind(problem)
                .bind(problem_set.clone())
                .bind(rating)
                .bind(kb_limit)
                .bind(ms_limit)
                .bind(open)
                .bind(close)
                .execute(db)
                .await
                .expect("Could not insert problem");
        }
    }
}

