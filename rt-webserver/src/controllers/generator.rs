use axum::extract::Path;
use axum::http::StatusCode;
use axum::response::IntoResponse;

use axum::{Extension, Json};
// use axum_macros::debug_handler;
use serde_json::{json, Value};
use sqlx::PgPool;

use crate::helpers::jsoncheckers::validate_usercall_json;
use crate::{errors::CustomError, models::radiocall};

pub async fn handshake(
    Extension(pool): Extension<PgPool>,
    Json(usercall): Json<radiocall::NewUserCall>,
) -> Result<(StatusCode, Json<radiocall::NewATCCall>), CustomError> {

    if validate_usercall_json(Json(usercall)) {
        return Err(CustomError::BadRequest);
    }

    
    let radiocall = "";

    (StatusCode::OK, Json(radiocall))
}
