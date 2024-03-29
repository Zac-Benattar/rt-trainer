import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db';
import { eq } from 'drizzle-orm';
import { routesTable, users, waypointsTable } from '$lib/db/schema';
import { init } from '@paralleldrive/cuid2';
import RouteGenerator from '$lib/ts/RouteGenerator';
import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
import { getAllAirportData, getAllAirspaceData } from '$lib/ts/OpenAIPHandler';
import { instanceToPlain } from 'class-transformer';

let userId = '-1';
const routeCUID = init({ length: 12 });

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) throw redirect(303, '/login');

	userId = '-1';

	if (session?.user?.email != undefined && session?.user?.email != null) {
		const row = await db.query.users.findFirst({
			columns: {
				id: true
			},
			where: eq(users.email, session.user.email)
		});

		if (row != null || row != undefined) {
			userId = row.id;
		}

		return {
			userDetails: row,
			airspaces: instanceToPlain(await getAllAirspaceData()),
			airports: instanceToPlain(await getAllAirportData())
		};
	}
};

/** @type {import('./$types').Actions} */
export const actions = {
	createRoute: async ({ request }) => {
		const data = await request.formData();
		const routeName = data.get('routeName');
		const routeDescription = data.get('routeDescription')?.toString();
		const routeSeed = data.get('routeSeed');

		if (routeName == null || routeName == undefined || routeName == '') {
			return fail(400, { RouteNameMissing: true });
		}

		if (routeSeed == null || routeSeed == undefined || routeSeed == '') {
			return fail(400, { routeSeedMissing: true });
		}

		const route = await RouteGenerator.generateFRTOLRouteFromSeed(routeSeed.toString());

		if (route == null || route == undefined) {
			return fail(501, { routeGenerationError: true });
		}

		const routeId = routeCUID();

		await db.insert(routesTable).values({
			id: routeId,
			name: routeName.toString(),
			type: 1,
			airspaceIds: JSON.stringify(route.airspaces.map((airspace) => airspace.id)),
			airportIds: JSON.stringify(route.airports.map((airport) => airport.id)),
			description: routeDescription?.toString(),
			createdBy: userId
		});

		await db.insert(waypointsTable).values(
			route.waypoints.map((waypoint: Waypoint) => ({
				index: waypoint.index,
				type: waypoint.type,
				name: waypoint.name,
				description: waypoint.description,
				lat: waypoint.location[1].toString(),
				long: waypoint.location[0].toString(),
				routeId: routeId
			}))
		);

		throw redirect(303, `/routes/${routeId}`);
	}
};
