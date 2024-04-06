import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { Visibility, scenariosTable, users } from '$lib/db/schema';
import { db } from '$lib/db/db';
import { generateScenario } from '$lib/ts/ScenarioGenerator';
import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
import { instanceToPlain } from 'class-transformer';
import { getAirportsFromIds, getAirspacesFromIds } from '$lib/ts/OpenAIPHandler';
import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';
import type Airport from '$lib/ts/AeronauticalClasses/Airport';

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

	const scenarioRow = await db.query.scenariosTable.findFirst({
		where: eq(scenariosTable.userId, userId),
		with: {
			routes: {
				with: {
					waypoints: true
				}
			}
		}
	});

	// If scenario doesnt exist or user is not allowed to see it return same 'Scenario not found' message
	if (
		!scenarioRow ||
		(scenarioRow && scenarioRow.userId != userId && scenarioRow.visibility === Visibility.PRIVATE)
	) {
		return {
			error: 'Scenario not found'
		};
	}

	const waypointsList: Waypoint[] = scenarioRow.routes.waypoints.map((waypointDetails) => {
		return new Waypoint(
			waypointDetails.name,
			[parseFloat(waypointDetails.lng), parseFloat(waypointDetails.lat)],
			waypointDetails.type,
			waypointDetails.index,
			waypointDetails.referenceObjectId ?? undefined
		);
	});
	waypointsList.sort((a, b) => a.index - b.index);

	const airspaceIds: string[] =
		scenarioRow.routes?.airspaceIds?.replace(/[^a-zA-Z0-9,]/g, '').split(',') ?? [];

	const airspaces: Airspace[] = await getAirspacesFromIds(airspaceIds);

	const airportIds: string[] =
		scenarioRow.routes?.airportIds?.replace(/[^a-zA-Z0-9,]/g, '').split(',') ?? [];

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

/** @type {import('./$types').Actions} */
export const actions = {
	updateScenario: async ({ request }) => {
		const data = await request.formData();
		const scenarioId = data.get('scenarioId')?.toString();
		let scenarioName = data.get('scenarioName');
		if (scenarioName == null || scenarioName == undefined) {
			scenarioName = 'Unnamed Scenario';
		}
		const scenarioDescription = data.get('scenarioDescription')?.toString();
		let scenarioSeed = data.get('scenarioSeed')?.toString();
		if (scenarioSeed == null || scenarioSeed == undefined) {
			scenarioSeed = '0';
		}

		if (scenarioId == null || scenarioId == undefined) {
			return fail(400, { scenarioId: scenarioId, missing: true });
		}

		await db
			.update(scenariosTable)
			.set({
				name: scenarioName.toString(),
				description: scenarioDescription,
				seed: scenarioSeed
			})
			.where(eq(scenariosTable.id, scenarioId));
	},

	deleteScenario: async ({ params }) => {
		const scenarioId = params.id;
		if (scenarioId == null || scenarioId == undefined) {
			return fail(400, { scenarioId: scenarioId, missing: true });
		}

		await db.delete(scenariosTable).where(eq(scenariosTable.id, scenarioId));

		throw redirect(303, '/myscenarios');
	},

	redirectToSimulator: async ({ params }) => {
		const scenarioId = params.id;
		if (scenarioId == null || scenarioId == undefined) {
			return fail(400, { scenarioId: scenarioId, missing: true });
		}

		throw redirect(303, `/simulator/${scenarioId}`);
	}
};
