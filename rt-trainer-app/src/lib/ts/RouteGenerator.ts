import type Seed from './Seed';
import { WaypointType, Waypoint } from './AeronauticalClasses/Waypoint';

import type Airspace from './AeronauticalClasses/Airspace';
import { haversineDistance } from './utils';
import type { Airport } from './AeronauticalClasses/Airport';
import Scenario from './Scenario';
import {
	airportDataToAirport,
	airspaceDataToAirspace,
	readDataFromJSON,
	writeDataToJSON
} from './OpenAIPHandler';
import type { AirportData, AirspaceData } from './AeronauticalClasses/OpenAIPTypes';

// TODO
export default class RouteGenerator {
	public static async getRoute(seed: Seed): Promise<Scenario> {
		const AIRCRAFT_AVERAGE_SPEED = 125; // knots
		const NAUTICAL_MILE = 1852;
		const FLIGHT_TIME_MULTIPLIER = 1.3;
		let airportsData: AirportData[] = [];
		let airspacesData: AirspaceData[] = [];

		// // Remove for production
		// await writeDataToJSON();

		// Load data
		[airportsData, airspacesData] = await readDataFromJSON();

		// Add airports to list of valid airports for takeoff/landing
		const allAirports: Airport[] = [];
		for (let i = 0; i < airportsData.length; i++) {
			const airport: Airport = airportDataToAirport(airportsData[i]);
			allAirports.push(airport);
		}

		// Add airspaces to list of valid airspaces for route
		const allAirspaces: Airspace[] = [];
		for (let i = 0; i < airspacesData.length; i++) {
			const airspace: Airspace = airspaceDataToAirspace(airspacesData[i]);
			allAirspaces.push(airspace);
		}

		console.log(`Total Airports: ${allAirports.length} \n Total Airspaces: ${allAirspaces.length}`);

		const maxIterations = 200;
		const numberOfValidAirports = allAirports.length;
		let startAirport: Airport | undefined;
		let startAirportIsControlled: boolean = false;
		let destinationAirport;
		let chosenMATZ: Airspace;
		let matzEntry: [number, number] | undefined | null;
		let matzExit: [number, number] | undefined | null;
		let onRouteAirspace: Airspace[] = [];

		let validRoute = false;
		let iterations = 0;

		while (!validRoute && iterations < maxIterations) {
			iterations++;
			console.log('iteration: ', iterations);
			validRoute = true;

			// Get start airport. Based on seed times a prime times iterations + 1 to get different start airports each iteration
			startAirport =
				allAirports[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfValidAirports];
			if (startAirport.type == 3 || startAirport.type == 9) {
				startAirportIsControlled = true;
			}

			// Get all ATZ within 30km of the start airport
			const nearbyATZs: Airspace[] = [];
			for (let i = 0; i < allAirspaces.length; i++) {
				const distance = haversineDistance(
					startAirport.coordinates[0],
					startAirport.coordinates[1],
					allAirspaces[i].centrePoint[0],
					allAirspaces[i].centrePoint[1]
				);
				if (distance < 30000) nearbyATZs.push(allAirspaces[i]);
			}

			// Get all valid MATZ from nearby ATZs
			const nearbyMATZs: Airspace[] = nearbyATZs.filter(
				(x) => x.type == 14 && !x.pointInsideATZ(startAirport.coordinates)
			);
			if (nearbyMATZs.length == 0) {
				validRoute = false;
				continue;
			}

			// Choose a MATZ to fly through
			const numberOfMATZs = nearbyMATZs.length;
			chosenMATZ = nearbyMATZs[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfMATZs];

			// This doesn't work - seed 4324 has an issue
			if (chosenMATZ.pointInsideATZ(startAirport.coordinates)) {
				validRoute = false;
				continue;
			}

			// Get airports within 50km of the chosen MATZ
			const possibleDestinations = [];
			const matzCenter = chosenMATZ.centrePoint;

			for (let i = 0; i < allAirports.length; i++) {
				const airport = allAirports[i];
				const distance = haversineDistance(
					matzCenter[0],
					matzCenter[1],
					airport.coordinates[0],
					airport.coordinates[1]
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
				// console.log(destinationAirport);

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

			matzEntry = chosenMATZ.getClosestPointOnEdge(startAirport.coordinates);
			matzExit = chosenMATZ.getClosestPointOnEdge(destinationAirport.coordinates);
			if (matzEntry == undefined || matzExit == undefined || matzEntry == matzExit) {
				validRoute = false;
				continue;
			}

			// Get all airspace along the route
			const route: [number, number][] = [
				startAirport.coordinates,
				matzEntry,
				matzExit,
				destinationAirport.coordinates
			];
			onRouteAirspace = [];
			for (let i = 0; i < nearbyATZs.length; i++) {
				const atz = nearbyATZs[i];
				if (atz.isIncludedInRoute(route)) {
					if (atz.type == 1 || atz.type == 14 && atz != chosenMATZ) {
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

		const arrivalTimes: number[] = [
			Math.round(
				startAirport.getTakeoffTime(seed) +
					(haversineDistance(
						startAirport.coordinates[0],
						startAirport.coordinates[1],
						matzEntry[0],
						matzEntry[1]
					) /
						NAUTICAL_MILE /
						AIRCRAFT_AVERAGE_SPEED) *
						60 *
						FLIGHT_TIME_MULTIPLIER
			),
			Math.round(
				startAirport.getTakeoffTime(seed) +
					(haversineDistance(matzEntry[0], matzEntry[1], matzExit[0], matzExit[1]) /
						NAUTICAL_MILE /
						AIRCRAFT_AVERAGE_SPEED) *
						60 *
						FLIGHT_TIME_MULTIPLIER
			),
			Math.round(
				startAirport.getTakeoffTime(seed) +
					(haversineDistance(
						destinationAirport.coordinates[0],
						destinationAirport.coordinates[1],
						matzExit[0],
						matzExit[1]
					) /
						NAUTICAL_MILE /
						AIRCRAFT_AVERAGE_SPEED) *
						60 *
						FLIGHT_TIME_MULTIPLIER
			)
		];

		const startWaypoint: Waypoint = new Waypoint(
			startAirport.name,
			startAirport.coordinates[0],
			startAirport.coordinates[1],
			WaypointType.Aerodrome,
			1,
			undefined,
			startAirport.getTakeoffTime(seed)
		);

		if (matzEntry == undefined || matzEntry == null) throw new Error('Entry point is undefined');
		const enterMATZWaypoint: Waypoint = new Waypoint(
			chosenMATZ.getDisplayName() + ' Entry',
			matzEntry[0],
			matzEntry[1],
			WaypointType.NewAirspace,
			2,
			undefined,
			arrivalTimes[0]
		);

		if (matzExit == undefined || matzExit == null) throw new Error('Exit point is undefined');
		const exitMATZWaypoint: Waypoint = new Waypoint(
			chosenMATZ.getDisplayName() + ' Exit',
			matzExit[0],
			matzExit[1],
			WaypointType.NewAirspace,
			3,
			undefined,
			arrivalTimes[1]
		);

		if (destinationAirport == undefined) throw new Error('Destination airport is undefined');
		const endWaypoint: Waypoint = new Waypoint(
			destinationAirport?.name,
			destinationAirport.coordinates[0],
			destinationAirport.coordinates[1],
			WaypointType.Aerodrome,
			4,
			undefined,
			arrivalTimes[2]
		);

		return new Scenario(
			seed,
			[],
			[chosenMATZ, ...onRouteAirspace],
			[startWaypoint, enterMATZWaypoint, exitMATZWaypoint, endWaypoint]
		);
	}
}
