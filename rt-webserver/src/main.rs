use axum::{
    extract::Extension,
    routing::{delete, get, post, put},
    Router,
};

use anyhow::Context;
use sqlx::postgres::PgPoolOptions;
use std::fs;
use std::net::SocketAddr;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod controllers;
mod errors;
mod models;
mod helpers;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let env = fs::read_to_string(".env").unwrap();
    let (key, database_url) = env.split_once('=').unwrap();

    assert_eq!(key, "DATABASE_URL");

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("tower_http=trace")
                .unwrap_or_else(|_| "example_tracing_aka_logging=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let pool = PgPoolOptions::new()
        .max_connections(50)
        .connect(&database_url)
        .await
        .context("could not connect to database_url")?;

    // eventually nest routes so /:scenarioinstance/:usercall/ and /:scenarioinstance/:atccall are routes
    let app = Router::new()
        .route("/hello", get(root))
        .route("/usercalls", get(controllers::radiocall::all_user_calls))
        .route("/usercall", post(controllers::radiocall::new_user_call))
        .route(
            "/usercall/:id",
            get(controllers::radiocall::user_call)
                .put(controllers::radiocall::update_user_call)
                .delete(controllers::radiocall::delete_user_call),
        )
        .route("/useraccounts", get(controllers::user::all_user_accounts))
        .route("/useraccount", post(controllers::user::new_user_account))
        .route(
            "/useraccount/:id",
            get(controllers::user::user_account)
                .put(controllers::user::update_user_account)
                .delete(controllers::user::delete_user_account),
        )
        .route("/handshake/:seed/", get(controllers::generator::handshake))
        .layer(Extension(pool))
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::debug!("Listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}

async fn root() -> &'static str {
    "Hello, World!"
}
