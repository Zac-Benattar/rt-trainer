import type Seed from './Seed';
import type { EmergencyType, RadioFrequency } from './SimulatorTypes';
import type { Location } from './SimulatorTypes';

export type GenerationParameters = {
	seed: Seed;
	airborneWaypoints: number;
	hasEmergency: boolean;
};

/* Mistake made in the user's call. Description and whether or not ATC can deal with it. */
export type Mistake = {
	details: string;
	severe: boolean;
};

/* List of mistakes made by the user and the response from the radio target */
export class ServerResponse {
	mistakes: Mistake[];
	responseCall: string;
	expectedUserCall: string;

	constructor(mistakes: Mistake[], responseCall: string, expectedUserCall: string) {
		this.mistakes = mistakes;
		this.responseCall = responseCall;
		this.expectedUserCall = expectedUserCall;
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