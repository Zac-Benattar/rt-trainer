import type { Seed, SimulatorUpdateData } from './ServerClientTypes';
import type { HoldingPointStage, ParkedStage, TaxiingStage } from './FlightStages';
import { FlightRules, type Aerodrome, EmergencyType, type Pose } from './SimulatorTypes';

/* Type of routepoint. Each type has a different set of stages that can be performed. */
export enum RoutePointType {
	Parked,
	Taxiing,
	HoldingPoint,
	TakeOff,
	Airborne,
	Approach,
	Landing,
	LandedTaxiing,
	LandedParked
}

/* A point on the route used in generation. Not necissarily visible to the user */
export class RoutePoint {
	pointType: RoutePointType;
	pose: Pose;
	updateData: SimulatorUpdateData;

	constructor(pointType: RoutePointType, pose: Pose, updateData: SimulatorUpdateData) {
		this.pointType = pointType;
		this.pose = pose;
		this.updateData = updateData;
	}
}

export class ParkedPoint extends RoutePoint {
	stage: ParkedStage;
	constructor(stage: ParkedStage, pose: Pose, updateData: SimulatorUpdateData) {
		super(RoutePointType.Parked, pose, updateData);
		this.stage = stage;
	}
}

export class TaxiingPoint extends RoutePoint {
	stage: TaxiingStage;
	constructor(stage: TaxiingStage, pose: Pose, updateData: SimulatorUpdateData) {
		super(RoutePointType.Taxiing, pose, updateData);
		this.stage = stage;
	}
}

/* Holding point on route. Used for generation and not visible to the user. */
export class HoldingPointPoint extends RoutePoint {
	stage: HoldingPointStage;

	constructor(stage: HoldingPointStage, pose: Pose, updateData: SimulatorUpdateData) {
		super(RoutePointType.HoldingPoint, pose, updateData);
		this.stage = stage;
	}
}

/* Point in the air. Used for generation and may be visible to the user if it conincides with a waypoint. */
export class AirbornePoint extends RoutePoint {
	flightRules: FlightRules = FlightRules.IFR;
	emergency: EmergencyType = EmergencyType.None;

	constructor(
		flightRules: FlightRules,
		pose: Pose,
		updateData: SimulatorUpdateData,
		emergency: EmergencyType
	) {
		super(RoutePointType.Airborne, pose, updateData);
		this.flightRules = flightRules;
		this.emergency = emergency;
	}
}

// Stage 1
export function getRadioCheckSimulatorUpdateData(
	seed: Seed,
	startAerodrome: Aerodrome
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.radioFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
		currentTransponderFrequency: 7000,
		location: startAerodrome.location,
		emergency: EmergencyType.None
	};
}

// Stage 2
export function getRequestingDepartInfoSimulatorUpdateData(
	seed: Seed,
	startAerodrome: Aerodrome
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.radioFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
		currentTransponderFrequency: 7000,
		location: startAerodrome.location,
		emergency: EmergencyType.None
	};
}

// Stage 3
export function getGetDepartInfoReadbackSimulatorUpdateData(
	seed: Seed,
	startAerodrome: Aerodrome
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.radioFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
		currentTransponderFrequency: 7000,
		location: startAerodrome.location,
		emergency: EmergencyType.None
	};
}

// Stage 4
export function getTaxiRequestSimulatorUpdateData(
	seed: Seed,
	startAerodrome: Aerodrome
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.radioFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
		currentTransponderFrequency: 7000,
		location: startAerodrome.location,
		emergency: EmergencyType.None
	};
}

// Stage 5
export function getGetTaxiClearenceReadbackSimulatorUpdateData(
	seed: Seed,
	startAerodrome: Aerodrome
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.radioFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
		currentTransponderFrequency: 7000,
		location: startAerodrome.location,
		emergency: EmergencyType.None
	};
}
