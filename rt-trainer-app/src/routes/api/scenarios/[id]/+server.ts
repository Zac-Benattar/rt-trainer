import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchScenarioById } from '$lib/ts/Scenario';
import { instanceToPlain } from 'class-transformer';

export const GET: RequestHandler = ({ params }) => {
	const id = params.id;

	if (id == null || id == undefined) {
		error(400, 'No scenario id provided');
	}

	const scenario = fetchScenarioById(id);

	if (scenario == null || scenario == undefined) {
		error(404, 'Scenario not found');
	}

	return new Response(JSON.stringify(instanceToPlain(scenario)));
};
