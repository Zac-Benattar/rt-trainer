import { json } from '@sveltejs/kit';
import Seed from '$lib/ts/Seed';
import RouteGenerator from '$lib/ts/RouteGenerator.js';

export async function GET({ params, setHeaders }) {
	const seed = new Seed(params.seed.replace('seed=', ''));

	// setHeaders({
	// 	'cache-control': 'max-age=60'
	// });

	return json(await RouteGenerator.getRoute(seed));
}
