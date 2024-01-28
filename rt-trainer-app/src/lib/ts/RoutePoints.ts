import type { SimulatorUpdateData } from './ServerClientTypes';
import type Seed from './Seed';
import { EmergencyType, type Pose } from './RouteTypes';
import type { ControlledAerodrome, UncontrolledAerodrome } from './Aerodrome';

/* A point on the route used in generation. Not necissarily visible to the user */
export default class RoutePoint {
	stage: string;
	pose: Pose;
	updateData: SimulatorUpdateData;

	constructor(stage: string, pose: Pose, updateData: SimulatorUpdateData) {
		this.stage = stage;
		this.pose = pose;
		this.updateData = updateData;
	}
}

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
		emergency: EmergencyType.None
	};
}

export function getParkedInitialUncontrolledUpdateData(
	seed: Seed,
	startAerodrome: ControlledAerodrome | UncontrolledAerodrome
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + ' Information',
		currentTargetFrequency: startAerodrome.getGroundFrequency(),
		currentTransponderFrequency: 7000,
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
		emergency: EmergencyType.None
	};
}
