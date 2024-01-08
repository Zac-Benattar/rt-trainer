use std::fmt;

use axum::{http::StatusCode, response::IntoResponse, Json};
use serde_json::json;

use crate::models::aerodrome::Aerodrome;

pub enum CustomError {
    InternalServerError,
    BadRequest,
    UserCallNotFound,
    ATCCallNotFound,
    UserAccountNotFound,
    ATCCallGenerationError,
    OtherAircraftCallGenerationError,
    WrongTarget,
}

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let string_version = match self {
            Self::InternalServerError => "Internal Server Error",
            Self::BadRequest => "Bad Request",
            Self::UserCallNotFound => "UserCall Not Found",
            Self::ATCCallNotFound => "ATCCall Not Found",
            Self::UserAccountNotFound => "UserAccount Not Found",
            Self::ATCCallGenerationError => "ATC Call Generation Error",
            Self::OtherAircraftCallGenerationError => "Other Aircraft Call Generation Error",
            Self::WrongTarget => "Wrong Target",
        };
        write!(f, "{}", string_version)
    }
}

impl IntoResponse for CustomError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message) = match self {
            Self::InternalServerError => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error")
            }
            Self::BadRequest => (StatusCode::BAD_REQUEST, "Bad Request"),
            Self::UserCallNotFound => (StatusCode::NOT_FOUND, "UserCall Not Found"),
            Self::ATCCallNotFound => (StatusCode::NOT_FOUND, "ATCCall Not Found"),
            Self::UserAccountNotFound => (StatusCode::NOT_FOUND, "UserAccount Not Found"),
            Self::ATCCallGenerationError => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "ATC Call Generation Error",
            ),
            Self::OtherAircraftCallGenerationError => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Other Aircraft Call Generation Error",
            ),
            Self::WrongTarget => (StatusCode::EXPECTATION_FAILED, "Wrong Target"),
        };
        (status, Json(json!({"error": error_message}))).into_response()
    }
}
