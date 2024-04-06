import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db';
import { desc, eq } from 'drizzle-orm';
import { scenariosTable, users } from '$lib/db/schema';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) throw redirect(303, '/login');

	let userId = '-1';

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
		recentScenarios: await db.query.scenariosTable.findMany({
			columns: {
				id: true,
				name: true,
				createdAt: true
			},
			where: eq(scenariosTable.userId, userId),
			orderBy: [desc(scenariosTable.createdAt)],
			limit: 5
		})
	};
};
