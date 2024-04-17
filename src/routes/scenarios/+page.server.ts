import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db';
import { desc, eq } from 'drizzle-orm';
import { Visibility, scenariosTable } from '$lib/db/schema';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	// Add caching before removing this line
	if (!session?.user) throw redirect(303, '/login');

	return {
		publicScenarios: await db.query.scenariosTable.findMany({
			columns: {
				id: true,
				name: true,
				description: true,
				createdAt: true
			},
			where: eq(scenariosTable.visibility, Visibility.PUBLIC),
			orderBy: [desc(scenariosTable.createdAt)],
			limit: 25
		})
	};
};
