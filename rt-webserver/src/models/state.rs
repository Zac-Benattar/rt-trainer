use std::fmt;

use serde::{Deserialize, Serialize};

use super::aerodrome::{COMFrequency, HoldingPoint, Runway};

#[derive(Deserialize, Serialize)]
pub enum ParkedStage {
    PreRadioCheck,
    PreDepartInfo,
    PreReadbackDepartInfo,
    PreTaxiRequest,
    PreTaxiClearanceReadback,
}

#[derive(Deserialize, Serialize)]
pub enum TaxiingStage {
    PreReadyForDeparture,
    PreInfoGivenForDeparture,
}

#[derive(Deserialize, Serialize)]
pub enum HoldingStage {
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
    PreAnnounceGoAround,    // If pilot decides to go around
}

#[derive(Deserialize, Serialize)]
pub enum JoinCiruitStage {
    PreHandshake,
    PreCircuitRequest,
    PreReadbackCircuitClearance,
    PreAcknowledgementAltitude,
    PreReportDescending,
    PreAcknowledgeGoAround, // If told to go around by ATC
    PreAnnounceGoAround,    // If pilot decides to go around
}

#[derive(Deserialize, Serialize)]
pub enum CircuitAndLandingStage {
    PreReportDownwind,
    PreReportTrafficInSight, // Optional if told to follow traffic
    PreReportFinal,
    PreReadbackContinueApproach,
    PreReadbackLandingClearance,
    PreAcknowledgeGoAround, // If told to go around by ATC
    PreAnnounceGoAround,    // If pilot decides to go around
}

#[derive(Deserialize, Serialize)]
pub enum LandedToParkedStage {
    PreHandshake, // For large airports - may not even be needed
    PreReadbackVacateRunwayRequest,
    PreVacatedRunway,
    PreTaxiClearanceReadback,
}

#[derive(Deserialize, Serialize)]
pub enum AirborneEvent {
    PreNewAirspaceInitialCall,
    PreNewAirspaceFlightDetailsGiven,
    PreNewAirspaceSquark {
        squark: u16,
    },
    PreChangeAltitudeWilco,
    PreChangeHeadingWilco,
    PreChangeSpeedWilco,
    PreChangeRouteWilco,
    PreWilco,
    PreVFRPositionReport,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub enum FlightRules {
    IFR,
    VFR,
}

impl fmt::Display for FlightRules {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
        // or, alternatively:
        // fmt::Debug::fmt(self, f)
    }
}

#[derive(Deserialize, Serialize)]
pub enum Status {
    Parked {
        stage: ParkedStage,
    },
    Taxiing {
        stage: TaxiingStage,
    },
    Holding {
        stage: HoldingStage,
        holding_point: HoldingPoint,
    },
    Takeoff {
        runway: Runway,
    },
    Airborne {
        flight_rules: FlightRules,
        altitude: u32,
        heading: u32,
        speed: u32,
        current_point: Waypoint,
        airborne_event: AirborneEvent,
    },
    Descent {},
    Approach {},
    Landing {
        runway: String,
    },
    LandingToParked {
        position: String,
        stage: LandedToParkedStage,
    },
}

#[derive(Deserialize, Serialize, Clone)]
pub enum WaypointType {
    Aerodrome,
    NDB,          // Non-directional beacon - helps with positioning
    VOR,          // VHF Omnidirectional Range station - helps with positioning
    Fix,          // Arbitrary well know easy to spot visual point e.g. a road junction or reservoir
    DME, // Distance Measuring Equipment - helps with positioning by measuring distance from a VOR
    GPS, // GPS waypoint - arbitrary point defined in terms of lat/long
    Intersection, // Intersection of two or more airways
    NewAirspace, // Entering new airspace - changing frequency
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Waypoint {
    pub waypoint_type: WaypointType,
    pub location: Location,
    pub name: String,
    pub com_frequencies: Vec<COMFrequency>,
}

#[derive(Deserialize, Serialize)]
pub enum Emergency {
    None,
    Mayday,
    PanPan,
}

#[derive(Deserialize, Serialize, Clone, Copy)]
pub struct Location {
    pub lat: f64,
    pub long: f64,
}

#[derive(Deserialize, Serialize)]
pub struct Pose {
    pub location: Location,
    pub altitude: i32,
    pub heading: u32,
    pub air_speed: u32,
}

#[derive(Deserialize, Serialize)]
pub struct SentState {
    pub status: Status,
    pub prefix: String,
    pub callsign: String,
    pub target_allocated_callsign: String,
    pub squark: bool,
    pub current_target: COMFrequency,
    pub current_radio_frequency: f32,
    pub current_transponder_frequency: u16,
    pub pose: Pose,
    pub emergency: Emergency,
    pub aircraft_type: String,
}

#[derive(Deserialize, Serialize)]
pub struct RecievedState {
    pub status: Status,
    pub prefix: String,
    pub callsign: String,
    pub target_allocated_callsign: String,
    pub squark: bool,
    pub current_target: COMFrequency,
    pub current_radio_frequency: f32,
    pub current_transponder_frequency: u16,
    pub emergency: Emergency,
    pub aircraft_type: String,
}

#[derive(Deserialize, Serialize)]
pub struct RecievedStateMessageSeed {
    pub state: RecievedState,
    pub message: String,
    pub scenario_seed: u64,
    pub weather_seed: u64,
}

#[derive(Deserialize, Serialize)]
pub struct SentStateMessage {
    pub state: SentState,
    pub message: String,
}

#[derive(Deserialize, Serialize)]
pub struct Mistake {
    pub call_expected: String,
    pub call_found: String,
    pub details: String,
}

#[derive(Deserialize, Serialize)]
pub enum ServerResponse {
    StateMessage(SentStateMessage),
    Mistake(Mistake),
}
