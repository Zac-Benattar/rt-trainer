import { convertToNATO } from '../lib/PhoneticAlphabetConverter';

export type Context = {
	radarName: string;
	callsign: string;
	message: string;
};

let atcResponse: Context = {
	radarName: '',
	callsign: '',
	message: ''
};

export function GetNextATCResponse(currentContex: Context, userMessage: Context, seed: number) {
	// Return empty response if the user is not talking to the current controller
	if (userMessage.radarName != currentContex.radarName) {
		return atcResponse;
	}

	atcResponse.radarName = userMessage.radarName;
	atcResponse.callsign = convertToNATO(userMessage.callsign);

	if (userMessage.message === '') {
		atcResponse.message = 'Say again';
	} else if (userMessage.message === 'request zone transit') {
		if (seed % 5 === 0) {
			atcResponse.message = 'Transit denied';
		} else {
			atcResponse.message = 'Transit approved';
		}
	}

	return atcResponse;
}
