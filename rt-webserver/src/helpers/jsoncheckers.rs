use axum::Json;

use crate::models::radiocall;

pub fn validate_usercall_json(Json(usercall): Json<radiocall::NewUserCall>) -> bool {
    return usercall.callsign_stated.is_empty()
        || usercall.target_stated.is_empty()
        || usercall.callsign_actual.is_empty()
        || usercall.target_actual.is_empty()
        || usercall.message.is_empty();
}
