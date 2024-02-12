import { db } from '$lib/db/db';
import { airport } from '$lib/db/schema';
import type { AirportData } from '$lib/ts/Airport.js';
import { checkSystemHealth, getAllUKAirports } from '$lib/ts/OpenAIPHandler';
import { fail, json } from '@sveltejs/kit';

export const load = async () => {
	const airports = await db.query.airport.findMany();

	return { airports };
};

/** @type {import('./$types').Actions} */
export const actions = {
	updateOpenAIPDatabase: async () => {
		console.log('doing database shit');

		/**
		 * Check OpenAIP system health
		 */
		const health = await checkSystemHealth();

		if (health != 'OK') {
			return fail(400, { message: 'OpenAIP system health not OK' });
		}

		/**
		 * Clear airports table
		 */
		await db.delete(airport);

		/**
		 * Fetch all UK airports
		 */
		const airportsData = await getAllUKAirports();

        /**
         * Add airports to database
         */
		for (let i = 0; i < airportsData.length; i++) {
            await db.insert(airport).values({json: airportsData[i]});
		}

		return { message: 'OpenAIP data updated successfully' };
	}
};
