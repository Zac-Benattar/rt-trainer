use std::fmt;

use serde::{Deserialize, Serialize};

use super::aerodrome::{COMFrequency, HoldingPoint, Runway};

#[derive(Deserialize, Serialize, Clone, Copy)]
pub enum ParkedStage {
    PreRadioCheck,
    PreDepartInfo,
    PreReadbackDepartInfo,
    PreTaxiRequest,
    PreTaxiClearanceReadback,
}

#[derive(Deserialize, Serialize, Clone, Copy)]
pub enum TaxiingStage {
    PreReadyForDeparture,
    PreInfoGivenForDeparture,
}

#[derive(Deserialize, Serialize, Clone, Copy)]
pub enum HoldingStage {
    PreClearedForTakeoff,
    PreReadbackClearedForTakeoff,
}

#[derive(Deserialize, Serialize, Clone, Copy)]
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

#[derive(Deserialize, Serialize, Clone, Copy)]
pub enum JoinCiruitStage {
    PreHandshake,
    PreCircuitRequest,
    PreReadbackCircuitClearance,
    PreAcknowledgementAltitude,
    PreReportDescending,
    PreAcknowledgeGoAround, // If told to go around by ATC
    PreAnnounceGoAround,    // If pilot decides to go around
}

#[derive(Deserialize, Serialize, Clone, Copy)]
pub enum CircuitAndLandingStage {
    PreReportDownwind,
    PreReportTrafficInSight, // Optional if told to follow traffic
    PreReportFinal,
    PreReadbackContinueApproach,
    PreReadbackLandingClearance,
    PreAcknowledgeGoAround, // If told to go around by ATC
    PreAnnounceGoAround,    // If pilot decides to go around
}

#[derive(Deserialize, Serialize, Clone, Copy)]
pub enum LandedToParkedStage {
    PreHandshake, // For large airports - may not even be needed
    PreReadbackVacateRunwayRequest,
    PreVacatedRunway,
    PreTaxiClearanceReadback,
}

#[derive(Deserialize, Serialize, Clone, Copy)]
pub enum WaypointStage {
    PreNewAirspaceInitialCall,
    PreNewAirspaceFlightDetailsGiven,
    PreNewAirspaceSquark { squark: u16 },
    PreChangeAltitudeWilco,
    PreChangeHeadingWilco,
    PreChangeSpeedWilco,
    PreChangeRouteWilco,
    PreWilco,
    PreVFRPositionReport,
}

#[derive(Deserialize, Serialize, Clone)]
pub enum DescentStage {

}

#[derive(Deserialize, Serialize, Clone)]
pub enum ApproachStage {

}

#[derive(Deserialize, Serialize, Clone)]
pub enum LandingStage {

}

#[derive(Deserialize, Serialize, Clone, Copy, Debug)]
pub enum FlightRules {
    IFR,
    VFR,
}

impl fmt::Display for FlightRules {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Deserialize, Serialize, Clone)]
pub enum RoutePointStage {
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
    // Non-directional beacon - helps with positioning
    NDB {
        stage: WaypointStage,
        flight_rules: FlightRules,
        airborne_event: WaypointStage,
    },
    // VHF Omnidirectional Range station - helps with positioning
    VOR {
        stage: WaypointStage,
        flight_rules: FlightRules,
        airborne_event: WaypointStage,
    },
    // Fix = Arbitrary well know easy to spot visual point e.g. a road junction or reservoir
    Fix {
        stage: WaypointStage,
        flight_rules: FlightRules,
        airborne_event: WaypointStage,
    },
    // Distance Measuring Equipment - helps with positioning by measuring distance from a VOR
    DME {
        stage: WaypointStage,
        flight_rules: FlightRules,
        airborne_event: WaypointStage,
    },
    // GPS waypoint - arbitrary point defined in terms of lat/long
    GPS {
        stage: WaypointStage,
        flight_rules: FlightRules,
        airborne_event: WaypointStage,
    },
    // Intersection of two or more airways
    Intersection {
        stage: WaypointStage,
        flight_rules: FlightRules,
        airborne_event: WaypointStage,
    },
    // Entering new airspace - changing frequency
    NewAirspace {
        stage: WaypointStage,
        flight_rules: FlightRules,
        airborne_event: WaypointStage,
    },
    // Descending for landing
    Descent {
        stage: DescentStage,
    },
    // Approach for landing
    Approach {
        stage: ApproachStage,
        runway: String,
    },
    // Landing on runday
    Landing {
        stage: LandingStage,
        runway: String,
    },
    // Taxiing to park
    LandingToParked {
        position: String,
        stage: LandedToParkedStage,
    },
}

#[derive(Deserialize, Serialize, Clone, Copy, Debug)]
pub enum RoutePointType {
    Aerodrome,
    Waypoint,
}

impl fmt::Display for RoutePointType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Deserialize, Serialize, Clone)]
pub struct RoutePoint {
    pub point_type: RoutePointType,
    pub location: Location,
    pub name: String,
    pub com_frequencies: Vec<COMFrequency>,
    pub states: Vec<SentState>,
}

#[derive(Deserialize, Serialize, Clone, Copy)]
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

#[derive(Deserialize, Serialize, Clone, Copy)]
pub struct Pose {
    pub location: Location,
    pub altitude: i32,
    pub heading: u32,
    pub air_speed: u32,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Route {
    pub waypoints: Vec<RoutePoint>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct SentState {
    pub stage: RoutePointStage,
    pub callsign_modified: bool,
    pub squark: bool,
    pub current_target: COMFrequency,
    pub current_transponder_frequency: u16,
    pub pose: Pose,
    pub emergency: Emergency,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct RecievedState {
    pub stage: RoutePointStage,
    pub prefix: String,
    pub callsign: String,
    pub squark: bool,
    pub current_target: COMFrequency,
    pub current_radio_frequency: f32,
    pub current_transponder_frequency: u16,
    pub aircraft_type: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct RecievedStateMessageSeed {
    pub state: RecievedState,
    pub message: String,
    pub scenario_seed: u64,
    pub weather_seed: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct SentStateMessage {
    pub state: SentState,
    pub message: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Mistake {
    pub call_expected: String,
    pub call_found: String,
    pub details: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub enum ServerResponse {
    StateMessage(SentStateMessage),
    Mistake(Mistake),
}
