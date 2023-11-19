use crate::{
    errors::ParseError,
    generation::aerodromes::*,
    models::{
        aerodrome::COMFrequency,
        state::{Emergency, ParkedToTakeoffStage, State, StateMessage, Status},
        aerodrome::Aerodrome,
    },
};

use super::aerodromes::get_start_aerodrome;

pub fn parse_radio_check(
    seed: &u32,
    radio_check: &String,
    current_state: &State,
) -> Result<StateMessage, ParseError> {
    let message = radio_check;
    let message_words = message.split_whitespace().collect::<Vec<&str>>();

    let radio_freq_index = match message_words.iter().position(|&x| x.contains('.')) {
        Some(index) => index,
        None => {
            return Err(ParseError::FrequencyMissingError {
                frequency_expected: current_state.current_radio_frequency.to_string(),
            });
        }
    };

    let radio_freq_stated = match message_words[radio_freq_index].parse::<f32>() {
        Ok(freq) => freq,
        Err(_) => {
            println!("Radio frequency not a number");
            return Err(ParseError::FrequencyParseError {
                frequency_found: message_words[radio_freq_index].to_string(),
                frequency_expected: current_state.current_radio_frequency.to_string(),
            });
        }
    };

    let callsign_expected = current_state.current_target.callsign.to_lowercase();
    let callsign_words = &callsign_expected.split_whitespace().collect::<Vec<&str>>();
    for i in 0..callsign_words.len() {
        if message_words[i] != callsign_words[i] {
            return Err(ParseError::CallsignParseError {
                callsign_found: message_words[..callsign_words.len()].join(" "),
                callsign_expected: current_state.current_target.callsign.to_lowercase(),
            });
        }
    }

    if message_words[callsign_words.len()] != current_state.callsign.to_lowercase() {
        return Err(ParseError::CallsignParseError {
            callsign_found: message_words[1].to_string(),
            callsign_expected: current_state.callsign.to_lowercase(),
        });
    }

    if message_words[radio_freq_index - 2] != "radio"
        || message_words[radio_freq_index - 1] != "check"
    {
        return Err(ParseError::MessageParseError {
            message_found: message.to_string(),
            message_expected: "radio check".to_string(),
        });
    }

    // Trailing 0s lost when frequency string parsed to float, hence comparison of floats rather than strings
    if radio_freq_stated != current_state.current_radio_frequency {
        return Err(ParseError::FrequencyIncorrectError {
            frequency_found: radio_freq_stated.to_string(),
            frequency_expected: current_state.current_radio_frequency.to_string(),
        });
    }

    let atc_response = format!(
        "{0}, {1}, reading you 5.",
        &current_state.callsign, &current_state.current_target.callsign
    );

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

    Ok(StateMessage {
        state: next_state,
        message: atc_response,
    })
}

pub fn parse_departure_information_request(seed: &u32, departure_information_request: &String, current_state: &State) -> Result<StateMessage, ParseError> {
    let message_words = departure_information_request.split_whitespace().collect::<Vec<&str>>();
    let callsign_expected = current_state.callsign.to_lowercase();
    let callsign_words = &callsign_expected.split_whitespace().collect::<Vec<&str>>();
    for i in 0..callsign_words.len() {
        if message_words[i] != callsign_words[i] {
            return Err(ParseError::CallsignParseError {
                callsign_found: message_words[..callsign_words.len()].join(" "),
                callsign_expected: current_state.current_target.callsign.to_lowercase(),
            });
        }
    }

    let aerodrome: Aerodrome = get_start_aerodrome(*seed);
    let runway_index: usize = (seed % (aerodrome.runways.len() as u32)) as usize;
    let runway = match aerodrome.runways.get(runway_index) {
        Some(runway) => runway,
        None => {
            return Err(ParseError::RunwayInvalidError {
                aerodrome,
                runway_index,
            });
        }
    };

    if !departure_information_request.contains("request departure information") {
        return Err(ParseError::MessageParseError {
            message_found: departure_information_request.to_string(),
            message_expected: format!("{0} request departure information", &current_state.callsign),
        });
    }

    // Figure out airport runway, come up with some wind, pressure, temp and dewpoint numbers
    let atc_response = format!(
        "{0}, runway {1}, wind {2} degrees {3} knots, QNH {4}, temperature {5} dewpoint {6}.",
        &current_state.callsign, runway.name, aerodrome.wind_direction, aerodrome.wind_speed, aerodrome.pressure, aerodrome.temperature, aerodrome.dewpoint
    );

    let next_state = State {
        status: Status::Parked {
            position: "A1".to_string(),
            stage: ParkedToTakeoffStage::PreReadbackDepartInfo,
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

    Ok(StateMessage {
        state: next_state,
        message: atc_response,
    })
}
