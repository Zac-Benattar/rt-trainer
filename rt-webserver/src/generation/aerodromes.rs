use crate::models::aerodrome::{
    Aerodrome, COMFrequency, COMFrequencyType, HoldingPoint, METORData, METORDataSample, Runway,
};
use rand_distr::{Normal, Distribution};
use rand::SeedableRng;
use rand::rngs::SmallRng;

enum Season {
    Spring,
    Summer,
    Autumn,
    Winter,
}

pub fn get_start_aerodrome(seed: u32) -> Aerodrome {
    if seed % 2 == 0 {
        get_large_aerodrome(seed)
    } else {
        get_small_aerodrome(seed)
    }
}

pub fn get_destination_aerodrome(seed: u32) -> Aerodrome {
    if seed % 2 == 0 {
        get_small_aerodrome(seed)
    } else {
        get_large_aerodrome(seed)
    }
}

pub fn get_metor_sample(seed: u16, metor_data: METORData) -> METORDataSample {
    let mut rng = SmallRng::seed_from_u64(seed as u64);

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

    let wind_speed_normal = Normal::new(metor_data.mean_wind_speed, metor_data.std_wind_speed).unwrap();
    let wind_speed = wind_speed_normal.sample(&mut rng);

    let pressure_normal = Normal::new(metor_data.mean_pressure, metor_data.std_temp).unwrap();
    let pressure = pressure_normal.sample(&mut rng);

    return METORDataSample {
        wind_direction: wind_direction as u16,
        wind_speed: wind_speed as u16,
        pressure: pressure as u32,
        temp: temp as i8,
        dewpoint: ((temp * 0.95) - 1.2) as i8 // this needs improving
    }
}

// Eventually the data should be stored in a database
pub fn get_large_aerodrome(seed: u32) -> Aerodrome {
    let atis = COMFrequency {
        frequency_type: COMFrequencyType::ATIS,
        frequency: 136.030,
        callsign: "Birstdgham Info".to_string(),
    };
    let tower = COMFrequency {
        frequency_type: COMFrequencyType::Tower,
        frequency: 118.305,
        callsign: "Birstdgham Tower".to_string(),
    };
    let ground = COMFrequency {
        frequency_type: COMFrequencyType::Ground,
        frequency: 121.805,
        callsign: "Birstdgham Ground".to_string(),
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
        name: "Birstdgham".to_string(),
        icao: "EGBB".to_string(),
        com_frequencies: vec![atis, tower, ground],
        runways: runways,
        lat: 51.4700,
        long: -0.4543,
        start_point: "North Side Hangers".to_string(),
        metor_data,
    }
}

// Eventually the data should be stored in a database
pub fn get_small_aerodrome(seed: u32) -> Aerodrome {
    let afis = COMFrequency {
        frequency_type: COMFrequencyType::AFIS,
        frequency: 124.030,
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
        lat: 52.1922,
        long: -1.6144,
        start_point: "South Side Hangers".to_string(),
        metor_data,
    }
}
