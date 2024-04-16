import { db } from '$lib/db/db';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { users } from '$lib/db/schema';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	let userId: string = '-1';

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
		session: session,
		userId: userId
	};
};
