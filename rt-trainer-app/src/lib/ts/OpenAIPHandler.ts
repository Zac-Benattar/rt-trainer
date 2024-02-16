import axios from 'axios';
import { OPENAIPKEY } from '$env/static/private';
import type {
	AirportData,
	AirportReportingPointData,
	AirspaceData
} from './AeronauticalClasses/OpenAIPTypes';
import {
	airportReportingPoints,
	airports,
	airspaces,
	frequencies,
	polygonPoints,
	polygons,
	runways
} from '$lib/db/schema';
import { db } from '$lib/db/db';
import { fail } from '@sveltejs/kit';
import { getPolygonCenter } from './utils';

export async function checkSystemHealth(): Promise<string> {
	try {
		const response = await axios.get(`https://api.core.openaip.net/api/system/health`);
		return response.data.system;
	} catch (error: unknown) {
		console.error('Error: ', error);
		return 'error';
	}
}

export async function getAllUKAirports(): Promise<AirportData[]> {
	try {
		const response = await axios.get(`https://api.core.openaip.net/api/airports`, {
			headers: {
				'Content-Type': 'application/json',
				'x-openaip-client-id': OPENAIPKEY
			},
			params: {
				country: 'GB',
				sortBy: 'geometry.coordinates[0]'
			}
		});

		console.log('Fetched all airports from OpenAIP');

		return response.data.items as AirportData[];
	} catch (error: unknown) {
		console.error('Error: ', error);
	}
	return [];
}

export async function getAllUKAirspace(): Promise<AirspaceData[]> {
	try {
		const response1 = await axios.get(`https://api.core.openaip.net/api/airspaces`, {
			headers: {
				'Content-Type': 'application/json',
				'x-openaip-client-id': OPENAIPKEY
			},
			params: {
				page: 1,
				country: 'GB',
				sortBy: 'geometry.coordinates[0][0][0]'
			}
		});

		const response2 = await axios.get(`https://api.core.openaip.net/api/airspaces`, {
			headers: {
				'Content-Type': 'application/json',
				'x-openaip-client-id': OPENAIPKEY
			},
			params: {
				page: 2,
				country: 'GB',
				sortBy: 'geometry.coordinates[0][0][0]'
			}
		});

		console.log('Fetched all airspace from OpenAIP');

		return [...response1.data.items, ...response2.data.items] as AirspaceData[];
	} catch (error: unknown) {
		console.error('Error: ', error);
	}
	return [];
}

export async function getAllUKAirportReportingPoints(): Promise<AirportReportingPointData[]> {
	try {
		const response = await axios.get(`https://api.core.openaip.net/api/reporting-points`, {
			headers: {
				'Content-Type': 'application/json',
				'x-openaip-client-id': OPENAIPKEY
			},
			params: {
				country: 'GB',
				sortBy: 'geometry.coordinates[0]'
			}
		});

		console.log('Fetched all airport reporting points from OpenAIP');

		return response.data.items as AirportReportingPointData[];
	} catch (error: unknown) {
		console.error('Error: ', error);
	}
	return [];
}

export async function checkOpenAIPDataUpToDate(): Promise<boolean> {
	// Get from the database the age of the first entry to airports
	const airport = await db.query.airports.findFirst();

	if (airport == undefined) return false;

	const airportCreatedDate = airport?.createdAt?.getTime();
	const currentDate = Date.now();

	if (airportCreatedDate == undefined) return true;

	if (currentDate - airportCreatedDate > 86400000) {
		return false;
	}

	return true;
}

export async function updateDatabaseWithNewOpenAIPData(): Promise<
	true | import('@sveltejs/kit').ActionFailure<{ message: string }>
> {
	console.log('Updating database with fresh data');

	/**
	 * Check OpenAIP system health
	 */
	const health = await checkSystemHealth();

	if (health != 'OK') {
		return fail(400, { message: 'OpenAIP system health not OK' });
	}

	/**
	 * Clear airports table, runways table and frequency table
	 */
	await db.delete(airports);
	await db.delete(runways);
	await db.delete(frequencies);

	/**
	 * Fetch all UK airports
	 */
	const airportsData = await getAllUKAirports();
	
	console.log(`Fetched ${airportsData.length} airports from OpenAIP`);

	/**
	 * Add airports to database
	 */
	for (let i = 0; i < airportsData.length; i++) {
		const airportsTable = await db.insert(airports).values({
			openaipId: airportsData[i]._id,
			name: airportsData[i].name,
			icaoCode: airportsData[i].icaoCode,
			iataCode: airportsData[i].iataCode,
			altIdentifier: airportsData[i].altIdentifier,
			type: airportsData[i].type,
			country: airportsData[i].country,
			latitude: airportsData[i].geometry.coordinates[0],
			longitude: airportsData[i].geometry.coordinates[1],
			elevation: airportsData[i].elevation.value,
			trafficType: airportsData[i].trafficType.join(', '),
			ppr: airportsData[i].ppr,
			private: airportsData[i].private,
			skydiveActivity: airportsData[i].skydiveActivity,
			winchOnly: airportsData[i].winchOnly
		});

		// Insert runways for the current airport
		const runwaysToInsert = airportsData[i].runways?.map((runway) => ({
			openaipId: runway._id,
			airportId: parseInt(airportsTable.insertId),
			designator: runway.designator,
			trueHeading: runway.trueHeading,
			alignedTrueNorth: runway.alignedTrueNorth,
			operations: runway.operations,
			mainRunway: runway.mainRunway,
			turnDirection: runway.turnDirection,
			landingOnly: runway.landingOnly,
			takeOffOnly: runway.takeOffOnly,
			lengthValue: runway.dimension.length.value,
			lengthUnit: runway.dimension.length.unit,
			widthValue: runway.dimension.width.value,
			widthUnit: runway.dimension.width.unit,
			toraValue: runway.declaredDistance.tora.value,
			toraUnit: runway.declaredDistance.tora.unit,
			todaValue: runway.declaredDistance.toda?.value,
			todaUnit: runway.declaredDistance.toda?.unit,
			asdaValue: runway.declaredDistance.asda?.value,
			asdaUnit: runway.declaredDistance.asda?.unit,
			ldaValue: runway.declaredDistance.lda.value,
			ldaUnit: runway.declaredDistance.lda.unit,
			thresholdLat: runway.thresholdLocation?.geometry.coordinates[0],
			thresholdLong: runway.thresholdLocation?.geometry.coordinates[1],
			thresholdElevationValue: runway.thresholdLocation?.elevation.value,
			thresholdElevationUnit: runway.thresholdLocation?.elevation.unit,
			exclusiveAircraftTypes: runway.exclusiveAircraftType?.join(', '),
			pilotCtrlLighting: runway.pilotCtrlLighting,
			lightingSystem: runway.lightingSystem?.join(', ')
		}));

		if (runwaysToInsert) await db.insert(runways).values(runwaysToInsert);

		// Insert frequencies for the current airport
		const frequenciesToInsert = airportsData[i].frequencies?.map((frequency) => ({
			openaipId: frequency._id,
			frequencyFor: parseInt(airportsTable.insertId),
			value: frequency.value,
			unit: frequency.unit,
			type: frequency.type,
			name: frequency.name,
			primary: frequency.primary,
			publicUse: frequency.publicUse
		}));
		if (frequenciesToInsert) await db.insert(frequencies).values(frequenciesToInsert);
	}

	console.log('Sucessfully inserted Airport data');

	/**
	 * Clear airspaces, polygon table and polygon points table
	 */
	await db.delete(airspaces);
	await db.delete(polygons);
	await db.delete(polygonPoints);

	/**
	 * Fetch all UK airspace
	 */
	const airspaceData = await getAllUKAirspace();

	console.log(`Fetched ${airspaceData.length} airspaces from OpenAIP`);

	/**
	 * Add airspace to database
	 */
	for (let i = 0; i < airspaceData.length; i++) {
		const polygonCenter = getPolygonCenter(airspaceData[i].geometry.coordinates[0]);

		const airspacesTable = await db.insert(airspaces).values({
			openaipId: airspaceData[i]._id,
			name: airspaceData[i].name,
			type: airspaceData[i].type,
			icaoClass: airspaceData[i].icaoClass,
			activity: airspaceData[i].activity,
			onDemand: airspaceData[i].onDemand,
			onRequest: airspaceData[i].onRequest,
			byNotam: airspaceData[i].byNotam,
			specialAgreement: airspaceData[i].specialAgreement,
			requestCompliance: airspaceData[i].requestCompliance,
			country: airspaceData[i].country,
			upperLimit: airspaceData[i].upperLimit.value,
			lowerLimit: airspaceData[i].lowerLimit.value
		});

		const polygonsTable = await db.insert(polygons).values({
			airspaceId: parseInt(airspacesTable.insertId),
			centreLatitude: polygonCenter[0],
			centreLongitude: polygonCenter[1]
		});

		await db.insert(polygonPoints).values(
			airspaceData[i].geometry.coordinates[0].map((point) => ({
				polygonId: parseInt(polygonsTable.insertId),
				latitude: point[0].toString(),
				longitude: point[1].toString()
			}))
		);
	}
	console.log('Sucessfully inserted Airspace data');

	/**
	 * Clear airport reporting point table
	 */
	await db.delete(airportReportingPoints);

	/**
	 * Fetch all UK airspace
	 */
	const airportReportingPointsData = await getAllUKAirportReportingPoints();

	console.log(`Fetched ${airportReportingPointsData.length} airport reporting points from OpenAIP`);

	/**
	 * Add airspace to database
	 */
	for (let i = 0; i < airportReportingPointsData.length; i++) {
		await db.insert(airportReportingPoints).values({
			openaipId: airportReportingPointsData[i]._id,
			name: airportReportingPointsData[i].name,
			compulsary: airportReportingPointsData[i].compulsory,
			country: airportReportingPointsData[i].country,
			latitude: airportReportingPointsData[i].geometry.coordinates[0],
			longitude: airportReportingPointsData[i].geometry.coordinates[1],
			elevation: airportReportingPointsData[i].elevation.value,
			airports: airportReportingPointsData[i].airports.join(', ')
		});
	}

	console.log('Sucessfully updated all OpenAIP data');

	return true;
}
