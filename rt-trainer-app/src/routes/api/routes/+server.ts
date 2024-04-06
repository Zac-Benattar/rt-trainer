import { db } from '$lib/db/db';
import { routesTable, waypointsTable } from '$lib/db/schema';
import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
import { json } from '@sveltejs/kit';
import { init } from '@paralleldrive/cuid2';

export async function POST({ request }) {
	const { routeName, routeDescription, visibility, userId, waypoints, type, airspaceIds, airportIds } =
		await request.json();

	if (!routeName) {
		return json({ error: 'No name provided' });
	}

	if (!visibility) {
		return json({ error: 'No visibility provided' });
	}

	if (!userId) {
		return json({ error: 'No userId provided' });
	}

	if (routeDescription.length > 2000) {
		return json({ error: 'Description too long. Max length 2000 chars.' });
	}

	if (!waypoints || waypoints.length == 0) {
		return json({ error: 'No waypoints provided' });
	}

	for (let i = 0; i < waypoints.length; i++) {
		if (!waypoints[i].name) {
			return json({ error: `No name provided for waypoint ${i}` });
		}
		if (waypoints[i].type == null || waypoints[i].type == undefined) {
			return json({ error: `No type provided for waypoint ${i}` });
		}
		if (!waypoints[i].location[1]) {
			return json({ error: `No lat provided for waypoint ${i}` });
		}
		if (!waypoints[i].location[0]) {
			return json({ error: `No long provided for waypoint ${i}` });
		}
		if (waypoints[i].index == null || waypoints[i].index == undefined) {
			return json({ error: `No index provided for waypoint ${i}` });
		}
	}

	const CUID = init({ length: 12 });
	const routeId = CUID();

	await db.insert(routesTable).values({
		id: routeId,
		userId: userId,
		name: routeName,
		visibility: visibility,
		type: type,
		airspaceIds: airspaceIds,
		airportIds: airportIds,
		description: routeDescription,
	});

	await db.insert(waypointsTable).values(
		waypoints.map((waypoint: Waypoint) => ({
			index: waypoint.index,
			type: waypoint.type,
			name: waypoint.name,
			description: waypoint.description,
			lat: waypoint.location[1],
			lng: waypoint.location[0],
			routeId: routeId,
			referenceObjectId: waypoint.referenceObjectId
		}))
	);

	return json({ result: 'success', id: routeId});
}
