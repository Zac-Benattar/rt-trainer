import type { SimulatorUpdateData } from './ServerClientTypes';
import type Seed from './Seed';
import type { AirborneStage, StartUpStage, RouteStage, TaxiStage } from './RouteStages';
import { FlightRules, EmergencyType, type Pose, type Waypoint } from './SimulatorTypes';
import type { ControlledAerodrome, UncontrolledAerodrome } from './Aerodrome';

/* A point on the route used in generation. Not necissarily visible to the user */
export abstract class RoutePoint {
	stage: RouteStage;
	pose: Pose;
	updateData: SimulatorUpdateData;
	waypoint: Waypoint | null = null;

	constructor(stage: RouteStage, pose: Pose, updateData: SimulatorUpdateData, waypoint?: Waypoint) {
		this.stage = stage;
		this.pose = pose;
		this.updateData = updateData;
		this.waypoint = waypoint || null;
	}
}

export class StartUpPoint extends RoutePoint {
	constructor(
		stage: StartUpStage,
		pose: Pose,
		updateData: SimulatorUpdateData,
		waypoint?: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
	}
}

export class TaxiPoint extends RoutePoint {
	constructor(stage: TaxiStage, pose: Pose, updateData: SimulatorUpdateData, waypoint?: Waypoint) {
		super(stage, pose, updateData, waypoint);
	}
}

export class TakeOffPoint extends RoutePoint {
	constructor(
		stage: TakeOffStage,
		pose: Pose,
		updateData: SimulatorUpdateData,
		waypoint?: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
	}
}

export class ClimbOutPoint extends RoutePoint {
	constructor(
		stage: ClimbOutStage,
		pose: Pose,
		updateData: SimulatorUpdateData,
		waypoint?: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
	}
}

export type StartAerodromePoint = StartUpPoint | TaxiPoint | TakeOffPoint | ClimbOutPoint;

/* Point in the air. Used for generation and may be visible to the user if it conincides with a waypoint. */
export class AirbornePoint extends RoutePoint {
	constructor(
		stage: AirborneStage,
		pose: Pose,
		updateData: SimulatorUpdateData,
		waypoint: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
	}
}

export class InboundForJoinPoint extends RoutePoint {
	constructor(
		stage: InboundForJoinStage,
		pose: Pose,
		updateData: SimulatorUpdateData,
		waypoint: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
	}
}

export class CircuitAndLandingPoint extends RoutePoint {
	constructor(
		stage: CircuitAndLandingStage,

		pose: Pose,
		updateData: SimulatorUpdateData,

		waypoint: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
	}
}

export class LandingToParkedPoint extends RoutePoint {
	constructor(
		stage: LandingToParkedStage,
		pose: Pose,
		updateData: SimulatorUpdateData,
		waypoint?: Waypoint
	) {
		super(stage, pose, updateData, waypoint);
	}
}

export type LandingPoint = InboundForJoinPoint | CircuitAndLandingPoint | LandingToParkedPoint;

export function getParkedInitialControlledUpdateData(
	seed: Seed,
	startAerodrome: ControlledAerodrome | UncontrolledAerodrome
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + ' Ground',
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
		currentTarget: startAerodrome.getShortName() + ' Ground',
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
		currentTarget: startAerodrome.getShortName() + ' Information',
		currentTargetFrequency: startAerodrome.getGroundFrequency(),
		currentTransponderFrequency: 7000,
		location: startAerodrome.getLocation(),
		emergency: EmergencyType.None
	};
}

export function getParkedMadeContactUncontrolledUpdateData(
	seed: Seed,
	startAerodrome: ControlledAerodrome | UncontrolledAerodrome
): SimulatorUpdateData {
	return {
		callsignModified: true, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + ' Information',
		currentTargetFrequency: startAerodrome.getGroundFrequency(),
		currentTransponderFrequency: 7000,
		location: startAerodrome.getLocation(),
		emergency: EmergencyType.None
	};
}
