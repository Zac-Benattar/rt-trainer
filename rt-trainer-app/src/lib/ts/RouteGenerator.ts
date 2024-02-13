import axios from 'axios';
import type Seed from './Seed';
import { WaypointType, Waypoint } from './Waypoint';
import type RouteElement from './RouteElement';
import ATZ from './ATZ';
import { getPolygonCenter, haversineDistance } from './utils';
import { db } from '$lib/db/db';
import {
	checkSystemHealth,
	getAllUKAirportReportingPoints,
	getAllUKAirports,
	getAllUKAirspace
} from './OpenAIPHandler';
import { fail } from '@sveltejs/kit';
import { airport, airportReportingPoint, airspace } from '$lib/db/schema';
import type { AirportData } from './OpenAIPTypes';

// TODO
export default class RouteGenerator {
	public static async checkOpenAIPDataUpToDate(): Promise<boolean> {
		// Get from the database the age of the first entry to airports
		const airport = await db.query.airport.findFirst();

		const airportCreatedDate = airport?.created_at?.getTime();
		const currentDate = Date.now();

		if (airportCreatedDate == undefined) return true;

		if (currentDate - airportCreatedDate > 86400000) {
			return false;
		}

		return true;
	}

	public static async updateDatabaseWithNewOpenAIPData(): Promise<
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
		 * Clear airports table
		 */
		await db.delete(airport);

		/**
		 * Fetch all UK airports
		 */
		const airportsData = await getAllUKAirports();

		/**
		 * Add airports to database
		 */
		for (let i = 0; i < airportsData.length; i++) {
			await db.insert(airport).values({
				openaip_id: airportsData[i]._id,
				name: airportsData[i].name,
				icao_code: airportsData[i].icaoCode,
				iata_code: airportsData[i].iataCode,
				alt_identifier: airportsData[i].altIdentifier,
				type: airportsData[i].type,
				country: airportsData[i].country,
				geometry: `POINT(${airportsData[i].geometry.coordinates.join(' ')})`,
				elevation: airportsData[i].elevation.value,
				traffic_type: airportsData[i].trafficType.join(', '),
				ppr: airportsData[i].ppr,
				private: airportsData[i].private,
				skydive_activity: airportsData[i].skydiveActivity,
				winch_only: airportsData[i].winchOnly,
				runways: airportsData[i].runways,
				frequencies: airportsData[i].frequencies
			});
		}
		console.log('Sucessfully inserted Airport data');

		/**
		 * Clear airspace table
		 */
		await db.delete(airspace);

		/**
		 * Fetch all UK airspace
		 */
		const airspaceData = await getAllUKAirspace();

		/**
		 * Add airspace to database
		 */
		for (let i = 0; i < airspaceData.length; i++) {
			// Convert geometry to WKT
			const geometryWKT = `POLYGON((${airspaceData[i].geometry.coordinates[0]
				.map((x) => x.join(' '))
				.join(', ')}))`;
			const polygonCenter = getPolygonCenter(airspaceData[i].geometry.coordinates[0]);
			const centerPointWKT = `POINT(${polygonCenter[1]} ${polygonCenter[0]})`;

			await db.insert(airspace).values({
				openaip_id: airspaceData[i]._id,
				name: airspaceData[i].name,
				type: airspaceData[i].type,
				icao_class: airspaceData[i].icaoClass,
				activity: airspaceData[i].activity,
				on_demand: airspaceData[i].onDemand,
				on_request: airspaceData[i].onRequest,
				byNotam: airspaceData[i].byNotam,
				special_agreement: airspaceData[i].specialAgreement,
				request_compliance: airspaceData[i].requestCompliance,
				geometry: geometryWKT,
				centre: centerPointWKT,
				country: airspaceData[i].country,
				upper_limit: airspaceData[i].upperLimit.value,
				lower_limit: airspaceData[i].lowerLimit.value
			});
		}
		console.log('Sucessfully inserted Airspace data');

		/**
		 * Clear airport reporting point table
		 */
		await db.delete(airportReportingPoint);

		/**
		 * Fetch all UK airspace
		 */
		const airportReportingPointsData = await getAllUKAirportReportingPoints();

		/**
		 * Add airspace to database
		 */
		for (let i = 0; i < airportReportingPointsData.length; i++) {
			await db.insert(airportReportingPoint).values({
				openaip_id: airportReportingPointsData[i]._id,
				name: airportReportingPointsData[i].name,
				compulsary: airportReportingPointsData[i].compulsory,
				country: airportReportingPointsData[i].country,
				geometry: `POINT(${airportReportingPointsData[i].geometry.coordinates.join(' ')})`,
				elevation: airportReportingPointsData[i].elevation.value,
				airports: airportReportingPointsData[i].airports.join(', ')
			});
		}

		console.log('Sucessfully updated all OpenAIP data');

		return true;
	}

	public static async getRouteWaypoints(seed: Seed): Promise<RouteElement[]> {
		// Ensure database data is up to date - can be moved to somewhere it is run less for even faster responses
		// Currently going to slow down all route gen methods a decent amount, please move
		if (!this.checkOpenAIPDataUpToDate()) {
			await this.updateDatabaseWithNewOpenAIPData();
		}

		// Fetch all airports from the database
		const airportsResponse = await axios.get('http://localhost:5173/api/ukairports');

		// Add valid (correct type) airports to list of valid airports for takeoff/landing
		const validAirports = [];
		for (let i = 0; i < airportsResponse.data.length; i++) {
			const airport = airportsResponse.data[i];
			if (airport.type == 0 || airport.type == 2 || airport.type == 3 || airport.type == 9)
				validAirports.push(airport);
		}

		// Fetch all airspaces from the database
		const airspacesResponse = await axios.get('http://localhost:5173/api/ukairspace');

		// Add valid (correct type) airspaces to list of valid airspaces for route
		const validAirspaces = [];
		for (let i = 0; i < airspacesResponse.data.length; i++) {
			const airspace = airspacesResponse.data[i];
			validAirspaces.push(airspace);
		}

		console.log(validAirports.length, validAirspaces.length);

		const maxIterations = 20;
		const numberOfValidAirports = validAirports.length;
		let startAirport;
		let startAirportIsControlled: boolean = false;
		let destinationAirport;
		let chosenMATZ: ATZ;
		let onRouteAirspace: ATZ[] = [];

		let validRoute = false;
		let iterations = 0;

		while (!validRoute && iterations < maxIterations) {
			iterations++;
			console.log('iteration: ', iterations);
			validRoute = true;

			// Get start airport. Based on seed times a prime times iterations + 1 to get different start airports each iteration
			startAirport =
				validAirports[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfValidAirports];
			if (startAirport.type == 3 || startAirport.type == 9) {
				startAirportIsControlled = true;
			}

			// Get all ATZ within 30km of the start airport
			const nearbyATZs: ATZ[] = [];
			for (let i = 0; i < validAirspaces.length; i++) {
				const distance = haversineDistance(
					startAirport.geometry.coordinates[1],
					startAirport.geometry.coordinates[0],
					validAirspaces[i].centre.coordinates[0],
					validAirspaces[i].centre.coordinates[1]
				);
				// console.log(startAirport.geometry.coordinates[1], startAirport.geometry.coordinates[0]);
				// console.log(validAirspaces[i].centre.coordinates[0], validAirspaces[i].centre.coordinates[1]);
				// console.log(distance);
				if (distance < 30000)
					nearbyATZs.push(
						new ATZ(
							validAirspaces[i].name,
							validAirspaces[i].geometry.coordinates,
							validAirspaces[i].centre.coordinates,
							validAirspaces[i].type,
							validAirspaces[i].height
						)
					);
			}

			// Get all valid MATZ from nearby ATZs
			const nearbyMATZs: ATZ[] = nearbyATZs.filter(
				(x) => x.type == 14 && !x.pointInsideATZ(startAirport.geometry.coordinates)
			);
			if (nearbyMATZs.length == 0) {
				validRoute = false;
				continue;
			}

			// Choose a MATZ to fly through
			const numberOfMATZs = nearbyMATZs.length;
			chosenMATZ = nearbyMATZs[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfMATZs];

			// Get airports within 50km of the chosen MATZ
			const possibleDestinations = [];
			const matzCenter = chosenMATZ.centre;

			for (let i = 0; i < validAirports.length; i++) {
				const airport = validAirports[i];
				const distance = haversineDistance(
					matzCenter[0],
					matzCenter[1],
					airport.geometry.coordinates[1],
					airport.geometry.coordinates[0]
				);

				if (
					(airport.type == 0 || airport.type == 2 || airport.type == 3 || airport.type == 9) &&
					distance < 100000
				)
					possibleDestinations.push(airport);
			}

			if (possibleDestinations.length == 0) {
				validRoute = false;
				continue;
			}

			// Choose a destination airport
			let validDestinationAirport: boolean = false;
			let destIterations: number = -1;
			while (!validDestinationAirport && destIterations < possibleDestinations.length) {
				destIterations++;
				destinationAirport =
					possibleDestinations[
						(seed.scenarioSeed * (destIterations + 1)) % possibleDestinations.length
					];
					console.log(destinationAirport);

				if (startAirportIsControlled && destinationAirport.type != 3) {
					validDestinationAirport = true;
				} else if (
					!startAirportIsControlled &&
					(destinationAirport.type == 3 || destinationAirport.type == 9)
				) {
					validDestinationAirport = true;
				}
			}
			if (destIterations >= possibleDestinations.length) {
				validRoute = false;
				continue;
			}

			// Get all airspace along the route
			const route = [
				startAirport.geometry.coordinates,
				chosenMATZ.getClosestPointOnEdge(startAirport.geometry.coordinates),
				chosenMATZ.getClosestPointOnEdge(destinationAirport.geometry.coordinates),
				destinationAirport.geometry.coordinates
			];
			onRouteAirspace = [];
			for (let i = 0; i < nearbyATZs.length; i++) {
				const atz = nearbyATZs[i];
				if (atz.isIncludedInRoute(route) && onRouteAirspace.indexOf(atz) == -1) {
					if (atz.type == 14) {
						validRoute = false;
						break;
					}
					if (atz != chosenMATZ) onRouteAirspace.push(atz);
				}
			}
		}

		if (iterations >= maxIterations || chosenMATZ == undefined || startAirport == undefined) {
			throw new Error('Could not find a valid route');
		}

		const startWaypoint: Waypoint = new Waypoint(
			WaypointType.Aerodrome,
			startAirport.geometry.coordinates,
			startAirport.name,
			0
		);

		const enterMATZWaypoint: Waypoint = new Waypoint(
			WaypointType.NewAirspace,
			chosenMATZ.getClosestPointOnEdge(startAirport.geometry.coordinates),
			chosenMATZ.getName() + ' Entry',
			0
		);

		const exitMATZWaypoint: Waypoint = new Waypoint(
			WaypointType.NewAirspace,
			chosenMATZ.getClosestPointOnEdge(destinationAirport.geometry.coordinates),
			chosenMATZ.getName() + ' Exit',
			0
		);

		const endWaypoint: Waypoint = new Waypoint(
			WaypointType.Aerodrome,
			destinationAirport.geometry.coordinates,
			destinationAirport.name,
			0
		);

		return [
			startWaypoint,
			enterMATZWaypoint,
			exitMATZWaypoint,
			endWaypoint,
			chosenMATZ,
			...onRouteAirspace
		];
	}
}
