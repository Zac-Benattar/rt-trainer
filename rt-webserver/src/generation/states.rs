use serde::{Deserialize, Serialize};

use crate::generation::aerodromes::get_start_aerodrome;
use crate::models::aerodrome::{Aerodrome, COMFrequency};
use crate::models::state::*;

#[derive(Deserialize, Serialize)]
pub struct ScenarioGenerationParameters {
    pub seed: u32,
    pub prefix: String,
    pub user_callsign: String,
    pub radio_frequency: f32,
    pub transponder_frequency: u16,
}

#[derive(Deserialize, Serialize)]
pub struct ScenarioStatusData {
    pub seed: u32,
    pub current_state: State,
}

pub fn generate_initial_state(parameters: ScenarioGenerationParameters) -> State {
    let start_aerodrome: Aerodrome = get_start_aerodrome(parameters.seed);
    let start_aerodrome_frequency: &COMFrequency = start_aerodrome.com_frequencies.get(0).unwrap();
    // We don't need to calculate the destination aerodrome now as it is determined by the seed

    State {
        status: Status::Parked {
            position: "A1".to_string(),
            stage: ParkedToTakeoffStage::PreDepartInfo,
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
        required_transponder_frequency: 7000,
        current_transponder_frequency: parameters.transponder_frequency,
    }
}

pub fn generate_next_state(current_state_data: ScenarioStatusData) -> State {
    // TODO - Implement this
    match &current_state_data.current_state.status {
        Status::Parked { position: _, stage } => {
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
        Status::TaxiingToTakeoff {
            holdpoint,
            runway,
            stage,
        } => {
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

    current_state_data.current_state
}
