use serde::{Deserialize, Serialize};

#[derive(sqlx::FromRow, Deserialize, Serialize)]
pub struct UserRadioCall {
    pub id: i32,
    pub callsign: String,
    pub target: String,
    pub message: String,
}

#[derive(sqlx::FromRow, Deserialize, Serialize)]
pub struct ATCRadioCall {
    pub id: i32,
    pub callsign: String,
    pub target: String,
    pub message: String,
}
