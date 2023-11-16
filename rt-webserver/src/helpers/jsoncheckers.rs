use axum::Json;

use crate::{generation::states, models::radiocall};

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

// Following functions are pretty much unimplemented but are here to show how the code should be structured
pub fn invalid_scenario_generation_parameters_json(
    Json(scenario_generation_parameters): Json<&states::ScenarioGenerationParameters>,
) -> bool {
    empty_scenario_generation_parameters_json(Json(scenario_generation_parameters))
}

pub fn empty_scenario_generation_parameters_json(
    Json(scenario_generation_parameters): Json<&states::ScenarioGenerationParameters>,
) -> bool {
    scenario_generation_parameters.prefix.is_empty()
        || scenario_generation_parameters.user_callsign.is_empty()
}

pub fn invalid_scenario_status_data_json(
    Json(scenario_status_data): Json<&states::ScenarioStatusData>,
) -> bool {
    empty_scenario_status_data_json(Json(scenario_status_data))
}

pub fn empty_scenario_status_data_json(
    Json(scenario_status_data): Json<&states::ScenarioStatusData>,
) -> bool {
    scenario_status_data.current_state.callsign.is_empty()
        || scenario_status_data.current_state.prefix.is_empty()
}
