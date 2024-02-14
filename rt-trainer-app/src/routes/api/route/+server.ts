import { db } from '$lib/db/db';
import { routes, routePoints } from '$lib/db/schema';
import { json } from '@sveltejs/kit';

export async function PUT({ request }) {
	const { name, createdBy, routePointsObject } = await request.json();

	if (!name) {
		return json({ error: 'No name provided' });
	}

	if (!createdBy) {
		return json({ error: 'No createdBy provided' });
	}

	if (routePointsObject && routePointsObject.length > 0) {
		for (let i = 0; i < routePointsObject.length; i++) {
			if (!routePointsObject[i].name) {
				return json({ error: 'No name provided for route point ', i });
			}
			if (!routePointsObject[i].latitude) {
				return json({ error: 'No latitude provided for route point ', i });
			}
			if (!routePointsObject[i].longitude) {
				return json({ error: 'No longitude provided for route point ', i });
			}
		}
	}

	const routesTable = await db.insert(routes).values({ name: name, createdBy: createdBy });

	await db.insert(routePoints).values(
		routePointsObject.map((point) => ({
			index: point.index,
			type: point.type,
			name: point.name,
			description: point.description,
			latitude: point.latitude,
			longitude: point.longitude,
			routeId: routesTable.insertId
		}))
	);

	return json({ result: 'Success' });
}
