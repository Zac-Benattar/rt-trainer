use axum::http::StatusCode;

use axum::Json;
use axum_macros::debug_handler;
// use axum_macros::debug_handler;

use crate::generation::states::{self, generate_initial_state, generate_next_state};
// Text formatting
use crate::helpers::jsoncheckers::{
    invalid_scenario_generation_parameters_json, invalid_state_data_json,
};
use crate::helpers::phonetics;
use crate::helpers::preprocessors::{process_string, remove_punctuation};
use crate::models::state::State;
use crate::models::state::StateAndMessage;
use crate::titlecase;
use crate::errors::CustomError;

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
// Modifies state based on seed, radiomessage and state, effectively moves situation forward one step.
// This ensures the server is stateless, and does not need to store any data for simulating a scenario.
// Passed in radio call should be correct for the current state otherwise error should be returned.
pub async fn get_next_state(
    Json(state_and_message): Json<StateAndMessage>,
) -> Result<(StatusCode, Json<State>), CustomError> {
    // Filter out empty json
    // if invalid_state_and_message_data_json(Json(&state_and_message)) {
    //     return Err(CustomError::BadRequest);
    // }

    let usercall = process_string(&state_and_message.message);
    let state_data = state_and_message.state;
    let seed = state_and_message.seed;

    let next_state = generate_next_state(seed, usercall, state_data);

    Ok((StatusCode::OK, Json(next_state)))
}