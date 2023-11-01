use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct UserAccount {
    pub id: i32,
    pub username: String,
    pub password_hash: String,
    pub email: String,
    pub role: String,
    pub active: bool,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct NewUserAccount {
    pub username: String,
    pub password_hash: String,
    pub email: String,
    pub role: String,
    pub active: bool,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct UpdateUserAccount {
    pub username: String,
    pub password_hash: String,
    pub email: String,
    pub role: String,
    pub active: bool,
}