import type { Seed, SimulatorUpdateData } from "./ServerClientTypes";
import Route from "./Route";
import { HoldingPointStage, ParkedStage, TaxiingStage } from "./FlightStages";
import { FlightRules, type Aerodrome, type Waypoint, EmergencyType } from "./SimulatorTypes";

/* Type of routepoint. Each type has a different set of stages that can be performed. */
export enum RoutePointType {
    Parked,
    Taxiing,
    HoldingPoint,
    Airborne,
    Approach,
    Landing,
    LandedTaxiing,
    LandedParked,
}

/* A point on the route used in generation. Not necissarily visible to the user */
export class RoutePoint {
	pointType: RoutePointType;
	waypoint: Waypoint;
	updateData: SimulatorUpdateData;

    constructor(pointType: RoutePointType, waypoint: Waypoint, updateData: SimulatorUpdateData) {
        this.pointType = pointType;
        this.waypoint = waypoint;
        this.updateData = updateData;
    }
};

export class ParkedPoint extends RoutePoint {
	stage: ParkedStage;
	constructor(stage: ParkedStage, waypoint: Waypoint, updateData: SimulatorUpdateData) {
		super(RoutePointType.Parked, waypoint, updateData);
		this.stage = stage;
	}
}

export class TaxiingPoint extends RoutePoint {
	stage: TaxiingStage;
	constructor(stage: TaxiingStage, waypoint: Waypoint, updateData: SimulatorUpdateData) {
		super(RoutePointType.Taxiing, waypoint, updateData);
		this.stage = stage;
	}
}

/* Holding point on route. Used for generation and not visible to the user. */
export class HoldingPointPoint extends RoutePoint {
	stage: HoldingPointStage;

	constructor(stage: HoldingPointStage, waypoint: Waypoint, updateData: SimulatorUpdateData) {
		super(RoutePointType.HoldingPoint, waypoint, updateData);
		this.stage = stage;
	}
}

/* Point in the air. Used for generation and may be visible to the user if it conincides with a waypoint. */
export class AirbornePoint extends RoutePoint {
	flightRules: FlightRules = FlightRules.IFR;
	emergency: EmergencyType = EmergencyType.None;

	constructor(
		flightRules: FlightRules,
		waypoint: Waypoint,
        updateData: SimulatorUpdateData,
        emergency: EmergencyType
	) {
		super(RoutePointType.Airborne, waypoint, updateData);
		this.flightRules = flightRules;
		this.emergency = emergency;
	}
}

export function getRadioCheckSimulatorUpdateData(seed: Seed) : SimulatorUpdateData {
    const startAerodrome = Route.getStartAerodrome(seed);

    const stage = new ParkedPoint(ParkedStage.DepartInfo, startAerodrome);

    return {
        routePoint: stage,
        callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
        squark: false,
        currentTarget: startAerodrome.comFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
        currentTransponderFrequency: 7000,
        location: startAerodrome.location,
        emergency: EmergencyType.None,
    }
}

// Stage 2
export function getRequestingDepartInfoSimulatorUpdateData(seed: Seed) : SimulatorUpdateData{
    const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);

    const stage = new ParkedPoint(ParkedStage.DepartInfo, startAerodrome);

    return {
        routePoint: stage,
        callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
        squark: false,
        currentTarget: startAerodrome.comFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
        currentTransponderFrequency: 7000,
        location: startAerodrome.location,
        emergency: EmergencyType.None,
    }
}

// Stage 3
export function getGetDepartInfoReadbackSimulatorUpdateData(seed: Seed) : SimulatorUpdateData {
    const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);

    const stage = new ParkedPoint(ParkedStage.DepartInfo, startAerodrome);

    return {
        routePoint: stage,
        callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
        squark: false,
        currentTarget: startAerodrome.comFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
        currentTransponderFrequency: 7000,
        location: startAerodrome.location,
        emergency: EmergencyType.None,
    }
}

// Stage 4
export function getTaxiRequestSimulatorUpdateData(seed: Seed) : SimulatorUpdateData {
    const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);

    const stage = new ParkedPoint(ParkedStage.DepartInfo, startAerodrome);

    return {
        routePoint: stage,
        callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
        squark: false,
        currentTarget: startAerodrome.comFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
        currentTransponderFrequency: 7000,
        location: startAerodrome.location,
        emergency: EmergencyType.None,
    }
}

// Stage 5
export function getGetTaxiClearenceReadbackSimulatorUpdateDate(seed: Seed) : SimulatorUpdateData {
    const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);

    const stage = new TaxiingPoint(TaxiingStage.ReadyForDeparture, startAerodrome);

    return {
        routePoint: stage,
        callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
        squark: false,
        currentTarget: startAerodrome.comFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
        currentTransponderFrequency: 7000,
        location: startAerodrome.location,
        emergency: EmergencyType.None,
    }
}