use std::os::unix::process;

use axum::http::StatusCode;

use axum::{Extension, Json};
// use axum_macros::debug_handler;
use sqlx::PgPool;

// Text formatting
use crate::helpers::jsoncheckers::invalid_usercall_json;
use crate::helpers::preprocessors::process_string;
use crate::helpers::phonetics;
use crate::titlecase;

// Database
use crate::{errors::CustomError, models::radiocall};


pub async fn handshake(
    Extension(pool): Extension<PgPool>,
    Json(usercall): Json<radiocall::NewUserCall>,
) -> Result<(StatusCode, Json<radiocall::NewATCCall>), CustomError> {

    // Filter out empty json
    if invalid_usercall_json(Json(&usercall)) {
        return Err(CustomError::BadRequest);
    }

    // Filter out cases where target_stated is not target_actual
    if usercall.target_stated != usercall.target_actual {
        return Err(CustomError::WrongTarget);
    }

    // Make lowercase, remove punctuation and trim whitespace
    let usercall_message = process_string(&usercall.message);

    // Begin building return ATC call message
    let mut return_message_transcript: String = phonetics::replace_phonetic_alphabet_with_pronounciation(&phonetics::replace_string_with_phonetic_alphabet(&process_string(&usercall.callsign_stated)));
    return_message_transcript.push_str(", ");
    let mut return_message_text: String = usercall.callsign_stated.to_owned();
    return_message_text.push_str(", ");
    return_message_transcript.push_str(&usercall.target_actual.to_owned());
    return_message_transcript.push_str(", ");
    return_message_text.push_str(&usercall.target_actual.to_owned());
    return_message_text.push_str(", ");

    // Will need to be reworked when done properly
    if usercall_message.contains("negative this is") {
        // Return last message with callsign corrected
    }
    else if usercall_message.contains("request zone transit") {
        return_message_text.push_str("pass your message.");
        return_message_transcript.push_str("pass your message.");
    } else if usercall_message.contains("leaving the ATZ to the") {
        return_message_text.push_str("proceed to the zone. Enjoy your flight.");
        return_message_transcript.push_str("proceed to the zone. Enjoy your flight.");
    }

    // Create JSON object to return
    let radiocall = radiocall::NewATCCall {
        message_text: titlecase(&return_message_text.as_str()),
        message_audio_transcript: titlecase(&return_message_transcript.as_str()),
        target_stated: usercall.callsign_stated,
        callsign: usercall.target_actual,
        target_actual: usercall.callsign_actual,
    };

    Ok((StatusCode::OK, Json(radiocall)))
}
