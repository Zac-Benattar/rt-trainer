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
    return str.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
}

export class HandshakeGenerator {
	seed: number = 0;
	callsign = '';
	constructor(seed: number, callsign: string) {
		this.callsign = callsign;
		this.seed = seed;
	}

	GetNextATCResponse(
		currentContext: Context,
		userMessage: AircraftMessage,
		seed: number
	): ATCResponse {
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

		if (userMessage.message === '') {
			atcRes.message = 'Say again';
		} else if (userMessage.message === 'request zone transit') {
			if (seed % 5 === 0) {
				atcRes.message = 'Transit denied';
			} else {
				atcRes.message = 'Transit approved';
			}
		}

		return atcRes;
	}
}
