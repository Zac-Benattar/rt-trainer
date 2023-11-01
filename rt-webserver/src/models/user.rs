use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct UserAccount {
    pub id: u32,
    pub username: String,
    pub password_hash: String,
    pub email: String,
    pub role: String,
    pub active: bool,
}