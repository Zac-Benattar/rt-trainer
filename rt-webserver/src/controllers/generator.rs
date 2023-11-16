use axum::http::StatusCode;

use axum::Json;
// use axum_macros::debug_handler;

use crate::generation::states::{self, generate_initial_state, generate_next_state};
// Text formatting
use crate::helpers::jsoncheckers::{
    invalid_scenario_generation_parameters_json, invalid_scenario_status_data_json,
    invalid_usercall_json,
};
use crate::helpers::phonetics;
use crate::helpers::preprocessors::process_string;
use crate::models::state::State;
use crate::titlecase;
use crate::{errors::CustomError, models::radiocall};

/* Gets the first state that the frontend should match.
The frontend will then ensure the radio and transponder are set to the
required settings defined in the returned state. The next state is then requested (get_next_state)
along with the seed and radio call. If radio call is correct next state is given. */
pub async fn get_initial_state(
    Json(scenario_generation_parameters): Json<states::ScenarioGenerationParameters>,
) -> Result<(StatusCode, Json<State>), CustomError> {
    // Filter out empty json
    if invalid_scenario_generation_parameters_json(Json(&scenario_generation_parameters)) {
        return Err(CustomError::BadRequest);
    }

    let initial_state = generate_initial_state(scenario_generation_parameters);

    Ok((StatusCode::OK, Json(initial_state)))
}

// TODO - Make this take in a radio call and return a Result so errors in the radio call can be handled
// Modifies state based on seed and state, effectively moves situation forward one step.
// This ensures the server is stateless, and does not need to store any data for simulating a scenario.
// Passed in radio call should be correct for the current state otherwise error should be returned.
pub async fn get_next_state(
    Json(state_data): Json<states::ScenarioStatusData>,
) -> Result<(StatusCode, Json<State>), CustomError> {
    // Filter out empty json
    if invalid_scenario_status_data_json(Json(&state_data)) {
        return Err(CustomError::BadRequest);
    }

    let next_state = generate_next_state(state_data);

    Ok((StatusCode::OK, Json(next_state)))
}

// Depreciated
pub async fn handshake(
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
    let mut return_message_transcript: String =
        phonetics::replace_phonetic_alphabet_with_pronounciation(
            &phonetics::replace_string_with_phonetic_alphabet(&process_string(
                &usercall.callsign_stated,
            )),
        );
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
    } else if usercall_message.contains("request zone transit") {
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
