use serde::{Deserialize, Serialize};

use crate::errors::ParseError;
use crate::generation::aerodromes::get_start_aerodrome;
use crate::generation::parsers::*;
use crate::models::aerodrome::{Aerodrome, COMFrequency};
use crate::models::state::*;

#[derive(Deserialize, Serialize)]
pub struct ScenarioGenerationParameters {
    pub seed: u32,
    pub prefix: String,
    pub user_callsign: String,
    pub radio_frequency: f32,
    pub transponder_frequency: u16,
    pub aircraft_type: String,
}

pub fn generate_initial_state(parameters: ScenarioGenerationParameters) -> State {
    let start_aerodrome: Aerodrome = get_start_aerodrome(parameters.seed);
    let start_aerodrome_frequency: &COMFrequency = start_aerodrome.com_frequencies.get(0).unwrap();
    // We don't need to calculate the destination aerodrome at this point as it is determined by the seed

    State {
        status: Status::Parked {
            stage: ParkedToTakeoffStage::PreRadioCheck,
        },
        lat: start_aerodrome.lat,
        long: start_aerodrome.long,
        current_target: COMFrequency {
            frequency_type: start_aerodrome_frequency.frequency_type,
            frequency: start_aerodrome_frequency.frequency,
            callsign: start_aerodrome_frequency.callsign.clone(),
        },
        prefix: parameters.prefix, // Set by user: none, student, helicopter, police, etc...
        callsign: (&parameters.user_callsign).to_owned(),
        target_allocated_callsign: parameters.user_callsign, // Replaced by ATSU when needed
        emergency: Emergency::None,
        squark: false,
        current_radio_frequency: parameters.radio_frequency,
        current_transponder_frequency: 7000,
        aircraft_type: parameters.aircraft_type,
    }
}

pub fn generate_next_state(
    scenario_seed: u32,
    weather_seed: u16,
    radiocall: String,
    current_state: State,
) -> Result<StateMessage, ParseError> {
    match &current_state.status {
        Status::Parked { stage } => {
            match stage {
                ParkedToTakeoffStage::PreRadioCheck => {
                    // Parse pretakeoff radio check request
                    return parse_radio_check(&scenario_seed, &radiocall, &current_state);
                }
                ParkedToTakeoffStage::PreDepartInfo => {
                    // Parse pretakeoff departure information request
                    return parse_departure_information_request(&scenario_seed, &weather_seed, &radiocall, &current_state);
                }
                ParkedToTakeoffStage::PreReadbackDepartInfo => {
                    // Parse pretakeoff departure information readback
                    return parse_departure_information_readback(&scenario_seed, &weather_seed, &radiocall, &current_state);
                }
                ParkedToTakeoffStage::PreTaxiRequest => {
                    // Parse pretakeoff taxi request
                    return parse_taxi_request(&scenario_seed, &weather_seed, &radiocall, &current_state);
                }
                ParkedToTakeoffStage::PreTaxiClearanceReadback => {
                    // Parse pretakeoff taxi clearance readback
                    // Move to taxiing status
                    return parse_taxi_readback(&scenario_seed, &weather_seed, &radiocall, &current_state);
                }
            }
        }
        Status::TaxiingToTakeoff { stage } => {
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
        Status::LandingToParked { position, stage } => {}
    }

    Ok(StateMessage {
        state: current_state,
        message: "Error".to_string(),
    })
}
