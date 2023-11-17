use std::thread::current;

use crate::{errors::CustomError, models::{state::{State, Status, ParkedToTakeoffStage, Emergency}, aerodrome::COMFrequency}};

pub fn parse_parked_to_takeoff_radio_check(
    radio_check: &str,
    current_state: &State,
) -> Result<State, CustomError> {
    let mut callsign_stated = String::new();
    let mut astu_callsign_stated = String::new();
    let mut radio_freq_stated = String::new();

    let number_index = radio_check.find(|c: char| c.is_numeric()).unwrap_or(0);
    println!("Number index: {}", number_index);
    println!("Radio Frequency: {}", radio_check[number_index..].to_string());

    // TODO - Implement this

    let next_state = State {
        status: Status::Parked {
            position: "A1".to_string(),
            stage: ParkedToTakeoffStage::PreDepartInfo,
        },
        lat: current_state.lat,
        long: current_state.long,
        current_target: COMFrequency {
            frequency_type: current_state.current_target.frequency_type,
            frequency: current_state.current_target.frequency,
            callsign: current_state.current_target.callsign.clone(),
        },
        prefix: current_state.prefix.to_owned(), // Set by user: none, student, helicopter, police, etc...
        callsign: current_state.callsign.to_owned(),
        target_allocated_callsign: current_state.target_allocated_callsign.to_owned(), // Replaced by ATSU when needed
        emergency: Emergency::None,
        squark: false,
        current_radio_frequency: current_state.current_radio_frequency,
        current_transponder_frequency: current_state.current_transponder_frequency,
    };

    Ok(next_state)
}
