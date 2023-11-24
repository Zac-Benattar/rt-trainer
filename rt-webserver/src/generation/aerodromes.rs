use crate::models::aerodrome::{Aerodrome, COMFrequency, COMFrequencyType, Runway, METORData, HoldingPoint};

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

// Eventually the data should be stored in a database
pub fn get_large_aerodrome(seed: u32) -> Aerodrome {
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
            holding_points: vec![HoldingPoint{name: "A1".to_string()}]
        },
        Runway {
            name: "33".to_string(),
            holding_points: vec![HoldingPoint{name: "A1".to_string()}]
        },
    ];

    let metor_data = METORData {
        wind_direction: 260,
        avg_wind_speed: 5,
        min_wind_speed: 1,
        max_wind_speed: 45,
        avg_pressure: 960,
        min_pressure: 890,
        max_pressure: 1090,
        avg_temp: 10,
        min_temp: -5,
        max_temp: 33,
        avg_dewpoint: 9,
        min_dewpoint: -5,
        max_dewpoint: 28,
    };

    Aerodrome {
        name: "Birmingham".to_string(),
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
            holding_points: vec![HoldingPoint{name: "A1".to_string()}]
        },
        Runway {
            name: "36".to_string(),
            holding_points: vec![HoldingPoint{name: "A1".to_string()}]
        },
        Runway {
            name: "05".to_string(),
            holding_points: vec![HoldingPoint{name: "A1".to_string()}]
        },
        Runway {
            name: "23".to_string(),
            holding_points: vec![HoldingPoint{name: "A1".to_string()}]
        }
    ];

    let metor_data = METORData {
        wind_direction: 240,
        avg_wind_speed: 11,
        min_wind_speed: 1,
        max_wind_speed: 35,
        avg_pressure: 960,
        min_pressure: 890,
        max_pressure: 1090,
        avg_temp: 11,
        min_temp: -4,
        max_temp: 30,
        avg_dewpoint: 10,
        min_dewpoint: -5,
        max_dewpoint: 28,
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
