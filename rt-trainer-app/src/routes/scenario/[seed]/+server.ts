import { json } from '@sveltejs/kit';
import Route from '$lib/ts/Route';
import Seed from '$lib/ts/Seed';

export function GET({ params }) {
	const route = new Route();
	const seed = new Seed(params.seed);
	route.generateRoute(seed);

	return json(route.getPoints());
}
