use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub enum ParkedToTakeoffStage {
    PreRadiocheck,
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
}

#[derive(Deserialize, Serialize)]
pub enum JoinCiruitStage {

}

# [derive(Deserialize, Serialize)]
pub enum CircuitAndLandingStage {

}

#[derive(Deserialize, Serialize)]
pub enum Status {
    Parked {
        position: String,
        stage: ParkedToTakeoffStage,
    },
    Taxiing {
        holdpoint: String,
        runway: String,
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
}

#[derive(Deserialize, Serialize)]
pub struct FlightPoint {
    lat: u32,
    long: u32,
    name: String,
}

#[derive(Deserialize, Serialize)]
pub struct State {
    pub status: Status,
    pub lat: u32,
    pub long: u32,
    pub current_atsu_callsign: String,
    pub prefix: String,
    pub callsign: String,
    pub atsu_allocated_callsign: String,
    pub emergency: String,
    pub squark: bool,
    pub atsu_frequency: u16,
    pub current_radio_frequency: u16,
    pub required_transponder_frequency: u16,
    pub current_transponder_frequency: u16,
}
