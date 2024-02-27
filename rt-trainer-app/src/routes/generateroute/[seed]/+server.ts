import { json } from '@sveltejs/kit';
import RouteGenerator from '$lib/ts/RouteGenerator.js';
import { simpleHash } from '$lib/ts/utils.js';

export async function GET({ params, setHeaders }) {
	const seedString = params.seed ?? '0';
	let seedNumber = 0;

	if (seedString != null && seedString != undefined) seedNumber = simpleHash(seedString);

	setHeaders({
		'cache-control': 'max-age=600'
	});

	return json(await RouteGenerator.generateFRTOLRouteFromSeed(seedNumber));
}
