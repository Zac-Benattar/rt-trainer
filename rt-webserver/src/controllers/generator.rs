use axum::http::StatusCode;

use axum::{Extension, Json};
// use axum_macros::debug_handler;
use sqlx::PgPool;

use crate::helpers::jsoncheckers::empty_usercall_json;
use crate::{errors::CustomError, models::radiocall};

pub async fn handshake(
    Extension(pool): Extension<PgPool>,
    Json(usercall): Json<radiocall::NewUserCall>,
) -> Result<(StatusCode, Json<radiocall::NewATCCall>), CustomError> {

    // Filter out empty json
    if empty_usercall_json(Json(&usercall)) {
        return Err(CustomError::BadRequest);
    }

    // Filter out cases where target_stated is not target_actual
    if usercall.target_stated != usercall.target_actual {
        return Err(CustomError::WrongTarget);
    }

    let mut return_message = "";

    if usercall.message == "request zone transit" {
        return_message = "pass your message";
    }

    let radiocall = radiocall::NewATCCall {
        message: return_message.to_owned(),
        target_stated: usercall.callsign_stated,
        callsign: usercall.target_actual,
        target_actual: usercall.callsign_actual,
    };

    Ok((StatusCode::OK, Json(radiocall)))
}
