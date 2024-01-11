use anyhow::Error;
use anyhow::Ok;

use rand::seq::SliceRandom;
use rand::SeedableRng;

use crate::models::state::Emergency;
use crate::models::state::ParkedStage;
use crate::models::state::Pose;
use crate::models::state::Route;
use crate::models::state::RoutePointType;
use crate::models::state::SentState;
use crate::models::{
    aerodrome::{Aerodrome, COMFrequency},
    state::{Location, RoutePoint, RoutePointStage},
};

use super::aerodrome_generators::get_start_and_end_aerodromes;

pub fn haversine_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    const R: f64 = 3440.065; // Earth radius in nautical miles

    let d_lat = (lat2 - lat1).to_radians();
    let d_lon = (lon2 - lon1).to_radians();

    let a = (d_lat / 2.0).sin() * (d_lat / 2.0).sin()
        + lat1.to_radians().cos()
            * lat2.to_radians().cos()
            * (d_lon / 2.0).sin()
            * (d_lon / 2.0).sin();

    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());

    R * c
}

fn generate_route_waypoints(
    seed: u64,
    start: &RoutePoint,
    destination: &RoutePoint,
    max_distance: f64,
    max_wayponts: usize,
) -> Vec<RoutePoint> {
    let mut rng = rand::rngs::SmallRng::seed_from_u64(seed);

    // For testing
    let birmingham_tower = COMFrequency {
        frequency_type: crate::models::aerodrome::COMFrequencyType::Tower,
        frequency: 118.3,
        callsign: "BIRMINGHAM TOWER".to_string(),
    };

    // For testing
    let waypoints = vec![
        RoutePoint {
            name: "WAYPT1".to_string(),
            location: Location {
                lat: 51.1234,
                long: -0.5678,
            },
            com_frequencies: vec![birmingham_tower.clone()],
            point_type: RoutePointType::Waypoint,
            states: vec![],
        },
        RoutePoint {
            name: "WAYPT2".to_string(),
            location: Location {
                lat: 51.4321,
                long: -0.9876,
            },
            com_frequencies: vec![birmingham_tower.clone()],
            point_type: RoutePointType::Waypoint,
            states: vec![],
        },
        RoutePoint {
            name: "WAYPT3".to_string(),
            location: Location {
                lat: 51.8765,
                long: -0.1234,
            },
            com_frequencies: vec![birmingham_tower.clone()],
            point_type: RoutePointType::Waypoint,
            states: vec![],
        },
        RoutePoint {
            name: "WAYPT4".to_string(),
            location: Location {
                lat: 51.6789,
                long: -0.4321,
            },
            com_frequencies: vec![birmingham_tower.clone()],
            point_type: RoutePointType::Waypoint,
            states: vec![],
        },
        RoutePoint {
            name: "WAYPT5".to_string(),
            location: Location {
                lat: 51.2345,
                long: -0.8765,
            },
            com_frequencies: vec![birmingham_tower.clone()],
            point_type: RoutePointType::Waypoint,
            states: vec![],
        },
        RoutePoint {
            name: "WAYPT6".to_string(),
            location: Location {
                lat: 51.9876,
                long: -0.6789,
            },
            com_frequencies: vec![birmingham_tower.clone()],
            point_type: RoutePointType::Waypoint,
            states: vec![],
        },
        RoutePoint {
            name: "WAYPT7".to_string(),
            location: Location {
                lat: 51.7654,
                long: -0.9876,
            },
            com_frequencies: vec![birmingham_tower.clone()],
            point_type: RoutePointType::Waypoint,
            states: vec![],
        },
    ];

    let shuffled_waypoints = waypoints
        .choose_multiple(&mut rng, 5)
        .cloned()
        .collect::<Vec<_>>();

    let mut route = vec![start.clone()];
    let mut total_distance = 0.0;

    for waypoint in shuffled_waypoints {
        let distance = haversine_distance(
            route.last().unwrap().location.lat,
            route.last().unwrap().location.long,
            waypoint.location.lat,
            waypoint.location.long,
        );

        if total_distance + distance > max_distance || route.len() >= max_wayponts {
            break;
        }

        route.push(waypoint.clone());
        total_distance += distance;
    }

    route.push(destination.clone());

    route
}

// State 1
pub fn get_pre_radio_check_state(scenario_seed: u64) -> Result<SentState, Error> {
    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };

    let start_aerodrome_frequency: &COMFrequency =
        start_and_end_aerodrome.0.com_frequencies.get(0).unwrap();
    // We don't need to calculate the destination aerodrome at this point as it is determined by the seed

    Ok(SentState {
        stage: RoutePointStage::Parked {
            stage: ParkedStage::PreRadioCheck,
        },
        pose: Pose {
            location: start_and_end_aerodrome.0.location,
            altitude: start_and_end_aerodrome.0.altitude,
            heading: 0,
            air_speed: 0,
        },
        current_target: COMFrequency {
            frequency_type: start_aerodrome_frequency.frequency_type,
            frequency: start_aerodrome_frequency.frequency,
            callsign: start_aerodrome_frequency.callsign.clone(),
        },
        callsign_modified: false, // States whether callsign has been modified by ATC, e.g. shortened
        emergency: Emergency::None,
        squark: false,
        current_transponder_frequency: 7000,
    })
}

// Stage 2
pub fn get_pre_requesting_depart_info_stage(scenario_seed: u64) -> Result<SentState, Error> {
    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };

    let start_aerodrome_frequency: &COMFrequency =
        start_and_end_aerodrome.0.com_frequencies.get(0).unwrap();
    // We don't need to calculate the destination aerodrome at this point as it is determined by the seed

    Ok(SentState {
        stage: RoutePointStage::Parked {
            stage: ParkedStage::PreReadbackDepartInfo,
        },
        pose: Pose {
            location: start_and_end_aerodrome.0.location,
            altitude: start_and_end_aerodrome.0.altitude,
            heading: 0,
            air_speed: 0,
        },
        current_target: COMFrequency {
            frequency_type: start_aerodrome_frequency.frequency_type,
            frequency: start_aerodrome_frequency.frequency,
            callsign: start_aerodrome_frequency.callsign.clone(),
        },
        callsign_modified: false, // States whether callsign has been modified by ATC, e.g. shortened
        emergency: Emergency::None,
        squark: false,
        current_transponder_frequency: 7000,
    })
}

pub fn generate_route_from_seed(scenario_seed: u64) -> Result<Route, Error> {
    let start_and_end_aerodrome: (Aerodrome, Aerodrome) =
        match get_start_and_end_aerodromes(scenario_seed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Error::msg("Aerodromes not generated"));
            }
        };

    let mut start_aerodrome_states: Vec<SentState>;

    // Pre performing radio check
    start_aerodrome_states.push(SentState {
        stage: RoutePointStage::Parked {
            stage: crate::models::state::ParkedStage::PreRadioCheck,
        },
        callsign_modified: false,
        squark: false,
        current_target: start_and_end_aerodrome
            .0
            .com_frequencies
            .get(0)
            .unwrap()
            .clone(), // Improve this by selecting the correct frequency
        current_transponder_frequency: 7000,
        pose: Pose {
            location: start_and_end_aerodrome.0.location,
            altitude: start_and_end_aerodrome.0.altitude,
            heading: 0,
            air_speed: 0,
        },
        emergency: Emergency::None,
    });

    // Pre requesting departure info
    start_aerodrome_states.push(SentState {
        stage: RoutePointStage::Parked {
            stage: crate::models::state::ParkedStage::PreDepartInfo,
        },
        callsign_modified: false,
        squark: false,
        current_target: start_and_end_aerodrome
            .0
            .com_frequencies
            .get(0)
            .unwrap()
            .clone(), // Improve this by selecting the correct frequency
        current_transponder_frequency: 7000,
        pose: Pose {
            location: start_and_end_aerodrome.0.location,
            altitude: start_and_end_aerodrome.0.altitude,
            heading: 0,
            air_speed: 0,
        },
        emergency: Emergency::None,
    });

    // Pre reading back departure info
    start_aerodrome_states.push(SentState {
        stage: RoutePointStage::Parked {
            stage: crate::models::state::ParkedStage::PreReadbackDepartInfo,
        },
        callsign_modified: false,
        squark: false,
        current_target: start_and_end_aerodrome
            .0
            .com_frequencies
            .get(0)
            .unwrap()
            .clone(), // Improve this by selecting the correct frequency
        current_transponder_frequency: 7000,
        pose: Pose {
            location: start_and_end_aerodrome.0.location,
            altitude: start_and_end_aerodrome.0.altitude,
            heading: 0,
            air_speed: 0,
        },
        emergency: Emergency::None,
    });

    // Pre requesting taxi clearance
    start_aerodrome_states.push(SentState {
        stage: RoutePointStage::Parked {
            stage: crate::models::state::ParkedStage::PreTaxiRequest,
        },
        callsign_modified: false,
        squark: false,
        current_target: start_and_end_aerodrome
            .0
            .com_frequencies
            .get(0)
            .unwrap()
            .clone(), // Improve this by selecting the correct frequency
        current_transponder_frequency: 7000,
        pose: Pose {
            location: start_and_end_aerodrome.0.location,
            altitude: start_and_end_aerodrome.0.altitude,
            heading: 0,
            air_speed: 0,
        },
        emergency: Emergency::None,
    });

    // Pre reading back taxi clearance
    start_aerodrome_states.push(SentState {
        stage: RoutePointStage::Parked {
            stage: crate::models::state::ParkedStage::PreTaxiClearanceReadback,
        },
        callsign_modified: false,
        squark: false,
        current_target: start_and_end_aerodrome
            .0
            .com_frequencies
            .get(0)
            .unwrap()
            .clone(), // Improve this by selecting the correct frequency
        current_transponder_frequency: 7000,
        pose: Pose {
            location: start_and_end_aerodrome.0.location,
            altitude: start_and_end_aerodrome.0.altitude,
            heading: 0,
            air_speed: 0,
        },
        emergency: Emergency::None,
    });

    let start: RoutePoint = RoutePoint {
        name: (&start_and_end_aerodrome.0.icao).to_owned(),
        location: start_and_end_aerodrome.0.location,
        point_type: RoutePointType::Aerodrome,
        com_frequencies: start_and_end_aerodrome.0.com_frequencies.clone(), // Needs improving, should be able to select the correct frequency
        states: start_aerodrome_states,
    };

    let mut destination_aerodrome_states: Vec<SentState>;

    let destination: RoutePoint = RoutePoint {
        name: (&start_and_end_aerodrome.1.icao).to_owned(),
        location: start_and_end_aerodrome.1.location,
        point_type: RoutePointType::Aerodrome,
        com_frequencies: start_and_end_aerodrome.1.com_frequencies.clone(), // Needs improving, should be able to select the correct frequency
        states: destination_aerodrome_states,
    };

    let mut route: Route;

    // Push start to route
    route.waypoints.push(start);

    // Generate route waypoints
    let waypoints: Vec<RoutePoint> =
        generate_route_waypoints(scenario_seed, &start, &destination, 200.0, 5);

    // Push all route waypoints to route
    for waypoint in &waypoints {
        route.waypoints.push(waypoint.clone());
    }

    // Push destination to route
    route.waypoints.push(destination);

    println!("Generated Route:");
    for waypoint in &route.waypoints {
        println!(
            "{}: ({}, {}) Control Zone: {}",
            waypoint.name, waypoint.point_type, waypoint.location.lat, waypoint.location.long,
        );
    }

    Ok(route)
}
