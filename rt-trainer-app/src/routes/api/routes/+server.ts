import { db } from '$lib/db/db';
import { routes, waypoints } from '$lib/db/schema';
import type { Waypoint } from '$lib/ts/AeronauticalClasses/Waypoint';
import { json } from '@sveltejs/kit';
import { init } from '@paralleldrive/cuid2';

export async function POST({ request }) {
	const { name, createdBy, waypointsObject, type } = await request.json();

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
				return json({ error: `No name provided for waypoint point ${i}` });
			}
			if (waypointsObject[i].type == null || waypointsObject[i].type == undefined) {
				return json({ error: `No type provided for waypoint point ${i}` });
			}
			if (!waypointsObject[i].lat) {
				return json({ error: `No lat provided for waypoint point ${i}` });
			}
			if (!waypointsObject[i].long) {
				return json({ error: `No long provided for waypoint point ${i}` });
			}
		}
	}

	const routeIdCreator = init({ length: 12 });
	const routeId = routeIdCreator();

	await db.insert(routes).values({ id: routeId, name: name, createdBy: createdBy, type: type });

	await db.insert(waypoints).values(
		waypointsObject.map((waypoint: Waypoint) => ({
			index: waypoint.index,
			type: waypoint.type,
			name: waypoint.name,
			description: waypoint.description,
			latitude: waypoint.lat,
			longitude: waypoint.long,
			routeId: routeId
		}))
	);

	return json({ result: 'Success' });
}
