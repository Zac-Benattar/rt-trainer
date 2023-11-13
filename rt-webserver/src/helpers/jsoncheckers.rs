use axum::Json;

use crate::models::radiocall;

pub fn invalid_usercall_json(Json(usercall): Json<&radiocall::NewUserCall>) -> bool {
    empty_usercall_json(Json(usercall)) || incorrect_size_usercall_json(Json(usercall))
}

pub fn empty_usercall_json(Json(usercall): Json<&radiocall::NewUserCall>) -> bool {
    usercall.callsign_stated.is_empty()
        || usercall.target_stated.is_empty()
        || usercall.callsign_actual.is_empty()
        || usercall.target_actual.is_empty()
        || usercall.message.is_empty()
}

pub fn incorrect_size_usercall_json(Json(usercall): Json<&radiocall::NewUserCall>) -> bool {
    usercall.callsign_stated.len() < 5
        || usercall.callsign_stated.len() > 6
        || usercall.target_stated.len() < 5
        || usercall.target_stated.len() > 50
        || usercall.callsign_actual.len() < 5
        || usercall.callsign_actual.len() > 6
        || usercall.target_actual.len() < 5
        || usercall.target_actual.len() > 50
        || usercall.message.len() < 5
        || usercall.message.len() > 255
}
