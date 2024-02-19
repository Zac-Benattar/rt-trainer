import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { and, eq } from 'drizzle-orm';
import { scenarios, users } from '$lib/db/schema';
import { db } from '$lib/db/db';
import { generateScenario } from '$lib/ts/ScenarioGenerator';
import { simpleHash } from '$lib/ts/utils';
import { Waypoint } from '$lib/ts/AeronauticalClasses/Waypoint';

export const load: PageServerLoad = async (event) => {
	const scenarioId = event.params.id;
	const session = await event.locals.auth();
	const routeId = event.params.id;

	let userId = '-1';

	if (!session?.user && routeId != 'demo') throw redirect(303, '/login');

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

	const scenarioRow = await db.query.scenarios.findFirst({
		where: and(eq(scenarios.createdBy, userId), eq(scenarios.id, scenarioId)),
		with: {
			routes: {
				with: {
					waypoints: true
				}
			}
		}
	});

	if (scenarioRow == null || scenarioRow == undefined) {
		return {
			error: 'No scenario found'
		};
	}

	const waypoints: Waypoint[] = scenarioRow.routes.waypoints.map((waypoint) => {
		return new Waypoint(
			waypoint.name,
			parseFloat(waypoint.latitude),
			parseFloat(waypoint.longitude),
			waypoint.type,
			waypoint.index
		);
	});

	const scenario = generateScenario(simpleHash(scenarioRow.seed), waypoints);

	return {
		scenario: scenario
	};
};
