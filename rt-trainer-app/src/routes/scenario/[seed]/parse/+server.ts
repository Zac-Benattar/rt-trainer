import Parser from '$lib/ts/Parser';
import RadioCall from '$lib/ts/RadioCall';
import type { ServerResponse } from '$lib/ts/ServerClientTypes.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { data } = await request.json();
	const radioCallData = JSON.parse(data);

	const radioCall: RadioCall = new RadioCall(
		radioCallData.message,
		radioCallData.seed,
		radioCallData.numAirborneWaypoints,
		radioCallData.route,
		radioCallData.currentPointIndex,
		radioCallData.prefix,
		radioCallData.userCallsign,
		radioCallData.userCallsignModified,
		radioCallData.squark,
		radioCallData.currentTarget,
		radioCallData.currentTargetFrequency,
		radioCallData.currentRadioFrequency,
		radioCallData.currentTransponderFrequency,
		radioCallData.aircraftType
	);

	const result: ServerResponse = Parser.parseCall(radioCall);

	return json(result);
}
