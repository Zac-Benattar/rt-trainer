import { db } from '$lib/db/db';
import { routes, waypoints } from '$lib/db/schema';
import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
import RouteGenerator from '$lib/ts/RouteGenerator';
import type { RouteData } from '$lib/ts/Scenario.js';
import { error, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;

	if (id == null || id == undefined) {
		error(400, 'No route id provided');
	}

	// Get the route with its route points, ordered by route point index
	const routeRow = await db.query.routes.findFirst({
		where: eq(routes.id, id as string),
		with: {
			waypoints: {
				orderBy: [waypoints.index]
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
				parseFloat(waypoint.latitude),
				parseFloat(waypoint.longitude),
				waypoint.type,
				waypoint.index
			)
		);
	}

	const routeData: RouteData = {
		waypoints: waypointsList,
		airspaces: await RouteGenerator.getAirspaceDataFromWaypointsList(waypointsList),
		airports: await RouteGenerator.getAirportDataFromWaypointsList(waypointsList)
	};

	return new Response(JSON.stringify(routeData));
};

export async function DELETE({ params }) {
	const id: string = params.id;

	await db.delete(routes).where(eq(routes.id, id));

	return new Response(JSON.stringify({ result: 'Success' }));
}
