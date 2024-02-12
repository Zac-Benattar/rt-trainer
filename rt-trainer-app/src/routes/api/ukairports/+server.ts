import { db } from '$lib/db/db';
import { json } from '@sveltejs/kit';

export async function GET({ setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=31536000'
	});

	const airports = await db.query.airport.findMany();

	return json(airports);
}
