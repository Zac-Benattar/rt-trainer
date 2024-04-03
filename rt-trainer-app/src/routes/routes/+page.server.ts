import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db';
import { desc, eq } from 'drizzle-orm';
import { Visibility, routesTable } from '$lib/db/schema';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	// Add caching before removing this line
	if (!session?.user) throw redirect(303, '/login');

	return {
		publicRoutes: await db.query.routesTable.findMany({
			columns: {
				id: true,
				name: true,
				description: true,
				createdAt: true
			},
			where: eq(routesTable.visibility, Visibility.PUBLIC),
			orderBy: [desc(routesTable.createdAt)],
			limit: 25
		})
	};
};
