use axum::http::StatusCode;

use axum::Json;
// use axum_macros::debug_handler;

// Text formatting
use crate::helpers::jsoncheckers::invalid_usercall_json;
use crate::helpers::phonetics;
use crate::helpers::preprocessors::process_string;
use crate::models::state::{ParkedToTakeoffStage, State, Status, TaxiingToTakeoffStage};
use crate::titlecase;

// Database
use crate::{errors::CustomError, models::radiocall};

// Modifies state based on seed and state, effectively moves situation forward one step
pub async fn get_next_state(seed: u32, mut state: State) -> State {
    match &state.status {
        Status::Parked {
            position,
            stage,
        } => {
            match stage {
                ParkedToTakeoffStage::PreRadiocheck => {
                    // Parse pretakeoff radio check request
                }
                ParkedToTakeoffStage::PreDepartInfo => {
                    // Parse pretakeoff departure information request
                }
                ParkedToTakeoffStage::PreReadbackDepartInfo => {
                    // Parse pretakeoff departure information readback
                }
                ParkedToTakeoffStage::PreTaxiRequest => {
                    // Parse pretakeoff taxi request
                }
                ParkedToTakeoffStage::PreTaxiClearanceReadback => {
                    // Parse pretakeoff taxi clearance readback
                    // Move to taxiing status
                }
            }
        }
        Status::Taxiing { holdpoint, runway, stage } => {
            match stage {
                TaxiingToTakeoffStage::PreReadyForDeparture => {
                    // Parse pretakeoff ready for departure
                }
                TaxiingToTakeoffStage::PreInfoGivenForDeparture => {
                    // Parse pretakeoff information given for departure
                }
                TaxiingToTakeoffStage::PreClearedForTakeoff => {
                    // Parse pretakeoff cleared for takeoff
                }
                TaxiingToTakeoffStage::PreReadbackClearedForTakeoff => {
                    // Parse pretakeoff cleared for takeoff readback
                    // Move to airbourne status
                }
            }
        }
        Status::Airborne {
            altitude,
            heading,
            speed,
            next_point,
        } => {}
        Status::Landing { runway } => {}
    }

    state
}

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
