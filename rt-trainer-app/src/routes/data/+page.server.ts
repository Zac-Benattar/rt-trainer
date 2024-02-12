import { db } from '$lib/db/db';
import { airport } from '$lib/db/schema';
import type { AirportData } from '$lib/ts/Airport.js';
import { checkSystemHealth, getAllUKAirports } from '$lib/ts/OpenAIPHandler';
import { fail, json } from '@sveltejs/kit';

export const load = async () => {
	const airports = await db.query.airport.findMany();

	return { airports };
};