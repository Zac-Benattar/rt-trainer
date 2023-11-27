use rand::{Rng, SeedableRng};
use rand::seq::SliceRandom;

use crate::models::aerodrome::Aerodrome;


#[derive(Clone)]
struct Waypoint {
    pub name: String,
    pub lat: f64,
    pub long: f64,
}

pub fn haversine_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    const R: f64 = 3440.065; // Earth radius in nautical miles

    let d_lat = (lat2 - lat1).to_radians();
    let d_lon = (lon2 - lon1).to_radians();

    let a = (d_lat / 2.0).sin() * (d_lat / 2.0).sin()
        + lat1.to_radians().cos() * lat2.to_radians().cos() * (d_lon / 2.0).sin() * (d_lon / 2.0).sin();

    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());

    R * c
}

fn generate_route(seed: u64, start: &Waypoint, destination: &Waypoint) -> Vec<Waypoint> {
    let mut rng = rand::rngs::SmallRng::seed_from_u64(seed);

    // Define your list of waypoints with their names, latitudes, and longitudes
    let waypoints = vec![
        Waypoint {
            name: "WAYPT1".to_string(),
            lat: 51.1234,
            long: -0.5678,
        },
        Waypoint {
            name: "WAYPT2".to_string(),
            lat: 51.4321,
            long: -0.9876,
        },
        Waypoint {
            name: "WAYPT3".to_string(),
            lat: 51.8765,
            long: -0.1234,
        },
        Waypoint {
            name: "WAYPT4".to_string(),
            lat: 51.6789,
            long: -0.4321,
        },
        Waypoint {
            name: "WAYPT5".to_string(),
            lat: 51.2345,
            long: -0.8765,
        },
        Waypoint {
            name: "WAYPT6".to_string(),
            lat: 51.9876,
            long: -0.6789,
        },
        Waypoint {
            name: "WAYPT7".to_string(),
            lat: 51.3456,
            long: -0.2345,
        },
        // Add more waypoints as needed
    ];

    // Shuffle the waypoints to select a random subset
    let shuffled_waypoints = waypoints.choose_multiple(&mut rng, 5).cloned().collect::<Vec<_>>();

    // Initialize variables for route generation
    let mut route = vec![start.clone()];
    let mut total_distance = 0.0;

    for waypoint in shuffled_waypoints {
        // Calculate the distance between the last waypoint and the new one
        let distance = haversine_distance(
            route.last().unwrap().lat,
            route.last().unwrap().long,
            waypoint.lat,
            waypoint.long,
        );

        // Check if adding the new waypoint would exceed the distance or waypoint limit
        if total_distance + distance > 200.0 || route.len() >= 5 {
            break;
        }

        // Add the waypoint to the route
        route.push(waypoint.clone());
        total_distance += distance;
    }

    // Add the destination waypoint at the end of the route
    route.push(destination.clone());

    route
}

pub fn get_route(scenario_seed: u64, start_aerodrome: &Aerodrome, destination_aerodrome: &Aerodrome) {
    let start = Waypoint {
        name: (&start_aerodrome.icao).to_owned(),
        lat: start_aerodrome.lat,
        long: start_aerodrome.long,
    };

    let destination = Waypoint {
        name: (&destination_aerodrome.icao).to_owned(),
        lat: destination_aerodrome.lat,
        long: destination_aerodrome.long,
    };

    let route = generate_route(scenario_seed, &start, &destination);

    println!("Generated Route:");
    for waypoint in &route {
        println!("{}: ({}, {})", waypoint.name, waypoint.lat, waypoint.long);
    }
}
