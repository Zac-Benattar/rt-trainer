import type Feedback from './Feedback';
import type { EmergencyType } from './ScenarioTypes';

export type GenerationParameters = {
	seed: string;
	hasEmergency: boolean;
};

/* List of mistakes made by the user and the response from the radio target */
export class ServerResponse {
	feedbackDataJSON: string;
	responseCall: string;
	expectedUserCall: string;

	constructor(feedback: Feedback, responseCall: string, expectedUserCall: string) {
		this.feedbackDataJSON = feedback.getJSONData();
		this.responseCall = responseCall;
		this.expectedUserCall = expectedUserCall;
	}
}

/* Context which must be sent to the server for use in parsing. */
export type CallParsingContext = {
	radioCall: string;
	seed: string;
};

/* The state data recieved from the server after parsing. Used to update the simulator frontend. */
export type SimulatorUpdateData = {
	callsignModified: boolean;
	squark: boolean;
	currentTarget: string;
	currentTargetFrequency: string;
	currentTransponderFrequency: string;
	currentPressure: number;
	emergency: EmergencyType;
};
