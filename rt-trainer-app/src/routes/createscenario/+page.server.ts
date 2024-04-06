import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db';
import { desc, eq } from 'drizzle-orm';
import { routesTable, scenariosTable, users, Visibility } from '$lib/db/schema';
import { init } from '@paralleldrive/cuid2';

let userId: string = '-1';
const scenarioSeedCUID = init({ length: 6 });
const scenarioCUID = init({ length: 12 });

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
	}

	// Return the user's recent routes where there is at least one waypoint
	return {
		userRecentRoutes: await db.query.routesTable.findMany({
			columns: {
				id: true,
				name: true,
				description: true,
				createdAt: true
			},
			with: {
				waypoints: {
					where: (waypoints, { gt }) => gt(waypoints.index, 0)
				}
			},
			where: eq(routesTable.userId, userId),
			orderBy: [desc(routesTable.createdAt)],
			limit: 20
		})
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	createScenario: async ({ request }) => {
		const data = await request.formData();
		const routeId = data.get('routeId')?.toString();
		const name = data.get('scenarioName') == '' ? 'My Scenario' : data.get('scenarioName');
		const description = data.get('scenarioDescription')?.toString();
		const emergency = data.get('hasEmergency') == 'on';
		const scenarioSeed =
			data.get('scenarioSeed') == '' ? scenarioSeedCUID() : data.get('scenarioSeed');

		const visibilityString = data.get('scenarioVisibility');
		let scenarioVisibility: Visibility = Visibility.PRIVATE;
		if (visibilityString === 'Unlisted') {
			scenarioVisibility = Visibility.UNLISTED;
		} else if (visibilityString === 'Public') {
			scenarioVisibility = Visibility.PUBLIC;
		}

		if (routeId == null || routeId == undefined) {
			return fail(400, { routeId, missing: true });
		}

		const route = await db.query.routesTable.findFirst({
			columns: {
				id: true
			},
			where: eq(routesTable.id, routeId)
		});

		if (route == null || route == undefined) {
			return fail(400, { routeId, notFound: true });
		}

		const scenarioId = scenarioCUID();

		await db.insert(scenariosTable).values({
			id: scenarioId,
			userId: userId,
			name: name,
			description: description,
			visibility: scenarioVisibility,
			routeId: routeId,
			seed: scenarioSeed,
			hasEmergency: emergency
		});

		throw redirect(303, `/scenarios/${scenarioId}`);
	}
};
