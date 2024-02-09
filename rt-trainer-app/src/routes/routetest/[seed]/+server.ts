import { json } from '@sveltejs/kit';
import Seed from '$lib/ts/Seed';
import RouteGenerator from '$lib/ts/RouteGenerator.js';

export async function GET({ params, url }) {
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

	return json(RouteGenerator.getRouteWaypoints(seed, airborneWaypoints));
}