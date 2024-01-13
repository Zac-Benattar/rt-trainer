import type { RoutePoint } from './RouteStates';
import type { EmergencyType, RadioFrequency } from './SimulatorTypes';
import type { Location } from './SimulatorTypes';

/* The settings for the simulation. */
export type SimulatorSettings = {
	unexpectedEvents: boolean;
	speechInput: boolean;
	readRecievedCalls: boolean;
};

/* The details of a radio call mistake made by the user. */
export class Mistake {
	callExpected: string;
	callFound: string;
	details: string;

	constructor(callExpected: string, callFound: string, details: string) {
		this.callExpected = callExpected;
		this.callFound = callFound;
		this.details = details;
	}
}

/* The seed used to generate the scenario and weather. Split into scenario and weather seed for easy access. */
export type Seed = {
	seedString: string;
	scenarioSeed: number;
	weatherSeed: number;
};

/* The state data which must be sent to the server for use in parsing. */
export type CallParsingData = {
	routePoint: RoutePoint;
	fix: string;
	callsign: string;
	prefix: string;
	targetAllocatedCallsign: string;
	squark: boolean;
	currentTarget: RadioFrequency;
	currentRadioFrequency: number;
	currentTransponderFrequency: number;
	aircraftType: string;
};

/* The state data recieved from the server after parsing. Used to update the simulator frontend. */
export type SimulatorUpdateData = {
	routePoint: RoutePoint;
	callsignModified: boolean;
	squark: boolean;
	currentTarget: RadioFrequency;
	currentTransponderFrequency: number;
	location: Location;
	emergency: EmergencyType;
};

/* The simulator data which must be sent to the server to generate the next state. */
export type SentStateMessageSeeds = {
	state: CallParsingData;
	message: string;
	seed: Seed;
};

/* The simulator data recieved from the server after generating the next state. Used to update the simulator frontend. */
export type RecievedStateMessage = {
	state: SimulatorUpdateData;
	message: string;
};