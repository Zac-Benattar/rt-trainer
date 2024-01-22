import { json } from '@sveltejs/kit';
import Route from '$lib/ts/Route';
import Seed from '$lib/ts/Seed';
import Parser from '$lib/ts/Parser';
import RadioCall from '$lib/ts/RadioCall';
import type { ServerResponse } from '$lib/ts/ServerClientTypes.js';

export async function GET({ params, url }) {
	const route = new Route();
	const seed = new Seed(params.seed.replace('seed=', ''));

	// Check if the url has the number of airborne waypoints specified
	const airborneWaypointsString: string | null = url.searchParams.get('airborneWaypoints');
	let airborneWaypoints: number = 2;
	if (
		airborneWaypointsString == null ||
		airborneWaypointsString == undefined ||
		airborneWaypointsString == ''
	) {
		airborneWaypoints = 2;
	} else {
		airborneWaypoints = parseInt(airborneWaypointsString);
		if (airborneWaypoints < 0 || airborneWaypoints > 5) {
			airborneWaypoints = 2;
		}
	}

	// Check if the scenario has enable emergency set
	let hasEmergency: boolean = false;
	const emergenciesString: string | null = url.searchParams.get('emergencies');
	if (emergenciesString != null) {
		hasEmergency = emergenciesString === 'True';
	}

	// Generate the route with the parameters
	route.generateRoute(seed, airborneWaypoints, hasEmergency);

	return json(route.getPoints());
}

export async function POST({ request }) {
	const { data } = await request.json();
	const radioCallData = JSON.parse(data);

	const radioCall: RadioCall = new RadioCall(
		radioCallData.message,
		radioCallData.seed,
		radioCallData.routePoint,
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
