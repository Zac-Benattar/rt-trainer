import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db';
import { and, eq } from 'drizzle-orm';
import { scenarios, users } from '$lib/db/schema';

let userId = '-1';

export const load: PageServerLoad = async (event) => {
	const scenarioId = event.params.id;
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
		scenarioRow: await db.query.scenarios.findFirst({
			where: and(eq(scenarios.id, scenarioId), eq(scenarios.createdBy, userId)),
			with: {
				routes: {
					with: {
						waypoints: {
							orderBy: (waypoints, { asc }) => [asc(waypoints.index)]
						}
					}
				}
			}
		})
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

		if (scenarioId == null || scenarioId == undefined) {
			return fail(400, { scenarioId: scenarioId, missing: true });
		}

		await db
			.update(scenarios)
			.set({
				name: scenarioName.toString(),
				description: scenarioDescription
			})
			.where(eq(scenarios.id, scenarioId));
	},

	deleteScenario: async ({ params }) => {
		const scenarioId = params.id;
		if (scenarioId == null || scenarioId == undefined) {
			return fail(400, { scenarioId: scenarioId, missing: true });
		}

		await db.delete(scenarios).where(eq(scenarios.id, scenarioId));

		throw redirect(303, '/myscenarios');
	}
};
