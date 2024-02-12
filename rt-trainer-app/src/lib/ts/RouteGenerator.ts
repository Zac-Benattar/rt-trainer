import axios from 'axios';
import type Seed from './Seed';
import { WaypointType, Waypoint } from './Waypoint';
import type RouteElement from './RouteElement';
import ATZ from './ATZ';
import { getPolygonCenter, haversineDistance } from './utils';
import type { AirportData } from './Airport';
import { db } from '$lib/db/db';
import { checkSystemHealth, getAllUKAirportReportingPoints, getAllUKAirports, getAllUKAirspace } from './OpenAIPHandler';
import { fail } from '@sveltejs/kit';
import { airport, airportReportingPoint, airspace } from '$lib/db/schema';

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

	public static async updateDatabaseWithNewOpenAIPData() {
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
			await db.insert(airport).values({ json: airportsData[i] });
		}

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
			await db.insert(airspace).values({ json: airspaceData[i] });
		}

		/**
		 * Clear airspace table
		 */
		await db.delete(airspace);

		/**
		 * Fetch all UK airspace
		 */
		const airportReportingPointsData = await getAllUKAirportReportingPoints();

		/**
		 * Add airspace to database
		 */
		for (let i = 0; i < airportReportingPointsData.length; i++) {
			await db.insert(airportReportingPoint).values({ json: airportReportingPointsData[i] });
		}

		console.log("Sucessfully updated OpenAIP data");

		return true;
	}

	public static async getRouteWaypoints(seed: Seed): Promise<RouteElement[]> {
		// Ensure database data is up to date - can be moved to somewhere it is run less for even faster responses
		// Currently going to slow down all route gen methods a decent amount, please move
		if (!this.checkOpenAIPDataUpToDate()) {
			this.updateDatabaseWithNewOpenAIPData();
		}

		// Fetch all airports from the database
		const airportsResponse = await axios.get('http://localhost:5173/api/ukairports');

		// Add valid (correct type) airports to list of valid airports for takeoff/landing
		const validAirports: AirportData[] = [];
		for (let i = 0; i < airportsResponse.data.length; i++) {
			const airport = airportsResponse.data[i].json;
			if (airport.type == 0 || airport.type == 2 || airport.type == 3 || airport.type == 9)
				validAirports.push(airport);
		}

		const numberOfValidAirports = validAirports.length;
		let startAirport: AirportData;
		let startAirportIsControlled: boolean = false;
		let destinationAirport: AirportData;
		let chosenMATZ: ATZ;
		let onRouteAirspace: ATZ[] = [];

		let validRoute = false;
		let iterations = 0;

		while (!validRoute && iterations < 20) {
			iterations++;
			console.log('iteration: ', iterations);
			validRoute = true;

			// Get start airport. Based on seed times a prime times iterations + 1 to get different start airports each iteration
			startAirport =
				validAirports[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfValidAirports];
			if (startAirport.type == 3) {
				startAirportIsControlled = true;
			}

			// Get all MATZ within 20km of the start airport
			const nearbyATZsResponse = await axios.get(
				'http://localhost:5173/api/airspacesnearcoords?lat=' +
					startAirport.geometry.coordinates[1] +
					'&long=' +
					startAirport.geometry.coordinates[0] +
					'&radius=20000'
			);
			if (nearbyATZsResponse.data == undefined || nearbyATZsResponse.data.length == 0) {
				validRoute = false;
				continue;
			}

			const nearbyATZs: ATZ[] = [];
			for (let i = 0; i < nearbyATZsResponse.data.length; i++) {
				const atz = nearbyATZsResponse.data[i];
				nearbyATZs.push(new ATZ(atz.name, atz.geometry.coordinates[0], atz.type, atz.height));
			}

			// Get all MATZ from nearby ATZs
			const nearbyMATZs: ATZ[] = nearbyATZs.filter((x) => x.type == 14);
			if (nearbyMATZs == undefined || nearbyMATZs == null || nearbyMATZs.length == 0) {
				validRoute = false;
				continue;
			}

			// Choose a MATZ to fly through
			const numberOfMATZs = nearbyMATZs.length;
			chosenMATZ = nearbyMATZs[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfMATZs];

			// Get airports within 50km of the chosen MATZ
			const possibleDestinations: AirportData[] = [];
			const matzCenter = getPolygonCenter(chosenMATZ.getCoords());
			for (let i = 0; i < validAirports.length; i++) {
				const airport = validAirports[i];
				if (chosenMATZ.pointInsideATZ(airport.geometry.coordinates)) {
					continue;
				}
				const distance = haversineDistance(
					airport.geometry.coordinates[1],
					airport.geometry.coordinates[0],
					matzCenter[1],
					matzCenter[0]
				);
				if (distance < 50000) {
					possibleDestinations.push(airport);
				}
			}

			if (possibleDestinations.length == 0) {
				validRoute = false;
				continue;
			}

			// Choose a destination airport
			let validDestinationAirport: boolean = false;
			let destIterations: number = -1;
			while (!validDestinationAirport && destIterations < 200) {
				destIterations++;
				destinationAirport =
					possibleDestinations[
						(seed.scenarioSeed * (destIterations + 1)) % possibleDestinations.length
					];

				if (startAirportIsControlled && destinationAirport.type != 3) {
					validDestinationAirport = true;
				} else if (
					!startAirportIsControlled &&
					(destinationAirport.type == 3 || destinationAirport.type == 9)
				) {
					validDestinationAirport = true;
				}
			}
			if (destIterations >= 200) {
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
				if (
					atz.isIncludedInRoute(route) &&
					atz != chosenMATZ &&
					onRouteAirspace.indexOf(atz) == -1
				) {
					if (atz.type == 14) {
						validRoute = false;
						break;
					}
					onRouteAirspace.push(atz);
				}
			}
		}

		if (iterations >= 20 || chosenMATZ == undefined || startAirport == undefined) {
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
			chosenMATZ.getClosestPointOnEdge(startWaypoint.getWaypointCoords()),
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
