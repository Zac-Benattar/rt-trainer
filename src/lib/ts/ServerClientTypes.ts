import type Feedback from './Feedback';
import type { EmergencyType } from './ScenarioTypes';

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
	currentStatus: string;
	callsignModified: boolean;
	squark: boolean;
	currentTarget: string  | undefined;
	currentTargetFrequency: string | undefined;
	currentTransponderFrequency: string;
	currentPressure: number;
	emergency: EmergencyType;
};
