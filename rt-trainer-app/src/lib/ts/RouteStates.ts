import type { SimulatorUpdateData } from './ServerClientTypes';
import type Seed from './Seed';
import type { AirborneStage, HoldingPointStage, ParkedStage, RouteStage, TaxiingStage } from './RouteStages';
import {
	FlightRules,
	EmergencyType,
	type Pose,
	type Waypoint
} from './SimulatorTypes';
import type { ControlledAerodrome, UncontrolledAerodrome } from './Aerodrome';

/* A point on the route used in generation. Not necissarily visible to the user */
export abstract class RoutePoint {
	stage: RouteStage;
	pose: Pose;
	updateData: SimulatorUpdateData;
	waypoint: Waypoint | null = null;

	constructor(
		stage: RouteStage,
		pose: Pose,
		updateData: SimulatorUpdateData,
		waypoint?: Waypoint
	) {
		this.stage = stage;
		this.pose = pose;
		this.updateData = updateData;
		this.waypoint = waypoint || null;
	}
}

export class ParkedPoint extends RoutePoint {
	constructor(
		stage: ParkedStage,
		pose: Pose,
		updateData: SimulatorUpdateData,
		waypoint?: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
	}
}

export class TaxiingPoint extends RoutePoint {
	constructor(
		stage: TaxiingStage,
		pose: Pose,
		updateData: SimulatorUpdateData,
		waypoint?: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
	}
}

/* Holding point on route. Used for generation and not visible to the user. */
export class HoldingPointPoint extends RoutePoint {
	constructor(
		stage: HoldingPointStage,
		pose: Pose,
		updateData: SimulatorUpdateData,
		waypoint?: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
	}
}

/* Point in the air. Used for generation and may be visible to the user if it conincides with a waypoint. */
export class AirbornePoint extends RoutePoint {
	flightRules: FlightRules = FlightRules.IFR;
	emergency: EmergencyType = EmergencyType.None;

	constructor(
		stage: AirborneStage,
		flightRules: FlightRules,
		pose: Pose,
		updateData: SimulatorUpdateData,
		emergency: EmergencyType,
		waypoint: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
		this.flightRules = flightRules;
		this.emergency = emergency;
	}
}

export function getParkedInitialControlledUpdateData(
	seed: Seed,
	startAerodrome: ControlledAerodrome | UncontrolledAerodrome
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + " Ground", 
		currentTargetFrequency: startAerodrome.getGroundFrequency(),
		currentTransponderFrequency: 7000,
		location: startAerodrome.getLocation(),
		emergency: EmergencyType.None
	};
}

export function getParkedMadeContactControlledUpdateData(
	seed: Seed,
	startAerodrome: ControlledAerodrome | UncontrolledAerodrome
): SimulatorUpdateData {
	return {
		callsignModified: true, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + " Ground", 
		currentTargetFrequency: startAerodrome.getGroundFrequency(),
		currentTransponderFrequency: 7000,
		location: startAerodrome.getLocation(),
		emergency: EmergencyType.None
	};
}

export function getParkedInitialUncontrolledUpdateData(
	seed: Seed,
	startAerodrome: ControlledAerodrome | UncontrolledAerodrome
): SimulatorUpdateData {
	return {
		callsignModified: true, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + " Information", 
		currentTargetFrequency: startAerodrome.getGroundFrequency(),
		currentTransponderFrequency: 7000,
		location: startAerodrome.getLocation(),
		emergency: EmergencyType.None
	}
}

export function getParkedMadeContactUncontrolledUpdateData(
	seed: Seed,
	startAerodrome: ControlledAerodrome | UncontrolledAerodrome
): SimulatorUpdateData {
	return {
		callsignModified: true, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + " Information", 
		currentTargetFrequency: startAerodrome.getGroundFrequency(),
		currentTransponderFrequency: 7000,
		location: startAerodrome.getLocation(),
		emergency: EmergencyType.None
	}
}

