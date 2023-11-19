use crate::models::aerodrome::{Aerodrome, COMFrequency, COMFrequencyType, Runway};

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
        },
        Runway {
            name: "33".to_string(),
        },
    ];
    Aerodrome {
        name: "Birmingham".to_string(),
        icao: "EGBB".to_string(),
        com_frequencies: vec![atis, tower, ground],
        runways: runways,
        lat: 51.4700,
        long: -0.4543,
        wind_direction: 260,
        wind_speed: 14,
        pressure: 990,
        temperature: 13,
        dewpoint: 10,
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
        },
        Runway {
            name: "36".to_string(),
        },
        Runway {
            name: "05".to_string(),
        },
        Runway {
            name: "23".to_string(),
        }
    ];
    Aerodrome {
        name: "Wellesbourne Mountford".to_string(),
        icao: "EGBW".to_string(),
        com_frequencies: vec![afis],
        runways: runways,
        lat: 52.1922,
        long: -1.6144,
        wind_direction: 240,
        wind_speed: 18,
        pressure: 997,
        temperature: 13,
        dewpoint: 10,
    }
}
