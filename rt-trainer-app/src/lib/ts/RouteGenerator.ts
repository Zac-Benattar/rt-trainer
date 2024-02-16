import type Seed from './Seed';
import { WaypointType, Waypoint } from './AeronauticalClasses/Waypoint';

import ATZ from './AeronauticalClasses/ATZ';
import { haversineDistance } from './utils';
import { plainToInstance } from 'class-transformer';
import { Airport } from './AeronauticalClasses/Airport';
import Route from './Route';

// TODO
export default class RouteGenerator {
	public static async getRoute(seed: Seed): Promise<Route> {
		const AIRCRAFT_AVERAGE_SPEED = 125; // knots
		const NAUTICAL_MILE = 1852;
		const FLIGHT_TIME_MULTIPLIER = 1.3;

		// Load airports from json file

		// Add airports to list of valid airports for takeoff/landing
		const allAirports: Airport[] = [];
		for (let i = 0; i < airportsResponse.data.length; i++) {
			const airport: unknown = airportsResponse.data[i];
			allAirports.push(plainToInstance(Airport, airport));
		}

		// Load airspaces from json file

		// Add airspaces to list of valid airspaces for route
		const allAirspaces: ATZ[] = [];
		for (let i = 0; i < airspacesResponse.data.length; i++) {
			const airspace: unknown = airspacesResponse.data[i];
			allAirspaces.push(plainToInstance(ATZ, airspace));
		}

		console.log(`Total Airports: ${allAirports.length} \n Total Airspaces: ${allAirspaces.length}`);

		const maxIterations = 20;
		const numberOfValidAirports = allAirports.length;
		let startAirport: Airport | undefined;
		let startAirportIsControlled: boolean = false;
		let destinationAirport;
		let chosenMATZ: ATZ;
		let matzEntry: [number, number] | undefined | null;
		let matzExit: [number, number] | undefined | null;
		let onRouteAirspace: ATZ[] = [];

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
			const nearbyATZs: ATZ[] = [];
			for (let i = 0; i < allAirspaces.length; i++) {
				const distance = haversineDistance(
					startAirport.coordinates[0],
					startAirport.coordinates[1],
					allAirspaces[i].centre[0],
					allAirspaces[i].centre[1]
				);
				if (distance < 30000) nearbyATZs.push(allAirspaces[i]);
			}

			// Get all valid MATZ from nearby ATZs
			const nearbyMATZs: ATZ[] = nearbyATZs.filter(
				(x) => x.type == 14 && !x.pointInsideATZ(startAirport.coordinates)
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

			for (let i = 0; i < allAirports.length; i++) {
				const airport = allAirports[i];
				const distance = haversineDistance(
					matzCenter[0],
					matzCenter[1],
					airport.coordinates[1],
					airport.coordinates[0]
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
			if (matzEntry == undefined || matzExit == undefined) {
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

		return new Route(
			seed,
			[],
			[chosenMATZ, ...onRouteAirspace],
			[startWaypoint, enterMATZWaypoint, exitMATZWaypoint, endWaypoint]
		);
	}
}
