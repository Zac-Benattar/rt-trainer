import { db } from '$lib/db/db';
import { json } from '@sveltejs/kit';
import { airspace } from '$lib/db/schema';
import { Column, sql } from 'drizzle-orm';

export async function GET({ url, setHeaders }) {
	const lat: string | null = url.searchParams.get('lat');
	let latNumber: number = 51.5074;
	const long: string | null = url.searchParams.get('long');
	let longNumber: number = 0.1278;
	const radius: string | null = url.searchParams.get('radius');
	let radiusNumber: number = 10000000;

	if (lat != null || long != null || radius != null) {
		if (radius == null) {
			return json({ error: 'No radius provided' });
		}

		radiusNumber = parseFloat(radius);
		if (isNaN(radiusNumber)) {
			return json({ error: 'Invalid radius provided' });
		}

		if (lat == null) {
			return json({ error: 'No lat provided' });
		}

		latNumber = parseFloat(lat);
		if (isNaN(latNumber)) {
			return json({ error: 'Invalid lat provided' });
		}

		if (long == null) {
			return json({ error: 'No long provided' });
		}

		longNumber = parseFloat(long);
		if (isNaN(longNumber)) {
			return json({ error: 'Invalid long provided' });
		}
	}

	setHeaders({
		'cache-control': 'public, max-age=600'
	});

	// const airspaceRows = await db
	// .select({
	// 	id: airspace.id,
	// 	openaip_id: airspace.openaip_id,
	// 	name: airspace.name,
	// 	type: airspace.type,
	// 	icao_class: airspace.icao_class,
	// 	activity: airspace.activity,
	// 	on_demand: airspace.on_demand,
	// 	on_request: airspace.on_request,
	// 	by_notam: airspace.byNotam,
	// 	special_agreement: airspace.special_agreement,
	// 	request_compliance: airspace.request_compliance,
	// 	geometry: geometryToGeoJSON(airspace.geometry),
	// 	centre: geometryToGeoJSON(airspace.centre),
	// 	country: airspace.country,
	// 	upper_limit: airspace.upper_limit,
	// 	lower_limit: airspace.lower_limit,
	// 	upper_limit_max: airspace.upper_limit_max,
	// 	lower_limit_min: airspace.lower_limit_min
	// })
	// .from(airspace)
	// .where(
	// 	sql`ST_Distance_Sphere(ST_GeomFromText('POINT(${latNumber} ${longNumber})'), ST_GeomFromText(centre)) < ${radiusNumber}`
	// )
	// .execute();

	const airspaceRows = await db
		.select({
			id: airspace.id,
			openaip_id: airspace.openaip_id,
			name: airspace.name,
			type: airspace.type,
			icao_class: airspace.icao_class,
			activity: airspace.activity,
			on_demand: airspace.on_demand,
			on_request: airspace.on_request,
			by_notam: airspace.byNotam,
			special_agreement: airspace.special_agreement,
			request_compliance: airspace.request_compliance,
			geometry: geometryToGeoJSON(airspace.geometry),
			centre: geometryToGeoJSON(airspace.centre),
			country: airspace.country,
			upper_limit: airspace.upper_limit,
			lower_limit: airspace.lower_limit,
			upper_limit_max: airspace.upper_limit_max,
			lower_limit_min: airspace.lower_limit_min
		})
		.from(airspace)
		.execute();

	function geometryToGeoJSON(geometry: Column) {
		return sql`ST_AsGeoJSON(ST_GeomFromText(${geometry}))`;
	}

	const airspaces = airspaceRows.map((row) => {
		return {
			id: row.id,
			_id: row.openaip_id,
			name: row.name,
			type: row.type,
			icaoClass: row.icao_class,
			activity: row.activity,
			onDemand: row.on_demand,
			onRequest: row.on_request,
			byNotam: row.by_notam,
			specialAgreement: row.special_agreement,
			requestCompliance: row.request_compliance,
			geometry: row.geometry,
			centre: row.centre,
			country: row.country,
			upperLimit: row.upper_limit,
			lowerLimit: row.lower_limit,
			upperLimitMax: row.upper_limit_max,
			lowerLimitMin: row.lower_limit_min
		};
	});

	return json(airspaces);
}
