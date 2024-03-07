import Waypoint, { WaypointType } from './AeronauticalClasses/Waypoint';
import type Airspace from './AeronauticalClasses/Airspace';
import { simpleHash } from './utils';
import type Airport from './AeronauticalClasses/Airport';
import {
	airportDataToAirport,
	airspaceDataToAirspace,
	pushAirportDataToDatabase,
	pushAirspaceDataToDatabase,
	readAirportDataFromDB,
	readAirportDataFromJSON,
	readAirspaceDataFromDB,
	readAirspaceDataFromJSON,
	writeDataToJSON
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
			if (airspace.lowerLimit < 30) allAirspaces.push(airspace);
		}

		console.log(
			`Total Airports: ${allValidAirports.length} \n Total Airspaces: ${allAirspaces.length}`
		);

		const maxIterations = 100;
		const numberOfValidAirports = allValidAirports.length;
		let startAirport: Airport | undefined;
		let startAirportIsControlled: boolean = false;
		let destinationAirport;
		let chosenMATZ: Airspace;
		let pointInMATZ: [number, number];
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

			// Get all valid MATZ from within 40km of start airport and not inside the ATZ of the start airport
			const nearbyMATZs: Airspace[] = allAirspaces.filter(
				(x) =>
					x.type == 14 &&
					turf.distance(startAirport.coordinates, x.centrePoint, { units: 'kilometers' }) < 40 &&
					!x.pointInsideATZ((startAirport as Airport).coordinates)
			);
			if (nearbyMATZs.length == 0) {
				validRoute = false;
				continue;
			}

			// Choose a MATZ to fly through
			const numberOfMATZs = nearbyMATZs.length;
			chosenMATZ = nearbyMATZs[(seed * 7919 * (iterations + 1)) % numberOfMATZs];

			if (chosenMATZ.pointInsideATZ(startAirport.coordinates)) {
				validRoute = false;
				continue;
			}

			// Get airports within 100km of the chosen MATZ
			const possibleDestinations = [];

			// Turn this into a filter
			for (let i = 0; i < allValidAirports.length; i++) {
				const airport = allValidAirports[i];
				const distance = turf.distance(chosenMATZ.centrePoint, airport.coordinates, {
					units: 'kilometers'
				});

				if (
					(airport.type == 0 || airport.type == 2 || airport.type == 3 || airport.type == 9) &&
					distance < 100
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

				if (!chosenMATZ.pointInsideATZ(destinationAirport.coordinates)) {
					if (
						startAirportIsControlled &&
						destinationAirport.type != 3 &&
						startAirport != destinationAirport
					) {
						validDestinationAirport = true;
					} else if (
						!startAirportIsControlled &&
						(destinationAirport.type == 3 || destinationAirport.type == 9) &&
						startAirport != destinationAirport
					) {
						validDestinationAirport = true;
					}
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

			pointInMATZ = turf.pointOnFeature(turf.polygon(chosenMATZ.coordinates)).geometry
				.coordinates as [number, number];

			// Get all airspace along the route
			const route: [number, number][] = [
				startAirport.coordinates,
				pointInMATZ,
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

			if (onRouteAirspace.length > 4) {
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
			startAirport.coordinates,
			WaypointType.Aerodrome,
			1,
			undefined
		);

		if (pointInMATZ == undefined || pointInMATZ == null) throw new Error('Matz point is undefined');
		const matzWaypoint: Waypoint = new Waypoint(
			chosenMATZ.getDisplayName(),
			pointInMATZ,
			WaypointType.NewAirspace,
			2,
			undefined
		);

		if (destinationAirport == undefined) throw new Error('Destination airport is undefined');
		const endWaypoint: Waypoint = new Waypoint(
			destinationAirport?.name,
			destinationAirport.coordinates,
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

	public static async getAirspacesOnRouteFromWaypoints(waypoints: Waypoint[]): Promise<Airspace[]> {
		const airspacesData: AirspaceData[] = readAirspaceDataFromJSON();

		const allAirspaces: Airspace[] = [];
		for (let i = 0; i < airspacesData.length; i++) {
			const airspace: Airspace = airspaceDataToAirspace(airspacesData[i]);
			allAirspaces.push(airspace);
		}

		const route: [number, number][] = [];
		for (let i = 0; i < waypoints.length; i++) {
			route.push(waypoints[i].location);
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
