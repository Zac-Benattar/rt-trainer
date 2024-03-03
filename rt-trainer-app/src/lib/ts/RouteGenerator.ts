import Waypoint, { WaypointType } from './AeronauticalClasses/Waypoint';
import type Airspace from './AeronauticalClasses/Airspace';
import { simpleHash } from './utils';
import type Airport from './AeronauticalClasses/Airport';
import {
	airportDataToAirport,
	airspaceDataToAirspace,
	readAirportDataFromDB,
	readAirportDataFromJSON,
	readAirspaceDataFromDB,
	readAirspaceDataFromJSON
} from './OpenAIPHandler';
import type { AirportData, AirspaceData } from './AeronauticalClasses/OpenAIPTypes';
import type { RouteData } from './Scenario';
import * as turf from '@turf/turf';

export default class RouteGenerator {
	public static async generateFRTOLRouteFromSeed(
		seedString: string
	): Promise<RouteData | undefined> {
		console.log(seedString);
		const seed = simpleHash(seedString);

		const airportsData: AirportData[] = await readAirportDataFromDB();
		const airspacesData: AirspaceData[] = await readAirspaceDataFromDB();

		// Remove for production
		// await writeDataToJSON();

		// await pushAirportDataToDatabase();
		// await pushAirspaceDataToDatabase();

		// Add airports to list of valid airports for takeoff/landing
		const allValidAirports: Airport[] = [];
		for (let i = 0; i < airportsData.length; i++) {
			const airport: Airport = airportDataToAirport(airportsData[i]);
			if (
				(airport.type == 0 || airport.type == 2 || airport.type == 3 || airport.type == 9) &&
				airport.frequencies != null &&
				airport.frequencies.findIndex((x) => x.type == 4) == -1
			)
				allValidAirports.push(airport);
		}

		// Add airspaces to list of valid airspaces for route
		const allAirspaces: Airspace[] = [];
		for (let i = 0; i < airspacesData.length; i++) {
			const airspace: Airspace = airspaceDataToAirspace(airspacesData[i]);
			allAirspaces.push(airspace);
		}

		console.log(
			`Total Airports: ${allValidAirports.length} \n Total Airspaces: ${allAirspaces.length}`
		);

		const maxIterations = 200;
		const numberOfValidAirports = allValidAirports.length;
		let startAirport: Airport | undefined;
		let startAirportIsControlled: boolean = false;
		let destinationAirport;
		let chosenMATZ: Airspace;
		let matzCenter: [number, number] | undefined | null;
		let onRouteAirspace: Airspace[] = [];

		let validRoute = false;
		let iterations = 0;

		while (!validRoute && iterations < maxIterations) {
			iterations++;
			validRoute = true;

			// Get start airport. Based on seed times a prime times iterations + 1 to get different start airports each iteration
			startAirport = allValidAirports[(seed * 7919 * (iterations + 1)) % numberOfValidAirports];
			if (startAirport.type == 3 || startAirport.type == 9) {
				startAirportIsControlled = true;
			}

			// Get all ATZ within 30km of the start airport
			const nearbyATZs: Airspace[] = [];
			for (let i = 0; i < allAirspaces.length; i++) {
				const distance = turf.distance(startAirport.coordinates, allAirspaces[i].centrePoint);
				if (distance < 30000) nearbyATZs.push(allAirspaces[i]);
			}

			// Get all valid MATZ from nearby ATZs
			const nearbyMATZs: Airspace[] = nearbyATZs.filter(
				(x) => x.type == 14 && !x.pointInsideATZ((startAirport as Airport).coordinates)
			);
			if (nearbyMATZs.length == 0) {
				validRoute = false;
				continue;
			}

			// Choose a MATZ to fly through
			const numberOfMATZs = nearbyMATZs.length;
			chosenMATZ = nearbyMATZs[(seed * 7919 * (iterations + 1)) % numberOfMATZs];

			// This doesn't work - seed 4324 has an issue
			if (chosenMATZ.pointInsideATZ(startAirport.coordinates)) {
				validRoute = false;
				continue;
			}

			// Get airports within 50km of the chosen MATZ
			const possibleDestinations = [];
			matzCenter = chosenMATZ.centrePoint;

			for (let i = 0; i < allValidAirports.length; i++) {
				const airport = allValidAirports[i];
				const distance = turf.distance(matzCenter, airport.coordinates);

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
					possibleDestinations[(seed * (destIterations + 1)) % possibleDestinations.length];

				if (startAirportIsControlled && destinationAirport.type != 3) {
					validDestinationAirport = true;
				} else if (
					!startAirportIsControlled &&
					(destinationAirport.type == 3 || destinationAirport.type == 9)
				) {
					validDestinationAirport = true;
				}
			}
			if (
				destIterations >= possibleDestinations.length ||
				destinationAirport == undefined ||
				validDestinationAirport == false
			) {
				validRoute = false;
				continue;
			}

			// Get all airspace along the route
			const route: [number, number][] = [
				startAirport.coordinates,
				matzCenter,
				destinationAirport.coordinates
			];
			onRouteAirspace = [];
			for (let i = 0; i < allAirspaces.length; i++) {
				const airspace = allAirspaces[i];
				if (airspace.isIncludedInRoute(route)) {
					if (airspace.type == 1 || (airspace.type == 14 && airspace != chosenMATZ)) {
						validRoute = false;
						break;
					}
					if (airspace != chosenMATZ) onRouteAirspace.push(airspace);
				}
			}
			onRouteAirspace.push(chosenMATZ);

			if (onRouteAirspace.length > 7) {
				validRoute = false;
				continue;
			}
		}

		if (iterations >= maxIterations || !chosenMATZ || !startAirport) {
			console.log(`Could not find a valid route after ${iterations} iterations`);
			return;
		}

		console.log('Iterations: ', iterations);

		const startWaypoint: Waypoint = new Waypoint(
			startAirport.name,
			startAirport.coordinates[0],
			startAirport.coordinates[1],
			WaypointType.Aerodrome,
			1,
			undefined
		);

		if (matzCenter == undefined || matzCenter == null) throw new Error('Exit point is undefined');
		const matzWaypoint: Waypoint = new Waypoint(
			chosenMATZ.getDisplayName() + ' Exit',
			matzCenter[0],
			matzCenter[1],
			WaypointType.NewAirspace,
			2,
			undefined
		);

		if (destinationAirport == undefined) throw new Error('Destination airport is undefined');
		const endWaypoint: Waypoint = new Waypoint(
			destinationAirport?.name,
			destinationAirport.coordinates[0],
			destinationAirport.coordinates[1],
			WaypointType.Aerodrome,
			3,
			undefined
		);

		return {
			waypoints: [startWaypoint, matzWaypoint, endWaypoint],
			airspaces: onRouteAirspace,
			airports: [startAirport, destinationAirport]
		};
	}

	public static async getAirspaceDataFromWaypointsList(waypoints: Waypoint[]): Promise<Airspace[]> {
		const airspacesData: AirspaceData[] = readAirspaceDataFromJSON();

		const allAirspaces: Airspace[] = [];
		for (let i = 0; i < airspacesData.length; i++) {
			const airspace: Airspace = airspaceDataToAirspace(airspacesData[i]);
			allAirspaces.push(airspace);
		}

		const route: [number, number][] = [];
		for (let i = 0; i < waypoints.length; i++) {
			route.push(waypoints[i].getCoords());
		}

		const onRouteAirspace: Airspace[] = [];
		for (let i = 0; i < allAirspaces.length; i++) {
			const airspace = allAirspaces[i];
			if (airspace.isIncludedInRoute(route)) {
				onRouteAirspace.push(airspace);
			}
		}

		return onRouteAirspace;
	}

	public static async getAirportDataFromWaypointsList(waypoints: Waypoint[]): Promise<Airport[]> {
		const airportsData: AirportData[] = readAirportDataFromJSON();

		const allAirports: Airport[] = [];
		for (let i = 0; i < airportsData.length; i++) {
			const airport: Airport = airportDataToAirport(airportsData[i]);
			allAirports.push(airport);
		}

		const airports: Airport[] = [];
		for (let i = 0; i < waypoints.length; i++) {
			const airport = allAirports.find((x) => x.name == waypoints[i].name);
			if (airport != undefined) airports.push(airport);
		}

		return airports;
	}
}
