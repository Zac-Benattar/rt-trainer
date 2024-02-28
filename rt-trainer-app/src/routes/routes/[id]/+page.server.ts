import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db';
import { and, eq } from 'drizzle-orm';
import { routes, users } from '$lib/db/schema';

let userId = '-1';

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
		userRoutes: await db.query.routes.findFirst({
			where: and(eq(routes.createdBy, userId), eq(routes.createdBy, userId)),
			with: {
				waypoints: {
					orderBy: (waypoints, { asc }) => [asc(waypoints.index)]
				}
			}
		})
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	updateRoute: async ({ request }) => {
		const data = await request.formData();
		const routeId = data.get('routeId')?.toString();
		let routeName = data.get('routeName');
		if (routeName == null || routeName == undefined) {
			routeName = 'Unnamed Route';
		}
		const routeDescription = data.get('routeDescription')?.toString();

		if (routeId == null || routeId == undefined) {
			return fail(400, { routeId, missing: true });
		}

		await db
			.update(routes)
			.set({
				name: routeName.toString(),
				description: routeDescription
			})
			.where(eq(routes.id, routeId));
	},

	deleteRoute: async ({ params }) => {
		const routeId = params.id;
		if (routeId == null || routeId == undefined) {
			return fail(400, { routeId, missing: true });
		}

		await db.delete(routes).where(eq(routes.id, routeId));

		throw redirect(303, '/myroutes');
	}
};
