import { getAllAirportData } from '$lib/ts/OpenAIPHandler';
import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const airports = await getAllAirportData();

	if (!airports) {
		error(404, 'Airports not found');
	}

	return new Response(JSON.stringify(airports));
};
