use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Clone, Copy)]
pub enum COMFrequencyType {
    AFIS,
    ATSU,
    ATIS,
    Tower,
    Ground,
    Approach,
    Departure,
    Radar,
    Unicom,
    Emergency,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct COMFrequency {
    pub frequency_type: COMFrequencyType,
    pub frequency: f32,
    pub callsign: String,
}

#[derive(Deserialize, Serialize)]
pub struct Runway {
    pub name: String,
}

#[derive(Deserialize, Serialize)]
pub struct Aerodrome {
    pub name: String,
    pub icao: String,
    pub com_frequencies: Vec<COMFrequency>,
    pub runways: Vec<Runway>,
    pub lat: f32,
    pub long: f32,
}
