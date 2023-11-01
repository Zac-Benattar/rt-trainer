use axum::extract::Path;
use axum::http::StatusCode;
use axum::response::IntoResponse;

use axum::{Extension, Json};
use axum_macros::debug_handler;
use serde_json::{json, Value};
use sqlx::PgPool;

use crate::{errors::CustomError, models::radiocall};

pub async fn all_user_calls(Extension(pool): Extension<PgPool>) -> impl IntoResponse {
    let sql = "SELECT * FROM usercall ".to_string();

    let usercall = sqlx::query_as::<_, radiocall::UserCall>(&sql)
        .fetch_all(&pool)
        .await
        .unwrap();

    (StatusCode::OK, Json(usercall))
}

pub async fn new_user_call(
    Extension(pool): Extension<PgPool>,
    Json(usercall): Json<radiocall::NewUserCall>,
) -> Result<(StatusCode, Json<radiocall::NewUserCall>), CustomError> {
    if usercall.callsign.is_empty() || usercall.target.is_empty() || usercall.message.is_empty() {
        return Err(CustomError::BadRequest);
    }
    let sql = "INSERT INTO usercall (callsign, target, message) values ($1, $2, $3)";

    let _ = sqlx::query(&sql)
        .bind(&usercall.callsign)
        .bind(&usercall.target)
        .bind(&usercall.message)
        .execute(&pool)
        .await
        .map_err(|_| CustomError::InternalServerError)?;

    Ok((StatusCode::CREATED, Json(usercall)))
}

pub async fn user_call(
    Path(id): Path<i32>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<radiocall::UserCall>, CustomError> {
    let sql = "SELECT * FROM usercall where id=$1".to_string();

    let usercall: radiocall::UserCall = sqlx::query_as(&sql)
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| CustomError::UserCallNotFound)?;

    Ok(Json(usercall))
}

// Required for say again
pub async fn update_user_call(
    Path(id): Path<i32>,
    Extension(pool): Extension<PgPool>,
    Json(usercall): Json<radiocall::UpdateUserCall>,
) -> Result<(StatusCode, Json<radiocall::UpdateUserCall>), CustomError> {
    let sql = "SELECT * FROM usercall where id=$1".to_string();

    let _find: radiocall::UserCall = sqlx::query_as(&sql)
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| CustomError::UserCallNotFound)?;

    sqlx::query("UPDATE usercall SET callsign=$1, target=$2, message=$3 WHERE id=$4")
        .bind(&usercall.callsign)
        .bind(&usercall.target)
        .bind(&usercall.message)
        .bind(id)
        .execute(&pool)
        .await;

    Ok((StatusCode::OK, Json(usercall)))
}

pub async fn delete_user_call(
    Path(id): Path<i32>,
    Extension(pool): Extension<PgPool>,
) -> Result<(StatusCode, Json<Value>), CustomError> {
    let _find: radiocall::UserCall = sqlx::query_as("SELECT * FROM usercall where id=$1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| CustomError::UserCallNotFound)?;

    sqlx::query("DELETE FROM usercall WHERE id=$1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| CustomError::UserCallNotFound)?;

    Ok((StatusCode::OK, Json(json!({"msg": "UserCall Deleted"}))))
}
