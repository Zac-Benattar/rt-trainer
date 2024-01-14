import type Seed from './Seed';
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

/* Context which must be sent to the server for use in parsing. */
export type CallParsingContext = {
	radioCall: string;
	seed: Seed;

};

/* The state data recieved from the server after parsing. Used to update the simulator frontend. */
export type SimulatorUpdateData = {
	radioCall: string;
	callsignModified: boolean;
	squark: boolean;
	currentTarget: RadioFrequency;
	currentTransponderFrequency: number;
	location: Location;
	emergency: EmergencyType;
};