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
		const startAirport = airports[seed.scenarioSeed % numberOfAirports];

		const nearbyAirspaces = await axios.get(
			'http://localhost:5173/api/airspacesnearcoords?lat=' +
				startAirport.geometry.coordinates[1] +
				'&long=' +
				startAirport.geometry.coordinates[0] +
				'&radius=50000'
		);
		console.log(nearbyAirspaces.data);

		const startWaypoint: Waypoint = {
			waypointType: WaypointType.Aerodrome,
			lat: startAirport.geometry.coordinates[1],
			long: startAirport.geometry.coordinates[0],
			name: startAirport.name,
			arrivalTime: 0
		};

		return [startWaypoint];
	}
}
