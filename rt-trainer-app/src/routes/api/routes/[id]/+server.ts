import { db } from '$lib/db/db';
import { routesTable, waypointsTable } from '$lib/db/schema';
import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
import type { RouteData } from '$lib/ts/Scenario';

import { error, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;

	if (id == null || id == undefined) {
		error(400, 'No route id provided');
	}

	// Get the route with its route points, ordered by route point index
	const routeRow = await db.query.routesTable.findFirst({
		where: eq(routesTable.id, id as string),
		with: {
			waypoints: {
				orderBy: [waypointsTable.index]
			}
		}
	});

	if (routeRow == null || routeRow == undefined) {
		error(404, 'Route not found');
	}

	const waypointsList: Waypoint[] = [];
	for (const waypoint of routeRow.waypoints) {
		waypointsList.push(
			new Waypoint(
				waypoint.name,
				[parseFloat(waypoint.lng), parseFloat(waypoint.lat)],
				waypoint.type,
				waypoint.index
			)
		);
	}

	const routeData: RouteData = {
		waypoints: waypointsList,
		airspaces: await getAirspacesFromIds(routeRow?.airspaceIds as string[]),
		airports: await getAirportsFromIds(routeRow?.airportIds as string[])
	};

	return new Response(JSON.stringify(routeData));
};

export async function DELETE({ params }) {
	const id: string = params.id;

	await db.delete(routesTable).where(eq(routesTable.id, id));

	return new Response(JSON.stringify({ result: 'Success' }));
}
