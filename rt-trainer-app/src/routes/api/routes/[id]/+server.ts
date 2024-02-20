import { db } from '$lib/db/db';
import { routes, waypoints } from '$lib/db/schema';
import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
import RouteGenerator from '$lib/ts/RouteGenerator';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const id: string = params.id;

	// Get the route with its route points, ordered by route point index
	const routeRow = await db.query.routes.findFirst({
		where: eq(routes.id, id),
		with: {
			waypoints: {
				orderBy: [waypoints.index]
			}
		}
	});

	if (routeRow == null || routeRow == undefined) {
		return json({ error: 'No route found' });
	}

	const waypointsList: Waypoint[] = [];
	for (const waypoint of routeRow.waypoints) {
		waypointsList.push(
			new Waypoint(
				waypoint.name,
				parseFloat(waypoint.latitude),
				parseFloat(waypoint.longitude),
				waypoint.type,
				waypoint.index
			)
		);
	}

	const airspace = await RouteGenerator.getAirspaceDataFromWaypointsList(waypointsList);

	const airports = await RouteGenerator.getAirportDataFromWaypointsList(waypointsList);

	return json({
		waypoints: waypointsList,
		airspaces: airspace,
		airports: airports
	});
}

export async function DELETE({ params }) {
	const id: string = params.id;

	await db.delete(routes).where(eq(routes.id, id));

	return json({ result: 'Success' });
}
