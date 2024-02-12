import { db } from '$lib/db/db';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import type { MySqlRawQueryResult } from "drizzle-orm/mysql2";

export async function GET({ url, setHeaders }) {
	const lat: string | null = url.searchParams.get('lat');
	const long: string | null = url.searchParams.get('long');
	const radius: string | null = url.searchParams.get('radius');

	if (lat == null) {
		return json({ error: 'No lat provided' });
	}

	if (long == null) {
		return json({ error: 'No long provided' });
	}

	if (radius == null) {
		return json({ error: 'No radius provided' });
	}

	const radiusNumber = parseFloat(radius);
	if (isNaN(radiusNumber)) {
		return json({ error: 'Invalid radius provided' });
	}

	const coordsStruct = {
		lat: parseFloat(lat),
		long: parseFloat(long)
	};

	setHeaders({
		'cache-control': 'public, max-age=600'
	});

	// const matchingAirspace = await db
	// 	.select({ id: airspace.id, centre: airspace.centre })
	// 	.from(airspace)
	// 	.where((builder) => {
	// 		builder.whereRaw(
	// 			`ST_Distance_Sphere(ST_GeomFromText('POINT(${coordsStruct.long} ${coordsStruct.lat})'), ST_GeomFromText(centre)) < ${radiusNumber}`
	// 		);
	// 	});

	const matchingAirspace = sql`select * from airspace where ST_Distance_Sphere(ST_GeomFromText('POINT(${coordsStruct.long} ${coordsStruct.lat})'), ST_GeomFromText(centre)) < ${radiusNumber}`;
	const res: MySqlRawQueryResult = await db.execute(matchingAirspace);

	console.log(res);

	return json(res);
}
