use axum::{
    extract::Extension,
    routing::{get, post},
    Router, http::Method,
};

use anyhow::Context;
// use with #[debug_handler]
// use axum_macros::debug_handler;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use std::{fs, time::Duration};
use tower::ServiceBuilder;
use tower_http::{timeout::TimeoutLayer, cors::{CorsLayer, Any}};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod controllers;
mod errors;
mod generation;
mod helpers;
mod models;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // let env = fs::read_to_string(".env").unwrap();
    // // log env to console
    // println!("{}", env);
    // let (key, database_url) = env.split_once('=').unwrap();

    // assert_eq!(key, "DATABASE_URL");

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("tower_http=trace")
                .unwrap_or_else(|_| "example_tracing_aka_logging=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Tighten these for production
    let cors = CorsLayer::new()
        // allow `GET` and `POST` when accessing the resource
        .allow_methods([Method::GET, Method::POST])
        // allow any headers
        .allow_headers(Any)
        // allow requests from any origin
        .allow_origin(Any);

    // let pool = PgPoolOptions::new()
    //     .max_connections(50)
    //     .connect(&database_url)
    //     .await
    //     .context("could not connect to database_url")?;

    let app = Router::new()
        .route("/test", get(test))
        .route("/useraccounts", get(controllers::user_account_controller::all_user_accounts))
        .route("/useraccount", post(controllers::user_account_controller::new_user_account))
        .route(
            "/useraccount/:id",
            get(controllers::user_account_controller::user_account)
                .put(controllers::user_account_controller::update_user_account)
                .delete(controllers::user_account_controller::delete_user_account),
        )
        .route(
            "/initialstate",
            post(controllers::simulation_controller::get_initial_state),
        )
        .route("/nextstate", post(controllers::simulation_controller::get_next_state))
        .route("/route/:id", get(controllers::simulation_controller::get_route_points))
        .layer(
            ServiceBuilder::new()
                // .layer(Extension(pool))
                .layer(TraceLayer::new_for_http())
                .layer(TimeoutLayer::new(Duration::from_secs(5)))
                .layer(cors),
        );

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    tracing::debug!("Listening on {}", addr);
    axum::serve(listener, app).await.unwrap();

    Ok(())
}

async fn test() -> &'static str {
    "Hello, World!"
}
