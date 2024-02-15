import { db } from '$lib/db/db';
import { airports } from '$lib/db/schema';
import { json } from '@sveltejs/kit';
import { inArray, sql } from 'drizzle-orm';

export async function GET({ setHeaders, url }) {
	const lat: string | null = url.searchParams.get('lat');
	let latNumber: number = 51.5074;
	const long: string | null = url.searchParams.get('long');
	let longNumber: number = 0.1278;
	const radius: string | null = url.searchParams.get('radius');
	let radiusNumber: number = 10000000;
	const radiusMode: boolean = lat != null || long != null || radius != null;
	const types: string[] = url.searchParams.getAll('type');
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
			.select()
			.from(airports)
			.where(
				sql`${
					airports.type
				} IN ${typesNumbers} AND ST_Distance_Sphere(ST_GeomFromText(${sql`'POINT(${longNumber} ${latNumber})'`}), (${sql`'POINT(${airports.longitude} ${airports.latitude})'`})) < ${radiusNumber}`
			)
			.execute();
	} else {
		airportRows = await db
			.select()
			.from(airports)
			.where(inArray(airports.type, typesNumbers))
			.execute();
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
			latitude: row.latitude,
			longitude: row.longitude,
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
