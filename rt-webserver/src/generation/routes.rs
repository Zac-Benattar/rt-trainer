use rand::seq::SliceRandom;
use rand::SeedableRng;

use crate::models::{aerodrome::{Aerodrome, COMFrequency}, state::{Waypoint, WaypointType}};

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

fn generate_route(
    seed: u64,
    start: &Waypoint,
    destination: &Waypoint,
    max_wayponts: usize,
) -> Vec<Waypoint> {
    let mut rng = rand::rngs::SmallRng::seed_from_u64(seed);

    // For testing
    let birmingham_tower = COMFrequency {
        frequency_type: crate::models::aerodrome::COMFrequencyType::Tower,
        frequency: 118.3,
        callsign: "BIRMINGHAM TOWER".to_string(),
    };

    // For testing
    let waypoints = vec![
        Waypoint {
            name: "WAYPT1".to_string(),
            lat: 51.1234,
            long: -0.5678,
            com_frequencies: vec![birmingham_tower.clone()],
            waypoint_type: WaypointType::VOR,
        },
        Waypoint {
            name: "WAYPT2".to_string(),
            lat: 51.4321,
            long: -0.9876,
            com_frequencies: vec![birmingham_tower.clone()],
            waypoint_type: WaypointType::VOR,
        },
        Waypoint {
            name: "WAYPT3".to_string(),
            lat: 51.8765,
            long: -0.1234,
            com_frequencies: vec![birmingham_tower.clone()],
            waypoint_type: WaypointType::VOR,
        },
        Waypoint {
            name: "WAYPT4".to_string(),
            lat: 51.6789,
            long: -0.4321,
            com_frequencies: vec![birmingham_tower.clone()],
            waypoint_type: WaypointType::VOR,
        },
        Waypoint {
            name: "WAYPT5".to_string(),
            lat: 51.2345,
            long: -0.8765,
            com_frequencies: vec![birmingham_tower.clone()],
            waypoint_type: WaypointType::VOR,
        },
        Waypoint {
            name: "WAYPT6".to_string(),
            lat: 51.9876,
            long: -0.6789,
            com_frequencies: vec![birmingham_tower.clone()],
            waypoint_type: WaypointType::VOR,
        },
        Waypoint {
            name: "WAYPT7".to_string(),
            lat: 51.3456,
            long: -0.2345,
            com_frequencies: vec![birmingham_tower.clone()],
            waypoint_type: WaypointType::VOR,
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
            route.last().unwrap().lat,
            route.last().unwrap().long,
            waypoint.lat,
            waypoint.long,
        );

        if total_distance + distance > 200.0 || route.len() >= max_wayponts {
            break;
        }

        route.push(waypoint.clone());
        total_distance += distance;
    }

    route.push(destination.clone());

    route
}

pub fn get_route(
    scenario_seed: u64,
    start_aerodrome: &Aerodrome,
    destination_aerodrome: &Aerodrome,
) {
    let start = Waypoint {
        name: (&start_aerodrome.icao).to_owned(),
        lat: start_aerodrome.lat,
        long: start_aerodrome.long,
        com_frequencies: start_aerodrome.com_frequencies.clone(), // Needs improving, should be able to select the correct frequency
        waypoint_type: WaypointType::Aerodrome,
    };

    let destination = Waypoint {
        name: (&destination_aerodrome.icao).to_owned(),
        lat: destination_aerodrome.lat,
        long: destination_aerodrome.long,
        com_frequencies: destination_aerodrome.com_frequencies.clone(), // Needs improving, should be able to select the correct frequency
        waypoint_type: WaypointType::Aerodrome,
    };

    let route = generate_route(scenario_seed, &start, &destination, 5);

    println!("Generated Route:");
    for waypoint in &route {
        println!(
            "{}: ({}, {}) Control Zone: {}",
            waypoint.name, waypoint.lat, waypoint.long, waypoint.com_frequencies[0].callsign
        );
    }
}
