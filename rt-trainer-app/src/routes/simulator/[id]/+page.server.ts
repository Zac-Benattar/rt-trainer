import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { and, eq } from 'drizzle-orm';
import { scenarios, users } from '$lib/db/schema';
import { db } from '$lib/db/db';
import { generateScenario } from '$lib/ts/ScenarioGenerator';
import { simpleHash } from '$lib/ts/utils';
import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
import { instanceToPlain } from 'class-transformer';

export const load: PageServerLoad = async (event) => {
	const scenarioId = event.params.id;
	const session = await event.locals.auth();

	let prefix: string | null = null;
	let callsign: string | null = null;
	let aircraftType: string | null = null;

	let userId = '-1';

	if (!session?.user) throw redirect(303, '/login');

	if (session?.user?.email != undefined && session?.user?.email != null) {
		const userRow = await db.query.users.findFirst({
			columns: {
				id: true,
				prefix: true,
				callsign: true,
				aircraftType: true
			},
			where: eq(users.email, session.user.email)
		});

		if (userRow != null || userRow != undefined) {
			userId = userRow.id;
			prefix = userRow.prefix;
			callsign = userRow.callsign;
			aircraftType = userRow.aircraftType;
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

	const waypointsList: Waypoint[] = scenarioRow.routes.waypoints.map((waypoint) => {
		return new Waypoint(
			waypoint.name,
			parseFloat(waypoint.lat),
			parseFloat(waypoint.long),
			waypoint.type,
			waypoint.index
		);
	});
	waypointsList.sort((a, b) => a.index - b.index);

	const scenario = await generateScenario(
		scenarioId,
		scenarioRow.name,
		scenarioRow.description ?? '',
		simpleHash(scenarioRow.seed),
		waypointsList,
		scenarioRow.hasEmergency
	);

	return {
		scenario: instanceToPlain(scenario),
		aircraftDetails: {
			prefix: prefix,
			callsign: callsign,
			aircraftType: aircraftType
		}
	};
};