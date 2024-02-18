import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db';
import { desc, eq } from 'drizzle-orm';
import { routes, scenarios, users } from '$lib/db/schema';
import { init } from '@paralleldrive/cuid2';

let userId = '-1';
const weatherCUID = init({ length: 6 });
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

	return {
		userRecentRoutes: await db.query.routes.findMany({
			columns: {
				id: true,
				name: true,
				description: true,
				createdAt: true
			},
			where: eq(routes.createdBy, userId),
			orderBy: [desc(routes.createdAt)],
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
		const weatherSeed = data.get('weatherSeed') == '' ? weatherCUID() : data.get('weatherSeed');

		if (routeId == null || routeId == undefined) {
			return fail(400, { routeId, missing: true });
		}

		const route = await db.query.routes.findFirst({
			columns: {
				id: true
			},
			where: eq(routes.id, routeId)
		});

		if (route == null || route == undefined) {
			return fail(400, { routeId, notFound: true });
		}

		const scenarioId = scenarioCUID();

		await db.insert(scenarios).values({
			id: scenarioId,
			name: name,
			description: description,
			route: routeId,
			weatherSeed: weatherSeed,
			hasEmergency: emergency,
			createdBy: userId
		});

		redirect(303, `/scenario/${scenarioId}`);

		return {
			success: true,
			scenarioId: scenarioId
		};
	}
};
