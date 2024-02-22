import axios from 'axios';
import { OPENAIPKEY } from '$env/static/private';
import type {
	AirportData,
	AirportReportingPointData,
	AirspaceData
} from './AeronauticalClasses/OpenAIPTypes';
import { readFileSync, writeFileSync } from 'fs';
import Airport from './AeronauticalClasses/Airport';
import Runway from './AeronauticalClasses/Runway';
import { Frequency } from './Frequency';
import Airspace from './AeronauticalClasses/Airspace';
import { getPolygonCenter } from './utils';
import { db } from '$lib/db/db';
import { airportsJSON, airspacesJSON } from '$lib/db/schema';

export type AirportReportingPointDBData = {
	name: string;
	coordinates: [number, number];
	compulsory: boolean;
};

export function checkDataUpToDate(): boolean {
	// TODO
	return true;
}

export async function writeDataToJSON(): Promise<void> {
	const airportReportingPoints = await getAllUKAirportReportingPoints();

	const airports = await getAllUKAirports();

	for (let i = 0; i < airportReportingPoints.length; i++) {
		const associatedAirport = airports.find(
			(airport) => airport._id === airportReportingPoints[i].airports[0]
		);

		if (!associatedAirport) {
			console.log(
				`No airport found for reporting point: ${airportReportingPoints[i].name} for airport: ${airportReportingPoints[i].airports[0]}`
			);
			continue;
		}
		if (!associatedAirport.reportingPoints) {
			associatedAirport.reportingPoints = [];
			associatedAirport?.reportingPoints.push({
				name: airportReportingPoints[i].name,
				coordinates: [
					airportReportingPoints[i].geometry.coordinates[1],
					airportReportingPoints[i].geometry.coordinates[0]
				],
				compulsory: airportReportingPoints[i].compulsory
			});
		} else {
			associatedAirport.reportingPoints.push({
				name: airportReportingPoints[i].name,
				coordinates: [
					airportReportingPoints[i].geometry.coordinates[1],
					airportReportingPoints[i].geometry.coordinates[0]
				],
				compulsory: airportReportingPoints[i].compulsory
			});
		}
	}

	writeFileSync('src/lib/data/airports.json', JSON.stringify(airports, null, 2));

	const airspaces = await getAllUKAirspace();

	for (let i = 0; i < airspaces.length; i++) {
		const centrePoint = getPolygonCenter(airspaces[i].geometry.coordinates[0]);
		airspaces[i].centrePoint = [centrePoint[0], centrePoint[1]];
	}

	writeFileSync('src/lib/data/airspaces.json', JSON.stringify(airspaces, null, 2));
}

export function readAirportDataFromJSON(): AirportData[] {
	return JSON.parse(readFileSync('src/lib/data/airports.json', 'utf8')) as AirportData[];
}

export function readAirspaceDataFromJSON(): AirspaceData[] {
	return JSON.parse(readFileSync('src/lib/data/airspaces.json', 'utf8')) as AirspaceData[];
}

export async function readAirportDataFromDB(): Promise<AirportData[]> {
	const airportData = await db.query.airportsJSON.findFirst({
		columns: {
			json: true
		}
	});

	const airportDataJSON = JSON.parse(airportData.json) as AirportData[];

	return airportDataJSON;
}

export async function readAirspaceDataFromDB(): Promise<AirspaceData[]> {
	const airspaceData = await db.query.airspacesJSON.findFirst({
		columns: {
			json: true
		}
	});

	const airspaceDataJSON = JSON.parse(airspaceData.json) as AirspaceData[];

	return airspaceDataJSON;
}

// Dangerous functions --------------------------------------------
export async function pushAirportDataToDatabase(): Promise<void> {
	const airportData = JSON.stringify(readAirportDataFromJSON());
	await db.insert(airportsJSON).values({ json: airportData });
}

export async function pushAirspaceDataToDatabase(): Promise<void> {
	const airspaceData = JSON.stringify(readAirspaceDataFromJSON());
	await db.insert(airspacesJSON).values({ json: airspaceData });
}
// Dangerous functions --------------------------------------------

export function airportDataToAirport(airportData: AirportData): Airport {
	return new Airport(
		airportData.name,
		airportData.icaoCode,
		airportData.iataCode,
		airportData.altIdentifier,
		airportData.type,
		airportData.country,
		[airportData.geometry.coordinates[1], airportData.geometry.coordinates[0]],
		airportData.reportingPoints,
		airportData.elevation.value,
		airportData.trafficType,
		airportData.ppr,
		airportData.private,
		airportData.skydiveActivity,
		airportData.winchOnly,
		airportData.runways?.map((runway) => {
			return new Runway(
				runway.designator,
				runway.trueHeading,
				runway.alignedTrueNorth,
				runway.operations,
				runway.mainRunway,
				runway.turnDirection,
				runway.landingOnly,
				runway.takeOffOnly,
				runway.dimension.length.value,
				runway.dimension.length.unit,
				runway.dimension.width.value,
				runway.dimension.width.unit,
				runway.declaredDistance.tora.value,
				runway.declaredDistance.tora.unit,
				runway.declaredDistance.toda?.value,
				runway.declaredDistance.toda?.unit,
				runway.declaredDistance.asda?.value,
				runway.declaredDistance.asda?.unit,
				runway.declaredDistance.lda.value,
				runway.declaredDistance.lda.unit,
				[
					runway.thresholdLocation?.geometry.coordinates[1],
					runway.thresholdLocation?.geometry.coordinates[0]
				],
				runway.thresholdLocation?.elevation.value,
				runway.thresholdLocation?.elevation.unit,
				runway.exclusiveAircraftType,
				runway.pilotCtrlLighting,
				runway.lightingSystem,
				runway.visualApproachAids
			);
		}),
		airportData.frequencies?.map((frequency) => {
			return new Frequency(
				frequency.value,
				frequency.unit,
				frequency.name,
				frequency.type,
				frequency.primary
			);
		})
	);
}

export function airspaceDataToAirspace(airspaceData: AirspaceData): Airspace {
	return new Airspace(
		airspaceData.name,
		airspaceData.type,
		airspaceData.icaoClass,
		airspaceData.activity,
		airspaceData.onDemand,
		airspaceData.onRequest,
		airspaceData.byNotam,
		airspaceData.specialAgreement,
		airspaceData.requestCompliance,
		[airspaceData.centrePoint[1], airspaceData.centrePoint[0]],
		airspaceData.geometry.coordinates[0].map((coordinate) => {
			return [coordinate[1], coordinate[0]];
		}),
		airspaceData.country,
		airspaceData.upperLimit.value,
		airspaceData.lowerLimit.value,
		airspaceData.upperLimitMax?.value,
		airspaceData.lowerLimitMin?.value
	);
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
