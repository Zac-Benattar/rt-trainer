import axios from 'axios';
import { OPENAIPKEY } from '$env/static/private';
import type {
	AirportData,
	AirportReportingPointData,
	AirspaceData
} from './AeronauticalClasses/OpenAIPTypes';
import Airport from './AeronauticalClasses/Airport';
import Runway from './AeronauticalClasses/Runway';
import { Frequency } from './Frequency';
import Airspace from './AeronauticalClasses/Airspace';

export type AirportReportingPointDBData = {
	name: string;
	coordinates: [number, number];
	compulsory: boolean;
};

export async function getAllAirspaceData(): Promise<Airspace[]> {
	const airspaceData = await getAllUKAirspaceFromOpenAIP();
	const airspaces = airspaceData.map((airspaceData) => airspaceDataToAirspace(airspaceData));
	return airspaces;
}

export async function getAllAirportData(): Promise<Airport[]> {
	const airportData = await getAllUKAirportsFromOpenAIP();
	const airports = airportData.map((airportData) => airportDataToAirport(airportData));
	return airports;
}

export function airportDataToAirport(airportData: AirportData): Airport {
	return new Airport(
		airportData._id,
		airportData.name,
		airportData.icaoCode,
		airportData.iataCode,
		airportData.altIdentifier,
		airportData.type,
		airportData.country,
		airportData.geometry.coordinates,
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
				runway.declaredDistance.tora?.value,
				runway.declaredDistance.tora?.unit,
				runway.declaredDistance.toda?.value,
				runway.declaredDistance.toda?.unit,
				runway.declaredDistance.asda?.value,
				runway.declaredDistance.asda?.unit,
				runway.declaredDistance.lda?.value,
				runway.declaredDistance.lda?.unit,
				runway.thresholdLocation?.geometry.coordinates,
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
		airspaceData._id,
		airspaceData.name,
		airspaceData.type,
		airspaceData.icaoClass,
		airspaceData.activity,
		airspaceData.onDemand,
		airspaceData.onRequest,
		airspaceData.byNotam,
		airspaceData.specialAgreement,
		airspaceData.requestCompliance,
		airspaceData.geometry.coordinates,
		airspaceData.country,
		airspaceData.upperLimit.value,
		airspaceData.lowerLimit.value,
		airspaceData.upperLimitMax?.value,
		airspaceData.lowerLimitMin?.value,
		airspaceData.frequencies?.map((frequency) => {
			return new Frequency(frequency.value, frequency.unit, frequency.name, 0, frequency.primary);
		})
	);
}

export async function getAirspacesFromIds(airspaceIds: string[]): Promise<Airspace[]> {
	try {
		const response = await axios.get(`https://api.core.openaip.net/api/airspaces`, {
			headers: {
				'Content-Type': 'application/json',
				'x-openaip-client-id': OPENAIPKEY
			},
			params: {
				ids: airspaceIds
			}
		});

		console.log('Fetched airspaces from OpenAIP');

		return response.data.items as Airspace[];
	} catch (error: unknown) {
		console.error('Error: ', error);
	}

	return [];
}

export async function getAirportsFromIds(airportIds: string[]): Promise<Airport[]> {
	try {
		const response = await axios.get(`https://api.core.openaip.net/api/airports`, {
			headers: {
				'Content-Type': 'application/json',
				'x-openaip-client-id': OPENAIPKEY
			},
			params: {
				ids: airportIds
			}
		});

		console.log('Fetched airports from OpenAIP');

		return response.data.items as Airport[];
	} catch (error: unknown) {
		console.error('Error: ', error);
	}

	return [];
}

export async function getAllUKAirportsFromOpenAIP(): Promise<AirportData[]> {
	try {
		const response = await axios.get(`https://api.core.openaip.net/api/airports`, {
			headers: {
				'Content-Type': 'application/json',
				'x-openaip-client-id': OPENAIPKEY
			},
			params: {
				country: 'GB',
				type: [0, 2, 3, 9],
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

export async function getAllUKAirspaceFromOpenAIP(): Promise<AirspaceData[]> {
	try {
		const response1 = await axios.get(`https://api.core.openaip.net/api/airspaces`, {
			headers: {
				'Content-Type': 'application/json',
				'x-openaip-client-id': OPENAIPKEY
			},
			params: {
				page: 1,
				country: 'GB',
				icaoClass: [1, 2, 3, 4, 5, 6, 8],
				onDemand: false,
				onRequest: false,
				byNotam: false,
				sortBy: 'geometry.coordinates[0][0][0]'
			}
		});

		if (response1.data.items.length === 0) {
			console.log('No airspaces found on page 1');
			return [];
		}

		console.log('Fetched all airspace from OpenAIP');

		return [...response1.data.items] as AirspaceData[];
	} catch (error: unknown) {
		console.error('Error: ', error);
	}
	return [];
}

export async function getAllUKAirportReportingPointsFromOpenAIP(): Promise<
	AirportReportingPointData[]
> {
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
