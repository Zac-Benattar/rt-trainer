import { json } from '@sveltejs/kit';
import Route from '$lib/ts/Route';
import Seed from '$lib/ts/Seed';
import Parser from '$lib/ts/Parser';
import CallParsingContext from '$lib/ts/CallParsingContext';

export async function GET({ params }) {
	const route = new Route();
	const seed = new Seed(params.seed);
	route.generateRoute(seed);

	return json(route.getPoints());
}

export async function POST({ request }) {
	const { data } = await request.json();

	// console.log(data);

	const callParsingContext = new CallParsingContext(
		data.radioCall,
		new Seed(data.seed),
		data.routePoint,
		data.prefix,
		data.userCallsign,
		data.userCallsignModified,
		data.squark,
		data.currentTarget,
		data.currentRadioFrequency,
		data.currentTransponderFrequency,
		data.aircraftType
	);

	const result = Parser.parseCall(callParsingContext);

	return json(result);
}
