use axum::http::StatusCode;

use axum::Json;
// use axum_macros::debug_handler;

use crate::generation::states::{self, generate_initial_state, generate_next_state};
// Text formatting
use crate::errors::CustomError;
use crate::helpers::jsoncheckers::{
    invalid_scenario_generation_parameters_json, invalid_state_message_seed_data_json,
};
use crate::helpers::preprocessors::process_string;
use crate::models::state::{State, StateMessage, StateMessageSeed, ServerResponse};

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

// Modifies state based on seed, radiomessage and state, effectively moves situation forward one step.
// This ensures the server is stateless, and does not need to store any data for simulating a scenario.
// Passed in radio call should be correct for the current state otherwise error should be returned.
pub async fn get_next_state(
    Json(state_message_seed): Json<StateMessageSeed>,
) -> Result<(StatusCode, Json<ServerResponse>), CustomError> {
    // Filter out empty json
    if invalid_state_message_seed_data_json(Json(&state_message_seed)) {
        return Err(CustomError::BadRequest);
    }

    let usercall = process_string(&state_message_seed.message);
    let state_data = state_message_seed.state;
    let scenario_seed = state_message_seed.scenario_seed;
    let weather_seed = state_message_seed.weather_seed;

    let result = generate_next_state(scenario_seed, weather_seed, usercall, state_data);

    let next_state_and_message = match result {
        Ok(state) => state,
        Err(error) => {
            println!("Error: {:?}", error.to_string());
            return Err(CustomError::BadRequest);
        }
    };

    Ok((StatusCode::OK, Json(next_state_and_message)))
}
