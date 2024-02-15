import { json } from '@sveltejs/kit';
import Route from '$lib/ts/Route';
import Seed from '$lib/ts/Seed';

export async function GET({ params, url, setHeaders }) {
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

	setHeaders({
		'cache-control': 'max-age=60'
	});

	return json(Route.getRouteWaypoints(seed, airborneWaypoints));
}