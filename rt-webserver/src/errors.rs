use axum::{http::StatusCode, response::IntoResponse, Json};
use serde_json::json;

pub enum CustomError {
    InternalServerError,
    BadRequest,
    UserCallNotFound,
    ATCCallNotFound,
    UserAccountNotFound,
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
        };
        (status, Json(json!({"error": error_message}))).into_response()
    }
}
