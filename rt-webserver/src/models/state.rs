use serde::{Deserialize, Serialize};

use super::aerodrome::COMFrequency;

#[derive(Deserialize, Serialize)]
pub enum ParkedToTakeoffStage {
    PreRadioCheck,
    PreDepartInfo,
    PreReadbackDepartInfo,
    PreTaxiRequest,
    PreTaxiClearanceReadback,
}

#[derive(Deserialize, Serialize)]
pub enum TaxiingToTakeoffStage {
    PreReadyForDeparture,
    PreInfoGivenForDeparture,
    PreClearedForTakeoff,
    PreReadbackClearedForTakeoff,
}

#[derive(Deserialize, Serialize)]
pub enum InboundForJoinStage {
    PreHandshake,
    PreLandingRequest,
    PreReadbackLandingClearance,
    PreAcknowledgementRAIS, // RAIS = report airodrome in sight
    PreAirodromeInSight,
    PreContactTower,
    PreAcknowledgeGoAround, // If told to go around by ATC
    PreAnnounceGoAround, // If pilot decides to go around
}

#[derive(Deserialize, Serialize)]
pub enum JoinCiruitStage {
    PreHandshake,
    PreCircuitRequest,
    PreReadbackCircuitClearance,
    PreAcknowledgementAltitude,
    PreReportDescending,
    PreAcknowledgeGoAround, // If told to go around by ATC
    PreAnnounceGoAround, // If pilot decides to go around
}

# [derive(Deserialize, Serialize)]
pub enum CircuitAndLandingStage {
    PreReportDownwind,
    PreReportTrafficInSight, // Optional if told to follow traffic
    PreReportFinal,
    PreReadbackContinueApproach,
    PreReadbackLandingClearance,
    PreAcknowledgeGoAround, // If told to go around by ATC
    PreAnnounceGoAround, // If pilot decides to go around
}

#[derive(Deserialize, Serialize)]
pub enum LandedToParkedStage {
    PreHandshake, // For large airports - may not even be needed
    PreReadbackVacateRunwayRequest,
    PreVacatedRunway, 
    PreTaxiClearanceReadback,
}

#[derive(Deserialize, Serialize)]
pub enum Status {
    Parked {
        stage: ParkedToTakeoffStage,
    },
    TaxiingToTakeoff {
        stage: TaxiingToTakeoffStage,
    },
    Airborne {
        altitude: u32,
        heading: u32,
        speed: u32,
        next_point: String,
    },
    Landing {
        runway: String,
    },
    LandingToParked {
        position: String,
        stage: LandedToParkedStage,
    },
}

#[derive(Deserialize, Serialize)]
pub struct Waypoint {
    lat: u32,
    long: u32,
    name: String,
}

#[derive(Deserialize, Serialize)]
pub enum Emergency {
    None,
    Mayday,
    PanPan,
}

#[derive(Deserialize, Serialize)]
pub struct State {
    pub status: Status,
    pub prefix: String,
    pub callsign: String,
    pub target_allocated_callsign: String,
    pub squark: bool,
    pub current_target: COMFrequency,
    pub current_radio_frequency: f32,
    pub current_transponder_frequency: u16,
    pub lat: f64,
    pub long: f64,
    pub emergency: Emergency,
    pub aircraft_type: String,
}

#[derive(Deserialize, Serialize)]
pub struct StateMessageSeed {
    pub state: State,
    pub message: String,
    pub scenario_seed: u64,
    pub weather_seed: u16,
}

#[derive(Deserialize, Serialize)]
pub struct StateMessage {
    pub state: State,
    pub message: String,
}
