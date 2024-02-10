import axios from 'axios';
import { WaypointType, type Waypoint } from './RouteTypes';
import type Seed from './Seed';

// TODO
export default class RouteGenerator {
	public static async getRouteWaypoints(
		seed: Seed,
		airborneWaypoints: number
	): Promise<Waypoint[]> {
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
			startAirport =
				airports[(seed.scenarioSeed * 7919 * (iterations + 1)) % numberOfAirports];

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

		const startWaypoint: Waypoint = {
			waypointType: WaypointType.Aerodrome,
			lat: startAirport.geometry.coordinates[1],
			long: startAirport.geometry.coordinates[0],
			name: startAirport.name,
			arrivalTime: 0
		};

        const matzWaypoint: Waypoint = {
            waypointType: WaypointType.NewAirspace,
            lat: chosenMATZ.geometry.coordinates[0][0][1],
            long: chosenMATZ.geometry.coordinates[0][0][0],
            name: chosenMATZ.name,
            arrivalTime: 0
        };

		return [startWaypoint, matzWaypoint];
	}
}
