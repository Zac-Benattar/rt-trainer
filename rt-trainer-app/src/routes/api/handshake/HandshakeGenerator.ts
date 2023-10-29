import { convertToNATO } from '../lib/PhoneticAlphabetConverter';

export type Context = {
	currentRadar: string;
	callsign: string;
	lat: number;
	lon: number;
};

export type AircraftMessage = {
	radarName: string;
	callsign: string;
	message: string;
};

export type ATCResponse = {
	radarName: string;
	callsign: string;
	message: string;
};

function CapitaliseFirstLetters(str: string): string {
	return str.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
}
export class HandshakeGenerator {
	seed: number = 0;
	callsign = '';
	aircraftMessages: AircraftMessage[] = [];
	atcResponses: ATCResponse[] = [];

	constructor(seed: number, callsign: string) {
		this.callsign = callsign;
		this.seed = seed;
	}

	GetNextATCResponse(
		currentContext: Context,
		userMessage: AircraftMessage,
		seed: number
	): ATCResponse {
		// Limit recorded aircraft messages to 20 to prevent memory leak/api abuse
		if (this.aircraftMessages.length > 20) {
			this.aircraftMessages.shift();
		}
		this.aircraftMessages.push(userMessage);

		let atcRes: ATCResponse = {
			radarName: '',
			callsign: '',
			message: ''
		};

		// Return empty response if the user is not talking to the current controller
		if (userMessage.radarName != currentContext.currentRadar) {
			return atcRes;
		}

		atcRes.radarName = CapitaliseFirstLetters(userMessage.radarName);
		atcRes.callsign = convertToNATO(userMessage.callsign);

        // Set response message based on user message
		if (userMessage.message === '') {
			atcRes.message = 'Say again';
		} else if (userMessage.message === 'say again') {
			atcRes = this.atcResponses[this.atcResponses.length - 1];
		} else if (userMessage.message === 'request zone transit') {
			if (seed % 5 === 0) {
				atcRes.message = 'Transit denied';
			} else {
				atcRes.message = 'Transit approved';
			}
		}

		this.atcResponses.push(atcRes);
		return atcRes;
	}
}
