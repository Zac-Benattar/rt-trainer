import axios from 'axios';
import type Seed from './Seed';
import { WaypointType, Waypoint } from './Waypoint';
import type RouteElement from './RouteElement';
import MATZ from './MATZ';
import ATZ from './ATZ';
import { haversineDistance } from './utils';

// TODO
export default class RouteGenerator {
	public static async getRouteWaypoints(
		seed: Seed,
		airborneWaypoints: number
	): Promise<RouteElement[]> {
		// Hard coded localhost port because axios doesnt resolve port properly on server
		const airportsResponse = await axios.get('http://localhost:5173/api/ukairports');
		const airports = airportsResponse.data.filter(x => x.type == 0 || x.type == 2 || x.type == 9);
		const numberOfAirports = airports.length;
		let startAirport: any;
		let destinationAirport: any;
		let chosenMATZ: ATZ;

		let validRoute = false;
		let iterations = 0;

		console.log('seed:', seed.scenarioSeed);

		while (!validRoute && iterations < 20) {
			iterations++;
			console.log('iteration: ', iterations);
			validRoute = true;

			// Get start airport. Based on seed times a prime times iterations + 1 to get different start airports each iteration
			startAirport = airports[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfAirports];

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
				nearbyATZs.push(new ATZ(atz.name, atz.geometry.coordinates[0],atz.type, atz.height));
			}

			// Get all MATZ from nearby ATZs
			const nearbyMATZs: ATZ[] = nearbyATZs.filter(x => x.type == 14);
			if (nearbyMATZs == undefined || nearbyMATZs == null || nearbyMATZs.length == 0) {
				validRoute = false;
				continue;
			}

			// Choose a MATZ to fly through
			const numberOfMATZs = nearbyMATZs.length;
			chosenMATZ = nearbyMATZs[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfMATZs];

			// Choose a destination airport within 50km of the chosen MATZ
			const possibleDestinations: any[] = [];
			for (let i = 0; i < airports.length; i++) {
				const airport = airports[i];
				const distance = haversineDistance(
					airport.geometry.coordinates[1],
					airport.geometry.coordinates[0],
					chosenMATZ.getCoords()[0][1],
					chosenMATZ.getCoords()[0][0]
				)
				// console.log('matz coords', chosenMATZ.getCoords()[0]);
				// console.log('destination airport coords', airport.geometry.coordinates);
				// console.log('distance: ', distance);
				if (distance < 80000) {
					possibleDestinations.push(airport);
				}
			}

			if (possibleDestinations.length == 0) {
				validRoute = false;
				continue;
			}

			// Choose a destination airport
			destinationAirport =
				possibleDestinations[(seed.scenarioSeed * 7867 * (iterations + 1)) % possibleDestinations.length];
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

		const matz = new MATZ(chosenMATZ.getName(), chosenMATZ.getCoords());

		const enterMATZWaypoint: Waypoint = new Waypoint(
			WaypointType.NewAirspace,
			matz.getClosestPointOnEdge(startWaypoint.getWaypointCoords()),
			chosenMATZ.getName(),
			0
		);

		const endWaypoint: Waypoint = new Waypoint(
			WaypointType.Aerodrome,
			destinationAirport.geometry.coordinates,
			destinationAirport.name,
			0
		);

		return [startWaypoint, enterMATZWaypoint, matz, endWaypoint];
	}
}
