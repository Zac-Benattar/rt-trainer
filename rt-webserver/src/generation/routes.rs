use rand::Rng;
use rand::seq::SliceRandom;

struct Waypoint {
    name: String,
    latitude: f64,
    longitude: f64,
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
            latitude: 51.1234,
            longitude: -0.5678,
        },
        Waypoint {
            name: "WAYPT2".to_string(),
            latitude: 51.4321,
            longitude: -0.9876,
        },
        // Add more waypoints as needed
    ];

    // Shuffle the waypoints to select a random subset
    let mut shuffled_waypoints = waypoints.choose_multiple(&mut rng, 5).cloned().collect::<Vec<_>>();

    // Initialize variables for route generation
    let mut route = vec![start.clone()];
    let mut total_distance = 0.0;

    for waypoint in shuffled_waypoints {
        // Calculate the distance between the last waypoint and the new one
        let distance = haversine_distance(
            route.last().unwrap().latitude,
            route.last().unwrap().longitude,
            waypoint.latitude,
            waypoint.longitude,
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

pub fn get_route(scenario_seed: u64, start_aerodrome: Aerodrome, destination_aerodrome: Aerodrome) {
    let start = Waypoint {
        name: start_aerodrome.icao_code,
        latitude: start_aerodrome.lat,
        longitude: start_aerodrome.long,
    };

    let destination = Waypoint {
        name: destination_aerodrome.icao_code,
        latitude: destination_aerodrome.lat,
        longitude: destination_aerodrome.long,
    };

    let route = generate_route(seed, &start, &destination);

    println!("Generated Route:");
    for waypoint in &route {
        println!("{}: ({}, {})", waypoint.name, waypoint.latitude, waypoint.longitude);
    }
}
