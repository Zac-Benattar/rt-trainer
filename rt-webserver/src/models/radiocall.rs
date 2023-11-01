use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct UserCall {
    pub id: i32,
    pub callsign: String,
    pub target: String,
    pub message: String,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct NewUserCall {
    pub callsign: String,
    pub target: String,
    pub message: String,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct ATCCall {
    pub id: i32,
    pub callsign: String,
    pub target: String,
    pub message: String,
}
