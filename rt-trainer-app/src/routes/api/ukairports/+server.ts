import { db } from '$lib/db/db';
import { airports } from '$lib/db/schema';
import { json } from '@sveltejs/kit';
import { Column, inArray, sql } from 'drizzle-orm';

export async function GET({ setHeaders, url }) {
	const lat: string | null = url.searchParams.get('lat');
	let latNumber: number = 51.5074;
	const long: string | null = url.searchParams.get('long');
	let longNumber: number = 0.1278;
	const radius: string | null = url.searchParams.get('radius');
	let radiusNumber: number = 10000000;
	const radiusMode: boolean = lat != null || long != null || radius != null;
	const types: string[] = url.searchParams.getAll('types');
	let typesNumbers: number[] = [];
	if (types.length > 0) {
		typesNumbers = types.map((type) => {
			return parseInt(type);
		});
	}

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
		// Get airports within radius and with the correct type
		airportRows = await db
			.select({
				id: airports.id,
				openaip_id: airports.openaipId,
				name: airports.name,
				icao_code: airports.icaoCode,
				iata_code: airports.iataCode,
				alt_identifier: airports.altIdentifier,
				type: airports.type,
				country: airports.country,
				geometry: geometryToGeoJSON(airports.geometry),
				elevation: airports.elevation,
				traffic_type: airports.trafficType,
				ppr: airports.ppr,
				private: airports.private,
				skydive_activity: airports.skydiveActivity,
				winch_only: airports.winchOnly,
				runways: airports.runways,
				frequencies: airports.frequencies,
				created_at: airports.createdAt
			})
			.from(airports)
			.where(
				sql`${
					airports.type
				} IN ${typesNumbers} AND ST_Distance_Sphere(ST_GeomFromText(${sql`'POINT(${longNumber} ${latNumber})'`}), ${
					airports.geometry
				}) < ${radiusNumber}`
			)
			.execute();
	} else {
		airportRows = await db
			.select({
				id: airports.id,
				openaip_id: airports.openaipId,
				name: airports.name,
				icao_code: airports.icaoCode,
				iata_code: airports.iataCode,
				alt_identifier: airports.altIdentifier,
				type: airports.type,
				country: airports.country,
				geometry: geometryToGeoJSON(airports.geometry),
				elevation: airports.elevation,
				traffic_type: airports.trafficType,
				ppr: airports.ppr,
				private: airports.private,
				skydive_activity: airports.skydiveActivity,
				winch_only: airports.winchOnly,
				runways: airports.runways,
				frequencies: airports.frequencies,
				created_at: airports.createdAt
			})
			.from(airports)
			.where(inArray(airports.type, typesNumbers))
			.execute();
	}

	function geometryToGeoJSON(geometry: Column) {
		return sql`ST_AsGeoJSON(ST_GeomFromText(${geometry}))`;
	}

	const airportsAPIFormat = airportRows.map((row) => {
		return {
			id: row.id,
			openaipId: row.openaip_id,
			name: row.name,
			icaoCode: row.icao_code,
			iataCode: row.iata_code,
			altIdentifier: row.alt_identifier,
			type: row.type,
			country: row.country,
			geometry: row.geometry,
			elevation: row.elevation,
			trafficType: row.traffic_type,
			ppr: row.ppr,
			private: row.private,
			skydiveActivity: row.skydive_activity,
			winchOnly: row.winch_only,
			runways: row.runways,
			frequencies: row.frequencies,
			createdAt: row.created_at
		};
	});

	return json(airportsAPIFormat);
}
