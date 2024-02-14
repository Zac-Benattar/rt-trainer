import { db } from '$lib/db/db';
import { json } from '@sveltejs/kit';
import { airspaces } from '$lib/db/schema';
import { Column, sql } from 'drizzle-orm';

export async function GET({ url, setHeaders }) {
	const lat: string | null = url.searchParams.get('lat');
	let latNumber: number = 51.5074;
	const long: string | null = url.searchParams.get('long');
	let longNumber: number = 0.1278;
	const radius: string | null = url.searchParams.get('radius');
	let radiusNumber: number = 10000000;
	const radiusMode: boolean = lat != null || long != null || radius != null;
	let airspaceRows: any;

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
		'cache-control': 'public, max-age=600'
	});

	if (radiusMode) {
		airspaceRows = await db
			.select({
				id: airspaces.id,
				openaip_id: airspaces.openaipId,
				name: airspaces.name,
				type: airspaces.type,
				icao_class: airspaces.icaoClass,
				activity: airspaces.activity,
				on_demand: airspaces.onDemand,
				on_request: airspaces.onRequest,
				by_notam: airspaces.byNotam,
				special_agreement: airspaces.specialAgreement,
				request_compliance: airspaces.requestCompliance,
				geometry: geometryToGeoJSON(airspaces.geometry),
				centre: geometryToGeoJSON(airspaces.centre),
				country: airspaces.country,
				upper_limit: airspaces.upperLimit,
				lower_limit: airspaces.lowerLimit,
				upper_limit_max: airspaces.upperLimitMax,
				lower_limit_min: airspaces.lowerLimit_Min
			})
			.from(airspaces)
			.where(
				sql`ST_Distance_Sphere(ST_GeomFromText('POINT(${latNumber} ${longNumber})'), ST_GeomFromText(centre)) < ${radiusNumber}`
			)
			.execute();
	} else {
		airspaceRows = await db
			.select({
				id: airspaces.id,
				openaip_id: airspaces.openaipId,
				name: airspaces.name,
				type: airspaces.type,
				icao_class: airspaces.icaoClass,
				activity: airspaces.activity,
				on_demand: airspaces.onDemand,
				on_request: airspaces.onRequest,
				by_notam: airspaces.byNotam,
				special_agreement: airspaces.specialAgreement,
				request_compliance: airspaces.requestCompliance,
				geometry: geometryToGeoJSON(airspaces.geometry),
				centre: geometryToGeoJSON(airspaces.centre),
				country: airspaces.country,
				upper_limit: airspaces.upperLimit,
				lower_limit: airspaces.lowerLimit,
				upper_limit_max: airspaces.upperLimitMax,
				lower_limit_min: airspaces.lowerLimit_Min
			})
			.from(airspaces)
			.execute();
	}

	function geometryToGeoJSON(geometry: Column) {
		return sql`ST_AsGeoJSON(ST_GeomFromText(${geometry}))`;
	}

	const airspacesAPIFormat = airspaceRows.map((row) => {
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

	return json(airspacesAPIFormat);
}
