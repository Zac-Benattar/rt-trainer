use crate::models::aerodrome::Aerodrome;

// Eventually the data should be stored in a database
pub fn get_large_aerodrome(seed: u32) -> Aerodrome {
    Aerodrome {
        name: "London Heathrow".to_string(),
        icao: "LHR".to_string(),
        atis: "LHR_ATIS".to_string(),
        atsu_frequency: 118.5,
        atsu_callsign: "LHR_ATSU".to_string(),
        lat: 51.4700,
        long: -0.4543,
    }
}

pub fn get_small_aerodrome(seed: u32) -> Aerodrome {
    Aerodrome {
        name: "Wellesbourne Mountford".to_string(),
        icao: "EGBW".to_string(),
        atis: "EGBW_ATIS".to_string(),
        atsu_frequency: 118.5,
        atsu_callsign: "EGBW_ATSU".to_string(),
        lat: 52.1922,
        long: -1.6144,
    }
}
