use anyhow::Error;
use crate::generation::call_parsers::*;
use crate::models::state::*;
use super::route_generator::get_pre_radio_check_state;

pub fn generate_initial_state(scenario_seed: u64) -> Result<SentState,Error> {
    get_pre_radio_check_state(scenario_seed)
}

pub fn generate_next_state(
    scenario_seed: u64,
    weather_seed: u64,
    radiocall: String,
    current_state: RecievedState,
) -> Result<ServerResponse, Error> {
    match &current_state.stage {
        &RoutePointStage::Parked { stage } => {
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
        &RoutePointStage::Taxiing { stage } => {
            match stage {
                TaxiingStage::PreReadyForDeparture => {
                    // Parse pretakeoff ready for departure
                }
                TaxiingStage::PreInfoGivenForDeparture => {
                    // Parse pretakeoff information given for departure
                }
            }
        }
        &RoutePointStage::Holding {
            stage,
            holding_point,
        } => {
            match stage {
                HoldingStage::PreClearedForTakeoff => {
                    // Parse pretakeoff cleared for takeoff
                }
                HoldingStage::PreReadbackClearedForTakeoff => {
                    // Parse pretakeoff cleared for takeoff readback
                    // Move to airborne status
                }
            }
        }
        &RoutePointStage::Takeoff { runway } => todo!(),
        &RoutePointStage::NewAirspace {
            stage,
            flight_rules,
            airborne_event,
        } => {
            match airborne_event {
                WaypointStage::PreNewAirspaceInitialCall => {
                    // Parse new airspace initial call
                    return parse_new_airspace_initial_contact(
                        &scenario_seed,
                        &weather_seed,
                        &radiocall,
                        &flight_rules,
                        &current_state,
                    );
                }
                WaypointStage::PreNewAirspaceFlightDetailsGiven => {
                    // Parse new airspace flight details given
                    return parse_new_airspace_give_flight_information_to_atc(
                        &scenario_seed,
                        &weather_seed,
                        &radiocall,
                        &current_state,
                    );
                }
                WaypointStage::PreNewAirspaceSquark { squark } => {
                    // Parse new airspace squark
                    return parse_new_airspace_squark(
                        &scenario_seed,
                        &weather_seed,
                        &radiocall,
                        &current_state,
                    );
                }
                WaypointStage::PreChangeAltitudeWilco => {
                    // Parse new airspace change altitude
                }
                WaypointStage::PreChangeHeadingWilco => {
                    // Parse new airspace change heading
                }
                WaypointStage::PreChangeSpeedWilco => {
                    // Parse new airspace change speed
                }
                WaypointStage::PreChangeRouteWilco => {
                    // Parse new airspace change route
                }
                WaypointStage::PreWilco => {
                    // Parse new airspace wilco
                    return parse_wilco(&scenario_seed, &weather_seed, &radiocall, &current_state);
                }
                WaypointStage::PreVFRPositionReport => {
                    // Parse new airspace VFR position report
                    return parse_vfr_position_report(
                        &scenario_seed,
                        &weather_seed,
                        &current_state,
                    );
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