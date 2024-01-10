use anyhow::Error;

use crate::models::{
    aerodrome::Aerodrome,
    aerodrome::{COMFrequency, Runway},
    state::{
        AirborneEvent, Emergency, FlightRules, Mistake, ParkedStage, RecievedState, SentState,
        SentStateMessage, ServerResponse, Status, TaxiingStage, Waypoint,
    },
};

use super::{
    aerodrome_generators::{get_metor_sample, get_start_and_end_aerodromes},
    route_generator::get_route,
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
    let expected_radiocall = format!(
        "{0}, {1}, radio check {2}",
        current_state.current_target.callsign,
        current_state.callsign,
        current_state.current_radio_frequency
    );

    let message: &String = radio_check;
    let message_words: Vec<&str> = message.split_whitespace().collect::<Vec<&str>>();

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
                call_expected: expected_radiocall,
                details: "Frequency missing".to_string(),
                call_found: message.to_string(),
            }));
        }
    };

    // Convert frequency string to float
    let radio_freq_stated = match message_words[radio_freq_index].parse::<f32>() {
        Ok(frequency) => frequency,
        Err(_) => {
            return Ok(ServerResponse::Mistake(Mistake {
                call_expected: expected_radiocall,
                details: "Frequency not recognised".to_string(),
                call_found: message.to_string(),
            }));
        }
    };

    let callsign_expected: String = current_state.current_target.callsign.to_ascii_lowercase();
    let callsign_words: &Vec<&str> = &callsign_expected.split_whitespace().collect::<Vec<&str>>();
    for i in 0..callsign_words.len() {
        if message_words[i] != callsign_words[i] {
            return Ok(ServerResponse::Mistake(Mistake {
                call_expected: expected_radiocall,
                details: format!(
                    "Callsign not recognised: {}",
                    message_words[..callsign_words.len()].join(" ")
                ),
                call_found: message.to_string(),
            }));
        }
    }

    if message_words[callsign_words.len()] != current_state.callsign.to_ascii_lowercase() {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!(
                "Callsign not recognised: {}",
                message_words[..callsign_words.len()].join(" ")
            ),
            call_found: message.to_string(),
        }));
    }

    if message_words[radio_freq_index - 2] != "radio"
        || message_words[radio_freq_index - 1] != "check"
    {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: "Expected 'radio check' in message".to_string(),
            call_found: message.to_string(),
        }));
    }

    // Trailing 0s lost when frequency string parsed to float, hence comparison of floats rather than strings
    if radio_freq_stated != current_state.current_radio_frequency {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!(
                "Frequency incorrect: {0} \n Expected: {1}",
                radio_freq_stated, current_state.current_radio_frequency
            ),
            call_found: message.to_string(),
        }));
    }

    let atc_response: String = format!(
        "{0}, {1}, reading you 5",
        &current_state.callsign, &current_state.current_target.callsign
    );

    let next_state: SentState = SentState {
        status: Status::Parked {
            stage: ParkedStage::PreDepartInfo,
        },
        location: start_and_end_aerodrome.0.location,
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
    let expected_radiocall = format!(
        "{0} request departure information",
        current_state.callsign.to_ascii_lowercase()
    );

    let message_words: Vec<&str> = departure_information_request
        .split_whitespace()
        .collect::<Vec<&str>>();
    let callsign_expected: String = current_state.callsign.to_ascii_lowercase();
    let callsign_words: &Vec<&str> = &callsign_expected.split_whitespace().collect::<Vec<&str>>();
    for i in 0..callsign_words.len() {
        if message_words[i] != callsign_words[i] {
            return Ok(ServerResponse::Mistake(Mistake {
                call_expected: format!(
                    "{0} request departure information",
                    current_state.callsign.to_ascii_lowercase()
                ),
                details: "Remeber to include your whole callsign in your message".to_string(),
                call_found: departure_information_request.to_string(),
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

    let metor_sample: crate::models::aerodrome::METORDataSample =
        get_metor_sample(*weather_seed, start_and_end_aerodrome.0.metor_data.clone());
    let runway_index: usize =
        (scenario_seed % (start_and_end_aerodrome.0.runways.len() as u64)) as usize;
    let runway: &Runway = match start_and_end_aerodrome.0.runways.get(runway_index) {
        Some(runway) => runway,
        None => {
            return Ok(ServerResponse::Mistake(Mistake {
                call_expected: expected_radiocall,
                details: "Runway not recognised".to_string(),
                call_found: departure_information_request.to_string(),
            }));
        }
    };

    if !departure_information_request.contains("request departure information") {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: format!(
                "{0} request departure information",
                current_state.callsign.to_ascii_lowercase()
            ),
            details: format!(
                "Make sure to include the departure information request in your message.",
            ),
            call_found: departure_information_request.to_string(),
        }));
    }

    // Figure out airport runway, come up with some wind, pressure, temp and dewpoint numbers
    let atc_response: String = format!(
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

    let next_state: SentState = SentState {
        status: Status::Parked {
            stage: ParkedStage::PreReadbackDepartInfo,
        },
        location: start_and_end_aerodrome.0.location,
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
    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(*scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };

    let metor_sample: crate::models::aerodrome::METORDataSample =
        get_metor_sample(*weather_seed, start_and_end_aerodrome.0.metor_data.clone());
    let runway_index: usize =
        (scenario_seed % (start_and_end_aerodrome.0.runways.len() as u64)) as usize;
    let runway: &Runway = match start_and_end_aerodrome.0.runways.get(runway_index) {
        Some(runway) => runway,
        None => {
            return Err(Error::msg("Runway not generated"));
        }
    };

    let runway_string: String = format!("runway {}", runway.name);
    let pressure_string: String = format!("qnh {}", metor_sample.pressure,);

    let expected_radiocall: String = format!(
        "{0} runway {1} qnh {2} {3}",
        current_state.target_allocated_callsign.to_ascii_lowercase(),
        runway.name.to_ascii_lowercase(),
        metor_sample.pressure,
        current_state.target_allocated_callsign.to_ascii_lowercase()
    );

    let message_words: Vec<&str> = departure_information_readback
        .split_whitespace()
        .collect::<Vec<&str>>();

    if !departure_information_readback.contains(runway_string.as_str())
        || !departure_information_readback.contains(pressure_string.as_str())
        || message_words[message_words.len() - 1]
            != current_state.target_allocated_callsign.to_ascii_lowercase()
    {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!("Make sure to include the runway and air pressure in your readback.",),
            call_found: departure_information_readback.to_string(),
        }));
    }

    // ATC does not respond to this message
    let atc_response: String = String::new();

    let next_state: SentState = SentState {
        status: Status::Parked {
            stage: ParkedStage::PreTaxiRequest,
        },
        location: start_and_end_aerodrome.0.location,
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
    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(*scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };
    let metor_sample: crate::models::aerodrome::METORDataSample =
        get_metor_sample(*weather_seed, start_and_end_aerodrome.0.metor_data.clone());

    let runway_index: usize =
        (scenario_seed % (start_and_end_aerodrome.0.runways.len() as u64)) as usize;
    let runway: Runway = match start_and_end_aerodrome.0.runways.get(runway_index) {
        Some(runway) => runway.to_owned(),
        None => {
            return Err(Error::msg("Runway not generated"));
        }
    };

    let expected_radiocall: String = format!(
        "{0} {1} at {2} request taxi VFR to {3}",
        current_state.target_allocated_callsign.to_ascii_lowercase(),
        current_state.aircraft_type.to_ascii_lowercase(),
        start_and_end_aerodrome.0.start_point.to_ascii_lowercase(),
        start_and_end_aerodrome.1.name.to_ascii_lowercase(),
    );

    let message_words: Vec<&str> = taxi_request.split_whitespace().collect::<Vec<&str>>();

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
            call_expected: expected_radiocall,
            details: format!(
                "Make sure to include the aircraft type, start point and destination in your request.",
            ),
            call_found: taxi_request.to_string(),
        }));
    }

    let atc_response: String = format!(
        "{0}, taxi to holding point {1}, runway {2}, QNH {3}",
        current_state.target_allocated_callsign,
        runway.holding_points[0].name,
        runway.name,
        metor_sample.pressure,
    );

    let next_state: SentState = SentState {
        status: Status::Parked {
            stage: ParkedStage::PreTaxiClearanceReadback,
        },
        location: start_and_end_aerodrome.0.location,
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
    let message_words: Vec<&str> = taxi_request.split_whitespace().collect::<Vec<&str>>();

    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(*scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };

    let metor_sample: crate::models::aerodrome::METORDataSample =
        get_metor_sample(*weather_seed, start_and_end_aerodrome.0.metor_data.clone());

    let runway_index: usize =
        (scenario_seed % (start_and_end_aerodrome.0.runways.len() as u64)) as usize;
    let runway: &crate::models::aerodrome::Runway =
        match start_and_end_aerodrome.0.runways.get(runway_index) {
            Some(runway) => runway,
            None => {
                return Err(Error::msg("Runway not generated"));
            }
        };

    let expected_radiocall: String = format!(
        "{0} taxi holding point {1} runway {2} qnh {3} {4}",
        current_state.target_allocated_callsign.to_ascii_lowercase(),
        runway.holding_points[0].name.to_ascii_lowercase(),
        runway.name.to_ascii_lowercase(),
        metor_sample.pressure,
        current_state.target_allocated_callsign.to_ascii_lowercase(),
    );

    if !(taxi_request.contains("taxi holding point")
        || taxi_request.contains("taxi to holding point"))
        || !message_words.contains(&runway.holding_points[0].name.to_ascii_lowercase().as_str())
        || message_words[message_words.len() - 1]
            != current_state.target_allocated_callsign.to_ascii_lowercase()
    {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!("Make sure to include the holding point and runway in your readback.",),
            call_found: taxi_request.to_string(),
        }));
    }

    get_route(
        *scenario_seed,
        &start_and_end_aerodrome.0,
        &start_and_end_aerodrome.1,
    );

    let atc_response: String = String::new();

    let next_state: SentState = SentState {
        status: Status::Taxiing {
            stage: TaxiingStage::PreReadyForDeparture,
        },
        location: start_and_end_aerodrome.0.location,
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

/* Parse initial contact with ATC unit.
Should consist of ATC callsign and aircraft callsign */
pub fn parse_new_airspace_initial_contact(
    scenario_seed: &u64,
    weather_seed: &u64,
    radiocall: &String,
    flight_rules: &FlightRules,
    altitude: &u32,
    heading: &u32,
    speed: &u32,
    current_point: &Waypoint,
    current_state: &RecievedState,
) -> Result<ServerResponse, Error> {
    let expected_radiocall: String = format!(
        "{0}, {1}",
        current_state.current_target.callsign.to_ascii_lowercase(),
        current_state.callsign.to_ascii_lowercase(),
    );

    if !radiocall.contains(
        current_state
            .current_target
            .callsign
            .to_ascii_lowercase()
            .as_str(),
    ) {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!(
                "Remember to include the target callsign at the start of your initial message.",
            ),
            call_found: radiocall.to_string(),
        }));
    }

    if !radiocall.contains(current_state.callsign.to_ascii_lowercase().as_str()) {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!("Remember to include your own callsign in your initial message.",),
            call_found: radiocall.to_string(),
        }));
    }

    let message_words: Vec<&str> = radiocall.split_whitespace().collect::<Vec<&str>>();
    let callsign_expected: String = current_state.callsign.to_ascii_lowercase();
    let callsign_words: &Vec<&str> = &callsign_expected.split_whitespace().collect::<Vec<&str>>();
    let target_callsign_expected: String =
        current_state.current_target.callsign.to_ascii_lowercase();
    let target_callsign_words: &Vec<&str> = &target_callsign_expected
        .split_whitespace()
        .collect::<Vec<&str>>();

    if message_words.len() > callsign_words.len() + target_callsign_words.len() {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!("Keep your calls brief.",),
            call_found: radiocall.to_string(),
        }));
    }

    let atc_response: String = format!(
        "{0}, {1}.",
        current_state.callsign, current_state.current_target.callsign,
    );

    let next_state: SentState = SentState {
        status: Status::Airborne {
            // These need to be updated with the information for the next waypoint
            flight_rules: flight_rules.to_owned(),
            altitude: altitude.to_owned(),
            heading: heading.to_owned(),
            speed: speed.to_owned(),
            current_point: current_point.to_owned(),
            airborne_event: AirborneEvent::PreNewAirspaceFlightDetailsGiven,
        },
        location: current_point.location,
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

/* Parse response to ATC unit acknowledging initial contact
call. Should consist of aircraft callsign and type, flight
rules, departure and destination aerodromes, position,
flight level/altitude including passing/cleared level if not
in level flight, and additional details such as next waypoint(s)
accompanied with the planned times to reach them */
pub fn parse_new_airspace_give_flight_information_to_atc(
    scenario_seed: &u64,
    weather_seed: &u64,
    radiocall: &String,
    flight_rules: &FlightRules,
    altitude: &u32,
    heading: &u32,
    speed: &u32,
    current_point: &Waypoint,
    current_state: &RecievedState,
) -> Result<ServerResponse, Error> {
    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(*scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };

    let nearest_waypoint: &str = "Test Waypoint";
    let distance_from_nearest_waypoint: f64 = 0.0;
    let direction_to_nearest_waypoint: &str = "Direction";

    let next_waypoint: &str = "Next Waypoint";

    let expected_radiocall: String = format!(
        "{0} {1}, {2} {3} from {4} to {5}, {6} miles {7} of {8}, {9}, {10}",
        current_state.prefix.to_ascii_lowercase(),
        current_state.callsign.to_ascii_lowercase(),
        current_state.aircraft_type.to_ascii_lowercase(),
        flight_rules.to_string(),
        start_and_end_aerodrome.0.name.to_ascii_lowercase(),
        start_and_end_aerodrome.1.name.to_ascii_lowercase(),
        distance_from_nearest_waypoint,
        direction_to_nearest_waypoint,
        nearest_waypoint,
        altitude,
        next_waypoint,
    );

    if !radiocall.contains(
        current_state
            .current_target
            .callsign
            .to_ascii_lowercase()
            .as_str(),
    ) {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!(
                "Remember to include the target callsign at the start of your initial message.",
            ),
            call_found: radiocall.to_string(),
        }));
    }

    if !radiocall.contains(current_state.callsign.to_ascii_lowercase().as_str()) {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!("Remember to include your own callsign in your initial message.",),
            call_found: radiocall.to_string(),
        }));
    }

    let atc_response: String = String::new();

    // -----------------------------------------------------------------------------------------
    // Current target and current point need to be updated here with next waypoint
    // -----------------------------------------------------------------------------------------
    let next_state: SentState = SentState {
        status: Status::Airborne {
            // These need to be updated with the information for the next waypoint
            flight_rules: flight_rules.to_owned(),
            altitude: altitude.to_owned(),
            heading: heading.to_owned(),
            speed: speed.to_owned(),
            current_point: current_point.to_owned(),
            airborne_event: AirborneEvent::PreNewAirspaceFlightDetailsGiven,
        },
        location: current_point.location,
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

/* Parse response to ATC unit requesting squark.
Should consist of aircraft callsign and squark code */
pub fn parse_new_airspace_squark(
    scenario_seed: &u64,
    weather_seed: &u64,
    radiocall: &String,
    sqwark: &u16,
    flight_rules: &FlightRules,
    altitude: &u32,
    heading: &u32,
    speed: &u32,
    current_point: &Waypoint,
    current_state: &RecievedState,
) -> Result<ServerResponse, Error> {
    let expected_radiocall: String = format!(
        "Squawk {0}, {1} {2}",
        sqwark,
        current_state.prefix.to_ascii_lowercase(),
        current_state.target_allocated_callsign.to_ascii_lowercase(),
    );

    if !radiocall.contains(sqwark.to_string().as_str()) {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!(
                "Remember to include the sqwark code at the start of your initial message.",
            ),
            call_found: radiocall.to_string(),
        }));
    }

    if !radiocall.contains(current_state.callsign.to_ascii_lowercase().as_str()) {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!("Remember to include your own callsign in your initial message.",),
            call_found: radiocall.to_string(),
        }));
    }

    let nearest_waypoint: &str = "Test Waypoint";
    let distance_from_nearest_waypoint: f64 = 0.0;
    let direction_to_nearest_waypoint: &str = "Direction";
    let next_waypoint: &str = "Next Waypoint";

    let atc_response: String = format!(
        "{0} {1}, identified {2} miles {3} of {4}. Next report at {5}",
        current_state.prefix,
        current_state.target_allocated_callsign,
        nearest_waypoint,
        distance_from_nearest_waypoint,
        direction_to_nearest_waypoint,
        next_waypoint,
    );

    let next_state: SentState = SentState {
        status: Status::Airborne {
            // These need to be updated with the information for the next waypoint
            flight_rules: flight_rules.to_owned(),
            altitude: altitude.to_owned(),
            heading: heading.to_owned(),
            speed: speed.to_owned(),
            current_point: current_point.to_owned(),
            airborne_event: AirborneEvent::PreWilco,
        },
        location: current_point.location,
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
            &current_state.callsign,
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

/* Parse Wilco in response to an instruction from ATC unit.
Should consist of Wilco followed by aircraft callsign */
pub fn parse_wilco(
    scenario_seed: &u64,
    weather_seed: &u64,
    radiocall: &String,
    flight_rules: &FlightRules,
    altitude: &u32,
    heading: &u32,
    speed: &u32,
    current_point: &Waypoint,
    current_state: &RecievedState,
) -> Result<ServerResponse, Error> {
    let expected_radiocall: String = format!(
        "Wilco, {0} {1}",
        current_state.prefix.to_ascii_lowercase(),
        current_state.target_allocated_callsign.to_ascii_lowercase(),
    );

    if !radiocall.contains("wilco".to_string().as_str())
        || !radiocall.contains("will comply".to_string().as_str())
    {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!("Remember to include wilco at the start of your initial message.",),
            call_found: radiocall.to_string(),
        }));
    }

    if !radiocall.contains(current_state.callsign.to_ascii_lowercase().as_str()) {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!("Remember to include your own callsign in your initial message.",),
            call_found: radiocall.to_string(),
        }));
    }

    let atc_response: String = String::new();

    let next_state: SentState = SentState {
        status: Status::Airborne {
            // These need to be updated with the information for the next waypoint
            flight_rules: flight_rules.to_owned(),
            altitude: altitude.to_owned(),
            heading: heading.to_owned(),
            speed: speed.to_owned(),
            current_point: current_point.to_owned(),
            airborne_event: AirborneEvent::PreWilco,
        },
        location: current_point.location,
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
            &current_state.callsign,
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

/* Parse VFR position report.
Should contain the aircraft callsign, location relative to a waypoint,
and the flight level/altitude including passing level and cleared level
if not in level flight. */
/* Parse Wilco in response to an instruction from ATC unit.
Should consist of Wilco followed by aircraft callsign */
pub fn parse_vfr_position_report(
    scenario_seed: &u64,
    weather_seed: &u64,
    radiocall: &String,
    flight_rules: &FlightRules,
    altitude: &u32,
    heading: &u32,
    speed: &u32,
    current_point: &Waypoint,
    current_state: &RecievedState,
) -> Result<ServerResponse, Error> {
    // May need more details to be accurate to specific situation
    let expected_radiocall: String = format!(
        "{0} {1}, overhead {2}, {3} feet",
        current_state.prefix.to_ascii_lowercase(),
        current_state.target_allocated_callsign.to_ascii_lowercase(),
        current_point.name.to_ascii_lowercase(),
        altitude,
    );

    if !radiocall.contains(current_state.callsign.to_ascii_lowercase().as_str()) {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!(
                "Remember to include your own callsign at the start of your radio call.",
            ),
            call_found: radiocall.to_string(),
        }));
    }

    if !radiocall.contains(current_point.name.to_ascii_lowercase().as_str()) {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!("Remember to include your current location in your radio call.",),
            call_found: radiocall.to_string(),
        }));
    }

    if !radiocall.contains(altitude.to_string().to_ascii_lowercase().as_str()) {
        return Ok(ServerResponse::Mistake(Mistake {
            call_expected: expected_radiocall,
            details: format!("Remember to include your altitude in your radio call.",),
            call_found: radiocall.to_string(),
        }));
    }

    let atc_response: String = String::new();

    // Logic required to figure out next state
    let next_state: SentState = SentState {
        status: Status::Airborne {
            // These need to be updated with the information for the next waypoint
            flight_rules: flight_rules.to_owned(),
            altitude: altitude.to_owned(),
            heading: heading.to_owned(),
            speed: speed.to_owned(),
            current_point: current_point.to_owned(),
            airborne_event: AirborneEvent::PreWilco,
        },
        location: current_point.location,
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
            &current_state.callsign,
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
