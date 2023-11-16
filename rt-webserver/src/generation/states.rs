use crate::models::aerodrome::Aerodrome;
use crate::generation::aerodromes::get_start_aerodrome;
use crate::models::state::*;

pub fn generate_initial_state(seed: u32, prefix: &str, user_callsign: &str) -> State {
    let start_aerodrome: Aerodrome = get_start_aerodrome(seed);
    // We don't need to calculate the destination aerodrome now as it is determined by the seed

    State {
        status: Status::Parked {
            position: "A1".to_string(),
            stage: ParkedToTakeoffStage::PreDepartInfo,
        },
        lat: start_aerodrome.lat,
        long: start_aerodrome.long,
        current_atsu_callsign: start_aerodrome.atsu_callsign,
        prefix: prefix.to_owned(), // Set by user: none, student, helicopter, police, etc...
        callsign: user_callsign.to_owned(),
        atsu_allocated_callsign: user_callsign.to_owned(), // Replaced by ATSU when needed
        emergency: "".to_string(),
        squark: false,
        atsu_frequency: start_aerodrome.atsu_frequency,
        current_radio_frequency: start_aerodrome.atsu_frequency,
        required_transponder_frequency: start_aerodrome.atsu_frequency,
        current_transponder_frequency: 7000.0,
    }
}

pub fn generate_next_state(seed: u32, current_state: State) -> State {
    // TODO - Implement this
    match &current_state.status {
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

    current_state
}