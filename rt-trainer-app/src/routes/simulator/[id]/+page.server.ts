import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { and, eq } from 'drizzle-orm';
import { scenariosTable, users, visibility } from '$lib/db/schema';
import { db } from '$lib/db/db';
import { generateScenario } from '$lib/ts/ScenarioGenerator';
import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
import { instanceToPlain } from 'class-transformer';
import { getAirportsFromIds, getAirspacesFromIds } from '$lib/ts/OpenAIPHandler';
import type Airport from '$lib/ts/AeronauticalClasses/Airport';
import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';

export const load: PageServerLoad = async (event) => {
	const scenarioId = event.params.id;
	const session = await event.locals.auth();

	let prefix: string | null = null;
	let callsign: string | null = null;
	let aircraftType: string | null = null;

	let userId: string = '-1';

	if (!session?.user && scenarioId != 'demo') throw redirect(303, '/login');

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

	const scenarioRow = await db.query.scenariosTable.findFirst({
		where: eq(scenariosTable.id, scenarioId),
		with: {
			routes: {
				with: {
					waypoints: true
				}
			}
		}
	});

	if (scenarioRow && userId != '-1' && scenarioRow.userID != userId && scenarioRow.visibility != visibility.PUBLIC) {
		return {
			error: 'Scenario not found'
		};
	}

	if (scenarioRow == null || scenarioRow == undefined) {
		return {
			error: 'No scenario found'
		};
	}

	const waypointsList: Waypoint[] = scenarioRow.routes.waypoints.map((waypoint) => {
		return new Waypoint(
			waypoint.name,
			[parseFloat(waypoint.lng), parseFloat(waypoint.lat)],
			waypoint.type,
			waypoint.index,
			waypoint.referenceObjectId ?? undefined
		);
	});
	waypointsList.sort((a, b) => a.index - b.index);

	const airspaceIds: string[] = scenarioRow.routes?.airspaceIds?.split(',') ?? [];

	const airspaces: Airspace[] = await getAirspacesFromIds(airspaceIds);

	const airportIds: string[] = scenarioRow.routes?.airportIds?.split(',') ?? [];

	const airports: Airport[] = await getAirportsFromIds(airportIds);

	const scenario = await generateScenario(
		scenarioId,
		scenarioRow.name,
		scenarioRow.description ?? '',
		scenarioRow.seed,
		waypointsList,
		airspaces,
		airports,
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
