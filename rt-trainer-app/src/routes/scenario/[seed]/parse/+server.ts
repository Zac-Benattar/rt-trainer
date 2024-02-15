import Parser from '$lib/ts/Parser';
import RadioCall from '$lib/ts/RadioCall';
import type { ServerResponse } from '$lib/ts/ServerClientTypes.js';
import { json } from '@sveltejs/kit';
import { plainToInstance } from 'class-transformer';

export async function POST({ request }) {
	const { data } = await request.json();

	const radioCall: RadioCall = plainToInstance(RadioCall, data)

	const result: ServerResponse = Parser.parseCall(radioCall);

	return json(result);
}
