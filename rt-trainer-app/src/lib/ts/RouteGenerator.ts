import axios from 'axios';
import type Seed from './Seed';
import { WaypointType, Waypoint } from './Waypoint';
import type RouteElement from './RouteElement';
import MATZ from './MATZ';

// TODO
export default class RouteGenerator {
	public static async getRouteWaypoints(
		seed: Seed,
		airborneWaypoints: number
	): Promise<RouteElement[]> {
		// Hard coded localhost port because axios doesnt resolve port properly on server
		const airportsResponse = await axios.get('http://localhost:5173/api/ukairports');
		const airports = airportsResponse.data;
		const numberOfAirports = airports.length;
		let startAirport: any;
		let chosenMATZ: any;

		let validRoute = false;
		let iterations = 0;

		while (!validRoute) {
			iterations++;
			console.log('iterations: ', iterations);
			validRoute = true;

			// Get start airport. Based on seed times a prime times iterations + 1 to get different start airports each iteration
			startAirport = airports[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfAirports];

			// Get all MATZ within 50km of the start airport
			const nearbyMATZs = await axios.get(
				'http://localhost:5173/api/matznearcoords?lat=' +
					startAirport.geometry.coordinates[1] +
					'&long=' +
					startAirport.geometry.coordinates[0] +
					'&radius=50000'
			);

			if (nearbyMATZs.data.length == 0) {
				validRoute = false;
				continue;
			}

			// Choose a MATZ to fly through
			const numberOfMATZs = nearbyMATZs.data.length;
			chosenMATZ = nearbyMATZs.data[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfMATZs];
		}

		const startWaypoint: Waypoint = new Waypoint(
			WaypointType.Aerodrome,
			startAirport.geometry.coordinates,
			startAirport.name,
			0
		);

		const matz = new MATZ(chosenMATZ.name, chosenMATZ.geometry.coordinates[0]);

		const matzWaypoint: Waypoint = new Waypoint(WaypointType.NewAirspace, matz.getClosestPointOnEdge(startWaypoint.getWaypointCoords()), chosenMATZ.name, 0);

		return [startWaypoint, matzWaypoint, matz];
	}
}
