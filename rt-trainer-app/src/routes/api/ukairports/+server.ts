import { db } from '$lib/db/db';
import { airport } from '$lib/db/schema';
import { json } from '@sveltejs/kit';
import { Column, sql } from 'drizzle-orm';

export async function GET({ setHeaders, url }) {
	const lat: string | null = url.searchParams.get('lat');
	let latNumber: number = 51.5074;
	const long: string | null = url.searchParams.get('long');
	let longNumber: number = 0.1278;
	const radius: string | null = url.searchParams.get('radius');
	let radiusNumber: number = 10000000;
	const radiusMode: boolean = lat != null || long != null || radius != null;
	let airportRows: any;

	if (radiusMode) {
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
		'cache-control': 'public, max-age=31536000'
	});

	if (radiusMode) {
		airportRows = await db
			.select({
				id: airport.id,
				openaip_id: airport.openaip_id,
				name: airport.name,
				icao_code: airport.icao_code,
				iata_code: airport.iata_code,
				alt_identifier: airport.alt_identifier,
				type: airport.type,
				country: airport.country,
				geometry: geometryToGeoJSON(airport.geometry),
				elevation: airport.elevation,
				traffic_type: airport.traffic_type,
				ppr: airport.ppr,
				private: airport.private,
				skydive_activity: airport.skydive_activity,
				winch_only: airport.winch_only,
				runways: airport.runways,
				frequencies: airport.frequencies,
				created_at: airport.created_at,
				aeronautical_data_object: airport.aeronautical_data_object
			})
			.from(airport)
			.where(
				sql`ST_Distance_Sphere(ST_GeomFromText('POINT(${latNumber} ${longNumber})'), ST_GeomFromText(geometry)) < ${radiusNumber}`
			)
			.execute();
	} else {
		airportRows = await db
			.select({
				id: airport.id,
				openaip_id: airport.openaip_id,
				name: airport.name,
				icao_code: airport.icao_code,
				iata_code: airport.iata_code,
				alt_identifier: airport.alt_identifier,
				type: airport.type,
				country: airport.country,
				geometry: geometryToGeoJSON(airport.geometry),
				elevation: airport.elevation,
				traffic_type: airport.traffic_type,
				ppr: airport.ppr,
				private: airport.private,
				skydive_activity: airport.skydive_activity,
				winch_only: airport.winch_only,
				runways: airport.runways,
				frequencies: airport.frequencies,
				created_at: airport.created_at,
				aeronautical_data_object: airport.aeronautical_data_object
			})
			.from(airport)
			.execute();
	}

	function geometryToGeoJSON(geometry: Column) {
		return sql`ST_AsGeoJSON(ST_GeomFromText(${geometry}))`;
	}

	const airports = airportRows.map((row) => {
		return {
			id: row.id,
			openaip_id: row.openaip_id,
			name: row.name,
			icao_code: row.icao_code,
			iata_code: row.iata_code,
			alt_identifier: row.alt_identifier,
			type: row.type,
			country: row.country,
			geometry: row.geometry,
			elevation: row.elevation,
			traffic_type: row.traffic_type,
			ppr: row.ppr,
			private: row.private,
			skydive_activity: row.skydive_activity,
			winch_only: row.winch_only,
			runways: row.runways,
			frequencies: row.frequencies,
			created_at: row.created_at,
			aeronautical_data_object: row.aeronautical_data_object
		};
	});

	return json(airports);
}
