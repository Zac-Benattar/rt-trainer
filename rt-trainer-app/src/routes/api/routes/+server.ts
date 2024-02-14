import { db } from '$lib/db/db';
import { routes, routePoints } from '$lib/db/schema';
import type { Waypoint } from '$lib/ts/Waypoint';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { name, createdBy, routePointsObject: waypointsObject } = await request.json();

	console.log(name, createdBy, waypointsObject);

	if (!name) {
		return json({ error: 'No name provided' });
	}

	if (!createdBy) {
		return json({ error: 'No createdBy provided' });
	}

	if (waypointsObject && waypointsObject.length > 0) {
		for (let i = 0; i < waypointsObject.length; i++) {
			if (!waypointsObject[i].name) {
				return json({ error: 'No name provided for route point ', i });
			}
			if (!waypointsObject[i].waypointType) {
				return json({ error: 'No type provided for route point ', i });
			}
			if (!waypointsObject[i].geometry[0][1]) {
				return json({ error: 'No latitude provided for route point ', i });
			}
			if (!waypointsObject[i].geometry[0][0]) {
				return json({ error: 'No longitude provided for route point ', i });
			}
		}
	}

	const routesTable = await db.insert(routes).values({ name: name, createdBy: createdBy });

	await db.insert(routePoints).values(
		waypointsObject.map((waypoint: Waypoint) => ({
			index: waypoint.index,
			type: waypoint.waypointType,
			name: waypoint.name,
			description: waypoint.description,
			latitude: waypoint.geometry[0][1],
			longitude: waypoint.geometry[0][0],
			routeId: routesTable.insertId
		}))
	);

	return json({ result: 'Success' });
}
