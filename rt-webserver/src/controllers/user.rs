use axum::extract::Path;
use axum::http::StatusCode;
use axum::response::IntoResponse;

use axum::{Extension, Json};
// use axum_macros::debug_handler; // insane macro that explains handler errors
use serde_json::{json, Value};
use sqlx::PgPool;

use crate::{errors::CustomError, models::user};

pub async fn all_user_accounts(Extension(pool): Extension<PgPool>) -> impl IntoResponse {
    let sql = "SELECT * FROM useraccount ".to_string();

    let useraccount = sqlx::query_as::<_, user::UserAccount>(&sql)
        .fetch_all(&pool)
        .await
        .unwrap();

    (StatusCode::OK, Json(useraccount))
}

pub async fn new_user_account(
    Extension(pool): Extension<PgPool>,
    Json(useraccount): Json<user::NewUserAccount>,
) -> Result<(StatusCode, Json<user::NewUserAccount>), CustomError> {
    if useraccount.username.is_empty()
        || useraccount.password_hash.is_empty()
        || useraccount.email.is_empty()
        || useraccount.role.is_empty()
    {
        return Err(CustomError::BadRequest);
    }
    let sql = "INSERT INTO useraccount (username, password_hash, email, role, active) values ($1, $2, $3, $4, $5)";

    let _ = sqlx::query(&sql)
        .bind(&useraccount.username)
        .bind(&useraccount.password_hash)
        .bind(&useraccount.email)
        .bind(&useraccount.role)
        .bind(&useraccount.active)
        .execute(&pool)
        .await
        .map_err(|_| CustomError::InternalServerError)?;

    Ok((StatusCode::CREATED, Json(useraccount)))
}

pub async fn user_account(
    Path(id): Path<i32>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<user::UserAccount>, CustomError> {
    let sql = "SELECT * FROM useraccount where id=$1".to_string();

    let useraccount: user::UserAccount = sqlx::query_as(&sql)
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| CustomError::UserAccountNotFound)?;

    Ok(Json(useraccount))
}

// Required for say again
pub async fn update_user_account(
    Path(id): Path<i32>,
    Extension(pool): Extension<PgPool>,
    Json(useraccount): Json<user::UpdateUserAccount>,
) -> Result<(StatusCode, Json<user::UpdateUserAccount>), CustomError> {
    let sql = "SELECT * FROM useraccount where id=$1".to_string();

    let _find: user::UserAccount = sqlx::query_as(&sql)
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| CustomError::UserAccountNotFound)?;

    let _ = sqlx::query("UPDATE useraccount SET username=$1, password_hash=$2, email=$3, role=$4, active=$5 WHERE id=$6")
        .bind(&useraccount.username)
        .bind(&useraccount.password_hash)
        .bind(&useraccount.email)
        .bind(&useraccount.role)
        .bind(&useraccount.active)
        .bind(id)
        .execute(&pool)
        .await;

    Ok((StatusCode::OK, Json(useraccount)))
}

pub async fn delete_user_account(
    Path(id): Path<i32>,
    Extension(pool): Extension<PgPool>,
) -> Result<(StatusCode, Json<Value>), CustomError> {
    let _find: user::UserAccount = sqlx::query_as("SELECT * FROM useraccount where id=$1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| CustomError::UserAccountNotFound)?;

    sqlx::query("DELETE FROM useraccount WHERE id=$1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| CustomError::UserAccountNotFound)?;

    Ok((StatusCode::OK, Json(json!({"msg": "User Account Deleted"}))))
}
