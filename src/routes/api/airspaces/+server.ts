import { getAllAirspaceData } from '$lib/ts/OpenAIPHandler';
import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const airspaces = await getAllAirspaceData();

	if (!airspaces) {
		error(404, 'Airspaces not found');
	}

	return new Response(JSON.stringify(airspaces));
};
