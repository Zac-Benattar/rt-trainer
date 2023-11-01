use axum::extract::Path;
use axum::http::StatusCode;
use axum::response::IntoResponse;

use axum::{Extension, Json};
use serde_json::{json, Value};
use sqlx::PgPool;

use crate::{errors::CustomError, models::radiocall};

pub async fn all_user_calls(Extension(pool): Extension<PgPool>) -> impl IntoResponse {
    let sql = "SELECT * FROM userradiocall ".to_string();

    let usercall = sqlx::query_as::<_, radiocall::UserCall>(&sql)
        .fetch_all(&pool)
        .await
        .unwrap();

    (StatusCode::OK, Json(usercall))
}

pub async fn new_user_call(
    Json(usercall): Json<radiocall::NewUserCall>,
    Extension(pool): Extension<PgPool>,
) -> Result<(StatusCode, Json<radiocall::UserCall>), CustomError> {
    if usercall.callsign.is_empty() {
        return Err(CustomError::BadRequest);
    }
    let sql = "INSERT INTO task (task) values ($1)";

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
    let sql = "SELECT * FROM task where id=$1".to_string();

    let task: radiocall::UserCall = sqlx::query_as(&sql)
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| CustomError::UserCallNotFound)?;

    Ok(Json(task))
}

// Required for say again
pub async fn update_user_call(
    Path(id): Path<i32>,
    Json(usercall): Json<radiocall::UpdateUserCall>,
    Extension(pool): Extension<PgPool>,
) -> Result<(StatusCode, Json<radiocall::UpdateUserCall>), CustomError> {
    let sql = "SELECT * FROM task where id=$1".to_string();

    let _find: radiocall::UserCall = sqlx::query_as(&sql)
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| CustomError::UserCallNotFound)?;

    sqlx::query("UPDATE task SET task=$1 WHERE id=$2")
        .bind(&usercall.task)
        .bind(id)
        .execute(&pool)
        .await;

    Ok((StatusCode::OK, Json(usercall)))
}

pub async fn delete_user_call(
    Path(id): Path<i32>,
    Extension(pool): Extension<PgPool>,
) -> Result<(StatusCode, Json<Value>), CustomError> {
    let _find: radiocall::UserCall = sqlx::query_as("SELECT * FROM task where id=$1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| CustomError::UserCallNotFound)?;

    sqlx::query("DELETE FROM task WHERE id=$1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| CustomError::UserCallNotFound)?;

    Ok((StatusCode::OK, Json(json!({"msg": "UserCall Deleted"}))))
}
