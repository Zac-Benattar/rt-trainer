use anyhow::Error;
use serde::{Deserialize, Serialize};

use crate::generation::parsers::*;
use crate::models::aerodrome::{Aerodrome, COMFrequency};
use crate::models::state::*;

use super::aerodromes::get_start_and_end_aerodromes;

#[derive(Deserialize, Serialize)]
pub struct ScenarioGenerationParameters {
    pub scenario_seed: u64,
    pub weather_seed: u64,
    pub prefix: String,
    pub user_callsign: String,
    pub aircraft_type: String,
}

pub fn generate_initial_state(parameters: ScenarioGenerationParameters) -> SentState {
    let start_aerodrome: Aerodrome = match get_start_and_end_aerodromes(parameters.scenario_seed) {
        Some((start, _)) => start,
        None => panic!("Could not find start aerodrome"),
    };
    let start_aerodrome_frequency: &COMFrequency = start_aerodrome.com_frequencies.get(0).unwrap();
    // We don't need to calculate the destination aerodrome at this point as it is determined by the seed

    SentState {
        status: Status::Parked {
            stage: ParkedStage::PreRadioCheck,
        },
        location: start_aerodrome.location,
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
        current_radio_frequency: start_aerodrome_frequency.frequency,
        current_transponder_frequency: 7000,
        aircraft_type: parameters.aircraft_type,
    }
}

pub fn generate_next_state(
    scenario_seed: u64,
    weather_seed: u64,
    radiocall: String,
    current_state: RecievedState,
) -> Result<ServerResponse, Error> {
    match &current_state.status {
        Status::Parked { stage } => {
            match stage {
                ParkedStage::PreRadioCheck => {
                    // Parse pretakeoff radio check request
                    return parse_radio_check(&scenario_seed, &radiocall, &current_state);
                }
                ParkedStage::PreDepartInfo => {
                    // Parse pretakeoff departure information request
                    return parse_departure_information_request(
                        &scenario_seed,
                        &weather_seed,
                        &radiocall,
                        &current_state,
                    );
                }
                ParkedStage::PreReadbackDepartInfo => {
                    // Parse pretakeoff departure information readback
                    return parse_departure_information_readback(
                        &scenario_seed,
                        &weather_seed,
                        &radiocall,
                        &current_state,
                    );
                }
                ParkedStage::PreTaxiRequest => {
                    // Parse pretakeoff taxi request
                    return parse_taxi_request(
                        &scenario_seed,
                        &weather_seed,
                        &radiocall,
                        &current_state,
                    );
                }
                ParkedStage::PreTaxiClearanceReadback => {
                    // Parse pretakeoff taxi clearance readback
                    // Move to taxiing status
                    return parse_taxi_readback(
                        &scenario_seed,
                        &weather_seed,
                        &radiocall,
                        &current_state,
                    );
                }
            }
        }
        Status::Taxiing { stage } => {
            match stage {
                TaxiingStage::PreReadyForDeparture => {
                    // Parse pretakeoff ready for departure
                }
                TaxiingStage::PreInfoGivenForDeparture => {
                    // Parse pretakeoff information given for departure
                }
            }
        }
        Status::Holding {
            stage,
            holding_point,
        } => {
            match stage {
                HoldingStage::PreClearedForTakeoff => {
                    // Parse pretakeoff cleared for takeoff
                }
                HoldingStage::PreReadbackClearedForTakeoff => {
                    // Parse pretakeoff cleared for takeoff readback
                    // Move to airbourne status
                }
            }
        }
        Status::Takeoff { runway } => todo!(),
        Status::Airbourne {
            flight_rules,
            altitude,
            heading,
            speed,
            current_point,
            airbourne_event,
        } => {
            match airbourne_event {
                AirbourneEvent::NewAirspaceInitialContact => {
                    // Parse new airspace initial contact
                    return parse_new_airspace_initial_contact(
                        &scenario_seed,
                        &weather_seed,
                        &radiocall,
                        &flight_rules,
                        &altitude,
                        &heading,
                        &speed,
                        &current_point,
                        &current_state,
                    );
                }
                AirbourneEvent::NewAirspaceFullContact => {
                    // Parse new airspace full contact
                    return parse_new_airspace_reply_to_acknowledge(
                        &scenario_seed,
                        &weather_seed,
                        &radiocall,
                        &flight_rules,
                        &altitude,
                        &heading,
                        &speed,
                        &current_point,
                        &current_state,
                    );
                }
                AirbourneEvent::NewAirspaceChangeFrequency => {
                    // Parse new airspace change frequency
                }
                AirbourneEvent::NewAirspaceChangeSquark => {
                    // Parse new airspace change squark
                }
                AirbourneEvent::NewAirspaceChangeTransponder => {
                    // Parse new airspace change transponder
                }
                AirbourneEvent::NewAirspaceChangeAltitude => {
                    // Parse new airspace change altitude
                }
                AirbourneEvent::NewAirspaceChangeHeading => {
                    // Parse new airspace change heading
                }
                AirbourneEvent::NewAirspaceChangeSpeed => {
                    // Parse new airspace change speed
                }
                AirbourneEvent::NewAirspaceChangeRoute => {
                    // Parse new airspace change route
                }
            }
        }
        Status::Landing { runway } => todo!(),
        Status::LandingToParked { position, stage } => todo!(),
        Status::Descent {} => todo!(),
        Status::Approach {} => todo!(),
    }

    Ok(ServerResponse::Mistake(Mistake {
        call_expected: "Unknown expected".to_owned(),
        call_found: "Unknown message".to_owned(),
        details: "Unknown error".to_owned(),
    }))
}
