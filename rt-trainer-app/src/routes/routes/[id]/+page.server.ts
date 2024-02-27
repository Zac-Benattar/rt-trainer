import { redirect } from '@sveltejs/kit';
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
                waypoints: true
            }
		})
	};
};