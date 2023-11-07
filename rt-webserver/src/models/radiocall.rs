use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct UserCall {
    pub id: i32,
    pub callsign_stated: String,
    pub target_stated: String,
    pub callsign_actual: String,
    pub target_actual: String,
    pub message: String,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct NewUserCall {
    pub callsign_stated: String,
    pub target_stated: String,
    pub callsign_actual: String,
    pub target_actual: String,
    pub message: String,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct UpdateUserCall {
    pub callsign_stated: String,
    pub target_stated: String,
    pub callsign_actual: String,
    pub target_actual: String,
    pub message: String,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct ATCCall {
    pub id: i32,
    pub callsign_stated: String,
    pub target_stated: String,
    pub callsign_actual: String,
    pub target_actual: String,
    pub message: String,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct NewATCCall {
    pub callsign_stated: String,
    pub target_stated: String,
    pub callsign_actual: String,
    pub target_actual: String,
    pub message: String,
}
