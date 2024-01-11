use crate::models::{
    aerodrome::{
        Aerodrome, COMFrequency, COMFrequencyType, HoldingPoint, METORData, METORDataSample, Runway,
    },
    state::Location,
};
use rand::rngs::SmallRng;
use rand::seq::SliceRandom;
use rand::SeedableRng;
use rand_distr::{Distribution, Normal};

use super::route_generator::haversine_distance;

enum Season {
    Spring,
    Summer,
    Autumn,
    Winter,
}

pub fn get_start_and_end_aerodromes(seed: u64) -> Option<(Aerodrome, Aerodrome)> {
    let large_aerodromes = vec![
        get_large_aerodrome(1),
        get_large_aerodrome(2),
        get_large_aerodrome(3),
        get_large_aerodrome(4),
        get_large_aerodrome(5),
        get_large_aerodrome(6),
        get_large_aerodrome(7),
        get_large_aerodrome(8),
        get_large_aerodrome(9),
        get_large_aerodrome(10),
    ];

    let small_aerodromes = vec![
        get_small_aerodrome(1),
        get_small_aerodrome(2),
        get_small_aerodrome(3),
        get_small_aerodrome(4),
        get_small_aerodrome(5),
        get_small_aerodrome(6),
        get_small_aerodrome(7),
        get_small_aerodrome(8),
        get_small_aerodrome(9),
        get_small_aerodrome(10),
    ];

    generate_start_and_end_aerodromes(seed, &small_aerodromes, &large_aerodromes)
}

fn generate_start_and_end_aerodromes(
    seed: u64,
    small_aerodromes: &[Aerodrome],
    large_aerodromes: &[Aerodrome],
) -> Option<(Aerodrome, Aerodrome)> {
    let mut rng = rand::rngs::SmallRng::seed_from_u64(seed);

    let mut start: Option<&Aerodrome> = None;
    let mut destination: Option<&Aerodrome> = None;

    // Attempt to find valid start and destination waypoints within 300 nautical miles
    for _ in 0..1000 {
        if seed % 2 == 0 {
            start = large_aerodromes.choose(&mut rng);
            destination = small_aerodromes.choose(&mut rng);
        } else {
            start = small_aerodromes.choose(&mut rng);
            destination = large_aerodromes.choose(&mut rng);
        }

        let distance = haversine_distance(
            start.unwrap().location.lat,
            start.unwrap().location.long,
            destination.unwrap().location.lat,
            destination.unwrap().location.long,
        );

        if distance <= 300.0 {
            break;
        }
    }

    match (start, destination) {
        (Some(start), Some(destination)) => Some((start.clone(), destination.clone())),
        _ => None,
    }
}

pub fn get_metor_sample(seed: u64, metor_data: METORData) -> METORDataSample {
    let mut rng = SmallRng::seed_from_u64(seed);

    let season = match seed % 4 {
        0 => Season::Spring,
        1 => Season::Summer,
        2 => Season::Autumn,
        _ => Season::Winter,
    };

    // Simulate temperature based on season with a normal distribution
    let mean_temp = match season {
        Season::Spring => metor_data.mean_temp as f32 * 1.3,
        Season::Summer => metor_data.mean_temp as f32 * 1.7,
        Season::Autumn => metor_data.mean_temp as f32 * 1.1,
        Season::Winter => metor_data.mean_temp as f32 * 0.4,
    };

    let wind_direction_normal = Normal::new(metor_data.avg_wind_direction, 10.0).unwrap();
    let wind_direction = wind_direction_normal.sample(&mut rng) % 360.0;

    let temp_normal = Normal::new(mean_temp, metor_data.std_temp).unwrap();
    let temp = temp_normal.sample(&mut rng);

    let wind_speed_normal =
        Normal::new(metor_data.mean_wind_speed, metor_data.std_wind_speed).unwrap();
    let wind_speed = wind_speed_normal.sample(&mut rng);

    let pressure_normal = Normal::new(metor_data.mean_pressure, metor_data.std_temp).unwrap();
    let pressure = pressure_normal.sample(&mut rng);

    return METORDataSample {
        wind_direction: wind_direction as u16,
        wind_speed: wind_speed as u16,
        pressure: pressure as u32,
        temp: temp as i8,
        dewpoint: ((temp * 0.95) - 1.2) as i8, // this needs improving
    };
}

// Eventually the data should be stored in a database
pub fn get_large_aerodrome(seed: u64) -> Aerodrome {
    let atis = COMFrequency {
        frequency_type: COMFrequencyType::ATIS,
        frequency: 136.030,
        callsign: "Birmingham Info".to_string(),
    };
    let tower = COMFrequency {
        frequency_type: COMFrequencyType::Tower,
        frequency: 118.305,
        callsign: "Birmingham Tower".to_string(),
    };
    let ground = COMFrequency {
        frequency_type: COMFrequencyType::Ground,
        frequency: 121.805,
        callsign: "Birmingham Ground".to_string(),
    };
    let runways = vec![
        Runway {
            name: "15".to_string(),
            holding_points: vec![HoldingPoint {
                name: "A1".to_string(),
            }],
        },
        Runway {
            name: "33".to_string(),
            holding_points: vec![HoldingPoint {
                name: "A1".to_string(),
            }],
        },
    ];

    let metor_data = METORData {
        avg_wind_direction: 260.0,
        mean_wind_speed: 5.0,
        std_wind_speed: 3.0,
        mean_pressure: 960.0,
        std_pressure: 1.2,
        mean_temp: 10.0,
        std_temp: 2.0,
        mean_dewpoint: 9.0,
        std_dewpoint: 2.0,
    };

    Aerodrome {
        name: "Birmingham".to_string(),
        icao: "EGBB".to_string(),
        com_frequencies: vec![atis, tower, ground],
        runways: runways,
        location: Location {
            lat: 52.452997,
            long: -1.740041,
        },
        altitude: 327,
        start_point: "North Side Hangers".to_string(),
        metor_data,
    }
}

// Eventually the data should be stored in a database
pub fn get_small_aerodrome(seed: u64) -> Aerodrome {
    let afis = COMFrequency {
        frequency_type: COMFrequencyType::AFIS,
        frequency: 180.030,
        callsign: "Wellesbourne Information".to_string(),
    };

    let runways: Vec<Runway> = vec![
        Runway {
            name: "18".to_string(),
            holding_points: vec![HoldingPoint {
                name: "A1".to_string(),
            }],
        },
        Runway {
            name: "36".to_string(),
            holding_points: vec![HoldingPoint {
                name: "A1".to_string(),
            }],
        },
        Runway {
            name: "05".to_string(),
            holding_points: vec![HoldingPoint {
                name: "A1".to_string(),
            }],
        },
        Runway {
            name: "23".to_string(),
            holding_points: vec![HoldingPoint {
                name: "A1".to_string(),
            }],
        },
    ];

    let metor_data = METORData {
        avg_wind_direction: 240.0,
        mean_wind_speed: 11.0,
        std_wind_speed: 2.5,
        mean_pressure: 960.0,
        std_pressure: 1.2,
        mean_temp: 11.0,
        std_temp: 3.0,
        mean_dewpoint: 10.0,
        std_dewpoint: 3.0,
    };

    Aerodrome {
        name: "Wellesbourne Mountford".to_string(),
        icao: "EGBW".to_string(),
        com_frequencies: vec![afis],
        runways: runways,
        location: Location {
            lat: 52.1922,
            long: -1.6144,
        },
        altitude: 163,
        start_point: "South Side Hangers".to_string(),
        metor_data,
    }
}
