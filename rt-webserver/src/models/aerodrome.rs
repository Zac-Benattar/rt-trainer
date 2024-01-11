use serde::{Deserialize, Serialize};

use super::state::Location;

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

#[derive(Deserialize, Serialize, Clone)]
pub struct HoldingPoint {
    pub name: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Runway {
    pub name: String,
    pub holding_points: Vec<HoldingPoint>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Aerodrome {
    pub name: String,
    pub icao: String,
    pub com_frequencies: Vec<COMFrequency>,
    pub runways: Vec<Runway>,
    pub location: Location,
    pub altitude: i32,
    pub start_point: String,
    pub metor_data: METORData,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct METORData {
    pub avg_wind_direction: f32,
    pub mean_wind_speed: f32,
    pub std_wind_speed: f32,
    pub mean_pressure: f32,
    pub std_pressure: f32,
    pub mean_temp: f32,
    pub std_temp: f32,
    pub mean_dewpoint: f32,
    pub std_dewpoint: f32,
}

#[derive(Deserialize, Serialize)]
pub struct METORDataSample {
    pub wind_direction: u16,
    pub wind_speed: u16,
    pub pressure: u32,
    pub temp: i8,
    pub dewpoint: i8,
}
