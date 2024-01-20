import { json } from '@sveltejs/kit';
import Route from '$lib/ts/Route';
import Seed from '$lib/ts/Seed';
import Parser from '$lib/ts/Parser';
import CallParsingContext from '$lib/ts/CallParsingContext';

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

	console.log(data.seed.scenarioSeed);

	const callParsingContext = new CallParsingContext(
		data.radioCall,
		data.seed,
		data.routePoint,
		data.prefix,
		data.userCallsign,
		data.userCallsignModified,
		data.squark,
		data.currentTarget,
		data.currentTargetFrequency,
		data.currentRadioFrequency,
		data.currentTransponderFrequency,
		data.aircraftType
	);

	const result = Parser.parseCall(callParsingContext);

	return json(result);
}
