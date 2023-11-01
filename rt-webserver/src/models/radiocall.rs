use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct UserRadioCall {
    pub id: i32,
    pub callsign: String,
    pub target: String,
    pub message: String,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct ATCRadioCall {
    pub id: i32,
    pub callsign: String,
    pub target: String,
    pub message: String,
}
