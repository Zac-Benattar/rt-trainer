import { json } from '@sveltejs/kit';
import RouteGenerator from '$lib/ts/RouteGenerator.js';

export async function GET({ params, setHeaders }) {
	let seedString = params.seed ?? '0';

	if (seedString == null || seedString == undefined) seedString = '0';

	setHeaders({
		'cache-control': 'max-age=600'
	});

	return json(await RouteGenerator.generateFRTOLRouteFromSeed(seedString));
}
