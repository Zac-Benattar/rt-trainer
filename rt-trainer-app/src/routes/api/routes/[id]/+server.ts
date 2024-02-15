import { db } from '$lib/db/db';
import { routes, waypoints } from '$lib/db/schema';
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
		orderBy: [waypoints.index]
	});

	return json(routePointsRows);
}

export async function DELETE({ params }) {
	const id: string = params.id;

	const idNumber: number = parseInt(id);
	if (isNaN(idNumber)) {
		return json({ error: 'Invalid route id' });
	}

	await db.delete(routes).where(eq(routes.id, idNumber));

	return json({ result: 'Success' });
}
