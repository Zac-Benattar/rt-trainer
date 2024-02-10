import { getAllUKAirports } from '$lib/ts/OpenAIPHandler.js';
import { json } from '@sveltejs/kit';

export async function GET({ setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=31536000'
	});

	return json(await getAllUKAirports());
}
