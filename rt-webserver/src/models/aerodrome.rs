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
pub struct HoldingPoint {
    pub name: String,
}

#[derive(Deserialize, Serialize)]
pub struct Runway {
    pub name: String,
    pub holding_points: Vec<HoldingPoint>,
}

#[derive(Deserialize, Serialize)]
pub struct Aerodrome {
    pub name: String,
    pub icao: String,
    pub com_frequencies: Vec<COMFrequency>,
    pub runways: Vec<Runway>,
    pub lat: f32,
    pub long: f32,
    pub start_point: String,
    pub metor_data: METORData,
}

#[derive(Deserialize, Serialize)]
pub struct METORData {
    pub wind_direction: u16,
    pub avg_wind_speed: u8,
    pub min_wind_speed: u8,
    pub max_wind_speed: u8,
    pub avg_pressure: u16,
    pub min_pressure: u16,
    pub max_pressure: u16,
    pub avg_temp: i8,
    pub min_temp: i8,
    pub max_temp: i8,
    pub avg_dewpoint: i8,
    pub min_dewpoint: i8,
    pub max_dewpoint: i8,
}

