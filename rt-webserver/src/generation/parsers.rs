use anyhow::Error;

use crate::models::{
    aerodrome::Aerodrome,
    aerodrome::COMFrequency,
    state::{
        Emergency, Mistake, ParkedStage, ServerResponse, SentState, SentStateMessage, Status,
        TaxiingStage, RecievedState,
    },
};

use super::{
    aerodromes::{get_metor_sample, get_start_and_end_aerodromes},
    routes::get_route,
};

pub fn shorten_callsign(scenario_seed: &u64, aircraft_type: &String, callsign: &String) -> String {
    let mut shortened_callsign = String::new();
    if callsign.len() == 6 {
        let mut standard_reg_style: bool = true;
        for (i, c) in callsign.chars().enumerate() {
            if !c.is_ascii_uppercase() && i != 1 {
                standard_reg_style = false;
            }
        }

        if standard_reg_style {
            print!("{}", scenario_seed);
            if scenario_seed % 3 == 0 {
                shortened_callsign.push_str(&aircraft_type);
                shortened_callsign.push_str(" ");
                shortened_callsign.push_str(&callsign[4..]);
            } else {
                shortened_callsign.push_str(&callsign[0..1]);
                shortened_callsign.push_str("-");
                shortened_callsign.push_str(&callsign[4..]);
            }
        } else {
            shortened_callsign.push_str(&callsign[..]);
        }
    } else {
        let callsign_words = callsign.split_whitespace().collect::<Vec<&str>>();
        shortened_callsign.push_str(callsign_words[0]);
    }

    shortened_callsign
}

pub fn parse_radio_check(
    scenario_seed: &u64,
    radio_check: &String,
    current_state: &RecievedState,
) -> Result<ServerResponse, Error> {
    let message = radio_check;
    let message_words = message.split_whitespace().collect::<Vec<&str>>();

    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
    match get_start_and_end_aerodromes(*scenario_seed) {
        Some(aerodromes) => aerodromes,
        None => {
            return Err(Error::msg("Aerodromes not generated"));
        }
    };

    let radio_freq_index = match message_words.iter().position(|&x| x.contains('.')) {
        Some(index) => index,
        None => {
            return Ok(ServerResponse::Mistake(Mistake {
                details: "Frequency missing".to_string(),
                message: message.to_string(),
            }));
        }
    };

    // Convert frequency string to float
    let radio_freq_stated = match message_words[radio_freq_index].parse::<f32>() {
        Ok(frequency) => frequency,
        Err(_) => {
            return Ok(ServerResponse::Mistake(Mistake {
                details: "Frequency not recognised".to_string(),
                message: message.to_string(),
            }));
        }
    };

    let callsign_expected = current_state.current_target.callsign.to_ascii_lowercase();
    let callsign_words = &callsign_expected.split_whitespace().collect::<Vec<&str>>();
    for i in 0..callsign_words.len() {
        if message_words[i] != callsign_words[i] {
            return Ok(ServerResponse::Mistake(Mistake {
                details: format!(
                    "Callsign not recognised: {}",
                    message_words[..callsign_words.len()].join(" ")
                ),
                message: message.to_string(),
            }));
        }
    }

    if message_words[callsign_words.len()] != current_state.callsign.to_ascii_lowercase() {
        return Ok(ServerResponse::Mistake(Mistake {
            details: format!(
                "Callsign not recognised: {}",
                message_words[..callsign_words.len()].join(" ")
            ),
            message: message.to_string(),
        }));
    }

    if message_words[radio_freq_index - 2] != "radio"
        || message_words[radio_freq_index - 1] != "check"
    {
        return Ok(ServerResponse::Mistake(Mistake {
            details: "Expected 'radio check' in message".to_string(),
            message: message.to_string(),
        }));
    }

    // Trailing 0s lost when frequency string parsed to float, hence comparison of floats rather than strings
    if radio_freq_stated != current_state.current_radio_frequency {
        return Ok(ServerResponse::Mistake(Mistake {
            details: format!(
                "Frequency incorrect: {0} \n Expected: {1}",
                radio_freq_stated, current_state.current_radio_frequency
            ),
            message: message.to_string(),
        }));
    }

    let atc_response = format!(
        "{0}, {1}, reading you 5",
        &current_state.callsign, &current_state.current_target.callsign
    );

    let next_state = SentState {
        status: Status::Parked {
            stage: ParkedStage::PreDepartInfo,
        },
        lat: start_and_end_aerodrome.0.lat,
        long: start_and_end_aerodrome.0.long,
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
        aircraft_type: current_state.aircraft_type.to_owned(),
    };

    Ok(ServerResponse::StateMessage(SentStateMessage {
        state: next_state,
        message: atc_response,
    }))
}

pub fn parse_departure_information_request(
    scenario_seed: &u64,
    weather_seed: &u64,
    departure_information_request: &String,
    current_state: &RecievedState,
) -> Result<ServerResponse, Error> {
    let message_words = departure_information_request
        .split_whitespace()
        .collect::<Vec<&str>>();
    let callsign_expected = current_state.callsign.to_ascii_lowercase();
    let callsign_words = &callsign_expected.split_whitespace().collect::<Vec<&str>>();
    for i in 0..callsign_words.len() {
        if message_words[i] != callsign_words[i] {
            return Ok(ServerResponse::Mistake(Mistake {
                details: "Callsign not recognised".to_string(),
                message: departure_information_request.to_string(),
            }));
        }
    }

    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(*scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };

    let metor_sample =
        get_metor_sample(*weather_seed, start_and_end_aerodrome.0.metor_data.clone());
    let runway_index: usize =
        (scenario_seed % (start_and_end_aerodrome.0.runways.len() as u64)) as usize;
    let runway = match start_and_end_aerodrome.0.runways.get(runway_index) {
        Some(runway) => runway,
        None => {
            return Ok(ServerResponse::Mistake(Mistake {
                details: "Runway not recognised".to_string(),
                message: departure_information_request.to_string(),
            }));
        }
    };

    if !departure_information_request.contains("request departure information") {
        return Ok(ServerResponse::Mistake(Mistake {
            details: format!(
                "Expected: {0} request departure information \n Found: {1}",
                &current_state.callsign.to_ascii_lowercase(),
                departure_information_request.to_string()
            ),
            message: departure_information_request.to_string(),
        }));
    }

    // Figure out airport runway, come up with some wind, pressure, temp and dewpoint numbers
    let atc_response = format!(
        "{0}, runway {1}, wind {2} degrees {3} knots, QNH {4}, temperature {5} dewpoint {6}",
        shorten_callsign(
            scenario_seed,
            &current_state.aircraft_type,
            &current_state.callsign
        ),
        runway.name,
        metor_sample.wind_direction,
        metor_sample.wind_speed,
        metor_sample.pressure,
        metor_sample.temp,
        metor_sample.dewpoint,
    );

    let next_state = SentState {
        status: Status::Parked {
            stage: ParkedStage::PreReadbackDepartInfo,
        },
        lat: start_and_end_aerodrome.0.lat,
        long: start_and_end_aerodrome.0.long,
        current_target: COMFrequency {
            frequency_type: current_state.current_target.frequency_type,
            frequency: current_state.current_target.frequency,
            callsign: current_state.current_target.callsign.clone(),
        },
        prefix: current_state.prefix.to_owned(), // Set by user: none, student, helicopter, police, etc...
        callsign: current_state.callsign.to_owned(),
        target_allocated_callsign: shorten_callsign(
            scenario_seed,
            &current_state.aircraft_type,
            &current_state.target_allocated_callsign.to_owned(),
        ), // Replaced by ATSU when needed
        emergency: Emergency::None,
        squark: false,
        current_radio_frequency: current_state.current_radio_frequency,
        current_transponder_frequency: current_state.current_transponder_frequency,
        aircraft_type: current_state.aircraft_type.to_owned(),
    };

    Ok(ServerResponse::StateMessage(SentStateMessage {
        state: next_state,
        message: atc_response,
    }))
}

pub fn parse_departure_information_readback(
    scenario_seed: &u64,
    weather_seed: &u64,
    departure_information_readback: &String,
    current_state: &RecievedState,
) -> Result<ServerResponse, Error> {
    let message_words = departure_information_readback
        .split_whitespace()
        .collect::<Vec<&str>>();

    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(*scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };

    let metor_sample =
        get_metor_sample(*weather_seed, start_and_end_aerodrome.0.metor_data.clone());
    let runway_index: usize =
        (scenario_seed % (start_and_end_aerodrome.0.runways.len() as u64)) as usize;
    let runway = match start_and_end_aerodrome.0.runways.get(runway_index) {
        Some(runway) => runway,
        None => {
            return Err(Error::msg("Runway not generated"));
        }
    };

    let runway_string = format!("runway {}", runway.name);
    let pressure_string = format!("qnh {}", metor_sample.pressure,);
    if !departure_information_readback.contains(runway_string.as_str())
        || !departure_information_readback.contains(pressure_string.as_str())
        || message_words[message_words.len() - 1]
            != current_state.target_allocated_callsign.to_ascii_lowercase()
    {
        return Ok(ServerResponse::Mistake(Mistake {
            details: format!(
                "Expected: {0} runway {1} qnh {2} {3}",
                &current_state.callsign.to_ascii_lowercase(),
                runway.name.to_ascii_lowercase(),
                metor_sample.pressure,
                current_state.target_allocated_callsign.to_ascii_lowercase()
            ),
            message: departure_information_readback.to_string(),
        }));
    }

    // ATC does not respond to this message
    let atc_response: String = String::new();

    let next_state = SentState {
        status: Status::Parked {
            stage: ParkedStage::PreTaxiRequest,
        },
        lat: start_and_end_aerodrome.0.lat,
        long: start_and_end_aerodrome.0.long,
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
        aircraft_type: current_state.aircraft_type.to_owned(),
    };

    Ok(ServerResponse::StateMessage(SentStateMessage {
        state: next_state,
        message: atc_response,
    }))
}

pub fn parse_taxi_request(
    scenario_seed: &u64,
    weather_seed: &u64,
    taxi_request: &String,
    current_state: &RecievedState,
) -> Result<ServerResponse, Error> {
    let message_words = taxi_request.split_whitespace().collect::<Vec<&str>>();

    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(*scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };
    let metor_sample =
        get_metor_sample(*weather_seed, start_and_end_aerodrome.0.metor_data.clone());

    let runway_index: usize =
        (scenario_seed % (start_and_end_aerodrome.0.runways.len() as u64)) as usize;
    let runway = match start_and_end_aerodrome.0.runways.get(runway_index) {
        Some(runway) => runway,
        None => {
            return Err(Error::msg("Runway not generated"));
        }
    };

    if message_words[0] != current_state.target_allocated_callsign.to_ascii_lowercase()
        || message_words[1] != current_state.aircraft_type.to_ascii_lowercase()
        || message_words.contains(
            &start_and_end_aerodrome
                .0
                .start_point
                .to_ascii_lowercase()
                .as_str(),
        )
        || message_words.contains(&start_and_end_aerodrome.1.name.to_ascii_lowercase().as_str())
    {
        return Ok(ServerResponse::Mistake(Mistake {
            details: format!(
                "Expected: {0} {1} at {2} request taxi VFR to {3}",
                current_state.target_allocated_callsign.to_ascii_lowercase(),
                current_state.aircraft_type.to_ascii_lowercase(),
                start_and_end_aerodrome.0.start_point.to_ascii_lowercase(),
                start_and_end_aerodrome.1.name.to_ascii_lowercase(),
            ),
            message: taxi_request.to_string(),
        }));
    }

    let atc_response = format!(
        "{0}, taxi to holding point {1}, runway {2}, QNH {3}",
        current_state.target_allocated_callsign,
        runway.holding_points[0].name,
        runway.name,
        metor_sample.pressure,
    );

    let next_state = SentState {
        status: Status::Parked {
            stage: ParkedStage::PreTaxiClearanceReadback,
        },
        lat: start_and_end_aerodrome.0.lat,
        long: start_and_end_aerodrome.0.long,
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
        aircraft_type: current_state.aircraft_type.to_owned(),
    };

    Ok(ServerResponse::StateMessage(SentStateMessage {
        state: next_state,
        message: atc_response,
    }))
}

pub fn parse_taxi_readback(
    scenario_seed: &u64,
    weather_seed: &u64,
    taxi_request: &String,
    current_state: &RecievedState,
) -> Result<ServerResponse, Error> {
    let message_words = taxi_request.split_whitespace().collect::<Vec<&str>>();

    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(*scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };

    let metor_sample =
        get_metor_sample(*weather_seed, start_and_end_aerodrome.0.metor_data.clone());

    let runway_index: usize =
        (scenario_seed % (start_and_end_aerodrome.0.runways.len() as u64)) as usize;
    let runway = match start_and_end_aerodrome.0.runways.get(runway_index) {
        Some(runway) => runway,
        None => {
            return Err(Error::msg("Runway not generated"));
        }
    };

    if !(taxi_request.contains("taxi holding point")
        || taxi_request.contains("taxi to holding point"))
        || !message_words.contains(&runway.holding_points[0].name.to_ascii_lowercase().as_str())
        || message_words[message_words.len() - 1]
            != current_state.target_allocated_callsign.to_ascii_lowercase()
    {
        return Ok(ServerResponse::Mistake(Mistake {
            details: format!(
                "Expected: {0} taxi holding point {1} runway {2} qnh {3} {4}",
                current_state.target_allocated_callsign.to_ascii_lowercase(),
                runway.holding_points[0].name.to_ascii_lowercase(),
                runway.name.to_ascii_lowercase(),
                metor_sample.pressure,
                current_state.target_allocated_callsign.to_ascii_lowercase(),
            ),
            message: taxi_request.to_string(),
        }));
    }

    get_route(
        *scenario_seed,
        &start_and_end_aerodrome.0,
        &start_and_end_aerodrome.1,
    );

    let atc_response = String::new();

    let next_state = SentState {
        status: Status::Taxiing {
            stage: TaxiingStage::PreReadyForDeparture,
        },
        lat: start_and_end_aerodrome.0.lat,
        long: start_and_end_aerodrome.0.long,
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
        aircraft_type: current_state.aircraft_type.to_owned(),
    };

    Ok(ServerResponse::StateMessage(SentStateMessage {
        state: next_state,
        message: atc_response,
    }))
}
