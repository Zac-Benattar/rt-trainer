import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { routes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params, setHeaders }) {
	const id = parseInt(params.id);
	console.log(params);
	console.log(id);
	if (isNaN(id)) {
		return json({ error: 'Invalid id' });
	}

	setHeaders({
		'cache-control': 'max-age=60'
	});

	const route = await db.query.routes.findFirst({
		where: eq(routes.id, id)
	});

	console.log(route);

	return json(route);
}
