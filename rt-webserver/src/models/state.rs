use serde::{Deserialize, Serialize};

struct ParkedStatusDetails {
    pub parking_position: String,
}

struct HoldingpointStatusDetails {
    pub holdingpoint: String,
}

struct ApronStatusDetails {
    pub apron: String,
}

struct TaxiingStatusDetails {
    pub taxiway: String,
}

struct TakeoffStatusDetails {
    pub runway: String,
}

struct AirborneStatusDetails {
    pub altitude: u32,
    pub heading: u32,
    pub speed: u32,
    pub next_point: String,
}

struct LandingStatusDetails {
    pub runway: String,
}

#[derive(Deserialize, Serialize)]
enum Status {
    Parked,
    Holdingpoint,
    Apron,
    Taxiing,
    Takeoff,
    Airborne,
    Landing,
}

#[derive(Deserialize, Serialize)]
enum StatusDetails {
    ParkedStatusDetails{parking_position: String},
    HoldingpointStatusDetails{holdingpoint: String},
    ApronStatusDetails{apron: String},
    TaxiingStatusDetails{taxiway: String},
    TakeoffStatusDetails{runway: String},
    AirborneStatusDetails{altitude: u32, heading: u32, speed: u32, next_point: String},
    LandingStatusDetails{runway: String},
}

#[derive(Deserialize, Serialize)]
enum Clearance {
    None,
    Taxi,
    Takeoff,
    Landing,
    Ascent,
    Descent,
}

#[derive(Deserialize, Serialize)]
pub struct State {
    pub status: Status,
    pub status_details: StatusDetails,
    pub clearance: Clearance,
    pub lat: u32,
    pub long: u32,
    pub current_atsu_callsign: String,
    pub prefix: String,
    pub callsign: String,
    pub atsu_allocated_callsign: String,
    pub emergency: String,
    pub squark: bool,
    pub atsu_frequency: u8,
    pub current_radio_frequency: u8,
    pub required_transponder_frequency: u8,
    pub current_transponder_frequency: u8,
}