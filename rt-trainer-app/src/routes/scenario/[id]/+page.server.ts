import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const routeId = event.params.id;

	if (!session?.user && routeId != 'demo') throw redirect(303, '/login');
	return {};
};
