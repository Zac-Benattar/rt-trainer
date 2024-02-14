import { db } from '$lib/db/db';
import { routes, routePoints } from '$lib/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const id: string = params.id;

	const idNumber: number = parseInt(id);
	if (isNaN(idNumber)) {
		return json({ error: 'Invalid route id' });
	}

	// Get the route with its route points, ordered by route point index
	const routePointsRows = await db.query.routes.findFirst({
		where: eq(routes.id, idNumber),
		with: { routePoints: true },
		orderBy: [routePoints.index]
	});

	return json(routePointsRows);
}
