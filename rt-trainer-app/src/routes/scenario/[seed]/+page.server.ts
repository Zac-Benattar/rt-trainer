import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const seed = event.params.seed;

	if (!session?.user && seed != 'demo') throw redirect(303, '/login');
	return {};
};
