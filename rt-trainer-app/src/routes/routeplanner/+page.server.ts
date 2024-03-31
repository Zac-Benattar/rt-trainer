import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';
import { getAllAirportData, getAllAirspaceData } from '$lib/ts/OpenAIPHandler';
import { instanceToPlain } from 'class-transformer';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) throw redirect(303, '/login');

	if (session?.user?.email != undefined && session?.user?.email != null) {
		const row = await db.query.users.findFirst({
			columns: {
				id: true
			},
			where: eq(users.email, session.user.email)
		});

		return {
			userDetails: row,
			airspaces: instanceToPlain(await getAllAirspaceData()),
			airports: instanceToPlain(await getAllAirportData())
		};
	}
};
