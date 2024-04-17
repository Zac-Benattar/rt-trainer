import { db } from '$lib/db/db';
import { routesTable, waypointsTable } from '$lib/db/schema';
import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
import { getAirportsFromIds, getAirspacesFromIds } from '$lib/ts/OpenAIPHandler';
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

	if (!routeRow) {
		error(404, 'Route not found');
	} else {
		const waypointsList: Waypoint[] = [];
		for (const waypoint of routeRow.waypoints) {
			waypointsList.push(
				new Waypoint(
					waypoint.name,
					[parseFloat(waypoint.lng), parseFloat(waypoint.lat)],
					waypoint.type,
					waypoint.index,
					waypoint.referenceObjectId ?? undefined
				)
			);
		}

		let airspaceIds: string[] = [];
		if (routeRow?.airspaceIds)
			airspaceIds = (routeRow?.airspaceIds as string)
				.slice(1, (routeRow?.airspaceIds as string).length - 1)
				.split(',')
				.map((x) => x.slice(1, x.length - 1));
		let airportIds: string[] = [];
		if (routeRow?.airportIds)
			airportIds = (routeRow?.airportIds as string)
				.slice(1, (routeRow?.airportIds as string).length - 1)
				.split(',')
				.map((x) => x.slice(1, x.length - 1));

		const routeData: RouteData = {
			waypoints: waypointsList,
			airspaces: await getAirspacesFromIds(airspaceIds),
			airports: await getAirportsFromIds(airportIds)
		};

		return new Response(JSON.stringify(routeData));
	}

	return new Response(JSON.stringify({ result: 'Unknown Error' }));
};

export async function DELETE({ params }) {
	const id: string = params.id;

	await db.delete(routesTable).where(eq(routesTable.id, id));

	return new Response(JSON.stringify({ result: 'Success' }));
}
