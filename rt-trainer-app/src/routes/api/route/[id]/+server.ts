import { db } from '$lib/db/db';
import { routes, routePoints } from '$lib/db/schema';
import { json } from '@sveltejs/kit';
import { Column, sql } from 'drizzle-orm';

export async function GET({ params }) {
	const id: string = params.id;

	const route = await db
		.select({
			id: routes.id,
			name: routes.name,
			created_at: routes.created_at,
			updated_at: routes.updated_at,
			points: routePoints.id
		})
		.from(routes)
		.where({ id })
		.leftJoin(routePoints, sql`${routes.id} = ${routePoints.route}`);
}
