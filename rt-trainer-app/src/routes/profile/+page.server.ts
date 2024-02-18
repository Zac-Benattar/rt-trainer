import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

let userId = '-1';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) throw redirect(303, '/'); // Send user back to the homepage if they're not logged in
	userId = '-1';

	if (session?.user?.email != undefined && session?.user?.email != null) {
		const row = await db.query.users.findFirst({
			where: eq(users.email, session.user.email)
		});

		if (row != null || row != undefined) {
			userId = row.id;
		}

		return { userDetails: row };
	}
};

/** @type {import('./$types').Actions} */
export const actions = {
	updateProfileInformation: async ({ request }) => {
		const data = await request.formData();
		const prefix = data.get('prefix')?.toString();
		const callsign = data.get('callsign')?.toString();
		const aircraftType = data.get('aircraftType')?.toString();

		if (prefix != null || prefix != undefined) {
			if (prefix != '' && prefix != 'STUDENT' && prefix != 'HELICOPTER' && prefix != 'POLICE') {
				return fail(400, { prefix, wrongFormat: true });
			}
		}

		if (callsign != null || callsign != undefined) {
			if (callsign.length > 20) {
				return fail(400, { callsign, tooLong: true });
			}
		}

		if (aircraftType != null || aircraftType != undefined) {
			if (aircraftType.length > 30) {
				return fail(400, { aircraftType, tooLong: true });
			}
		}

		await db
			.update(users)
			.set({
				prefix: prefix,
				callsign: callsign,
				aircraftType: aircraftType
			})
			.where(eq(users.id, userId));

		return {
			success: true
		};
	}
};
