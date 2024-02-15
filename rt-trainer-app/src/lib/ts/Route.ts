import {
	haversineDistance
} from './utils';
import type Seed from './Seed';
import {
	CurrentRoutePointIndexStore,
	EndPointIndexStore,
	GenerationParametersStore,
	NullRouteStore,
	RouteElementStore,
	RouteStore,
	StartPointIndexStore
} from '$lib/stores';
import axios from 'axios';
import type { GenerationParameters, ServerResponse } from './ServerClientTypes';
import type RadioCall from './RadioCall';
import { Waypoint, WaypointType } from './AeronauticalClasses/Waypoint';

const MAX_AERODROME_DISTANCE = 150000; // 150km
const MAX_ROUTE_DISTANCE = 200000; // 200km
const MAX_AIRBORNE_ROUTE_POINTS = 15;
const AIRCRAFT_AVERAGE_SPEED = 125; // knots
const NAUTICAL_MILE = 1852;
const FLIGHT_TIME_MULTIPLIER = 1.3;

/* Route generated for a scenario. */
export default class Route {
	protected points: RoutePoint[] = [];
	protected currentPointIndex: number = 0;

	public getCurrentPoint(): RoutePoint {
		return this.points[this.currentPointIndex];
	}

	public static getAirborneWaypoints(seed: Seed, numAirborneWaypoints: number): Waypoint[] {
		const startAerodrome: ControlledAerodrome | UncontrolledAerodrome =
			Route.getStartAerodrome(seed);
		const takeoffTime = startAerodrome.getTakeoffTime();
		const takeOffRunwayPosition = startAerodrome.getTakeoffRunway().getCenterPoint();
		const endAerodrome: ControlledAerodrome | UncontrolledAerodrome = Route.getEndAerodrome(seed);
		const landingRunwayPosition = endAerodrome.getLandingRunway().getCenterPoint();

		// Limit the number of airborne waypoints to save compute
		if (numAirborneWaypoints > MAX_AIRBORNE_ROUTE_POINTS) {
			numAirborneWaypoints = MAX_AIRBORNE_ROUTE_POINTS;
		}

		let iterations = 0;
		const maxIterations = 1000;
		// Try many combinations of waypoints until a valid route is found
		for (let i = 0; i < maxIterations; i++) {
			const waypoints: Waypoint[] = [];
			// Push the start aerodrome to points in order to calculate the distance from it
			waypoints.push(
				new Waypoint(
					WaypointType.Aerodrome,
					takeOffRunwayPosition,
					'startAerodrome',
					takeoffTime
				)
			);
			let totalDistance = 0.0;

			// Add waypoints until the route is too long or contains too many points
			for (let j = 1; j < numAirborneWaypoints + 1; j++) {
				const waypoint = VRPs[(seed.scenarioSeed * j * (i + 1)) % VRPs.length];

				// Prevent same waypoint coming up multiple times
				if (waypoints.findIndex((x) => x === waypoint) != -1) break;

				const distance = haversineDistance(
					waypoints[waypoints.length - 1].lat,
					waypoints[waypoints.length - 1].long,
					waypoint.lat,
					waypoint.long
				);

				// If route is too long or contains too many points, stop adding points
				if (
					waypoints.length - 1 >= numAirborneWaypoints ||
					totalDistance + distance >
						MAX_ROUTE_DISTANCE -
							haversineDistance(
								waypoint.lat,
								waypoint.long,
								landingRunwayPosition.lat,
								landingRunwayPosition.long
							)
				) {
					break;
				}

				// Route valid with this waypoint - calculate arrival time and add it
				// Previous arrival time + distance in nautical miles / airspeed * 60 mins * 1.3
				const arrivalTime = Math.round(
					waypoints[waypoints.length - 1].arrivalTime +
						(distance / NAUTICAL_MILE / AIRCRAFT_AVERAGE_SPEED) * 60 * FLIGHT_TIME_MULTIPLIER
				);

				waypoint.arrivalTime = arrivalTime;
				waypoints.push(waypoint);
				totalDistance += distance;
			}

			// Suitable route found
			if (waypoints.length > 1 && waypoints.length - 1 >= numAirborneWaypoints) {
				// Remove the start aerodrome
				waypoints.shift();

				console.log('Route generated in: ' + (iterations + 1) + ' iterations');
				return waypoints;
			}

			// No suitable route found - try again
			iterations++;
		}

		// No suitable route found after max iterations - unrecoverable error
		throw new Error('No suitable route found in ' + maxIterations + ' iterations');
	}

	public getPoints(): RoutePoint[] {
		return this.points;
	}

	public getStartPoint(): RoutePoint {
		return this.points[0];
	}

	public getEndPoint(): RoutePoint {
		return this.points[this.points.length - 1];
	}

	public static getRouteWaypoints(seed: Seed, numAirborneWaypoints: number): Waypoint[] {
		const waypoints: Waypoint[] = [];
		const startAerodrome = Route.getStartAerodrome(seed);
		const takeoffTime = startAerodrome.getTakeoffTime();
		const startAerodromeRunwayCenterPoint = startAerodrome.getTakeoffRunway().getCenterPoint();
		const endAerodrome = Route.getEndAerodrome(seed);
		const endAerodromeRunwayCenterPoint = endAerodrome.getLandingRunway().getCenterPoint();

		waypoints.push(new Waypoint(WaypointType.Aerodrome, startAerodromeRunwayCenterPoint.lat, startAerodromeRunwayCenterPoint.long, startAerodrome.getShortName(), takeoffTime));

		waypoints.push(...Route.getAirborneWaypoints(seed, numAirborneWaypoints));

		const distanceToLandingRunway = haversineDistance(
			waypoints[waypoints.length - 1].lat,
			waypoints[waypoints.length - 1].long,
			endAerodromeRunwayCenterPoint.lat,
			endAerodromeRunwayCenterPoint.long
		);
		const arrivalTime = Math.round(
			waypoints[waypoints.length - 1].arrivalTime +
				(distanceToLandingRunway / NAUTICAL_MILE / AIRCRAFT_AVERAGE_SPEED) *
					60 *
					FLIGHT_TIME_MULTIPLIER
		);

		waypoints.push(new Waypoint(WaypointType.Aerodrome, endAerodromeRunwayCenterPoint.lat, endAerodromeRunwayCenterPoint.long, endAerodrome.getShortName(), arrivalTime));

		return waypoints;
	}
}

let startPointIndex = 0;
StartPointIndexStore.subscribe((value) => {
	startPointIndex = value;
});
let endPointIndex = 0;
EndPointIndexStore.subscribe((value) => {
	endPointIndex = value;
});
let generationParameters: GenerationParameters;
GenerationParametersStore.subscribe((value) => {
	generationParameters = value;
});
let routeGenerated = false;
NullRouteStore.subscribe((value) => {
	routeGenerated = !value;
});

export function ResetCurrentRoutePointIndex(): void {
	CurrentRoutePointIndexStore.set(startPointIndex);
}

/**
 * Initiates the scenario
 *
 * @remarks
 * This function initiates the scenario by getting the route and waypoints from the server.
 *
 * @returns void
 */
export async function initiateScenario(): Promise<void> {
	// Get the state from the server
	const serverRouteResponse = await getRouteFromServer();
	const serverWaypointsResponse = await getWaypointsFromServer();

	if (serverRouteResponse === undefined || serverWaypointsResponse === undefined) {
		// Handle error
		NullRouteStore.set(true);

		return;
	} else {
		console.log(serverRouteResponse);
		console.log(serverWaypointsResponse);

		// Update stores with the route
		ResetCurrentRoutePointIndex();
		RouteStore.set(serverRouteResponse);

		// By default end point index is set to -1 to indicate the user has not set the end of the route in the url
		// So we need to set it to the last point in the route if it has not been set
		if (endPointIndex == -1) {
			EndPointIndexStore.set(serverRouteResponse.length - 1);
		}
	}
}

/**
 * Gets the route from the server
 *
 * @remarks
 * This function gets the route from the server.
 *
 * @returns Promise<RoutePoint[] | undefined>
 */
export async function getRouteFromServer(): Promise<RoutePoint[] | undefined> {
	try {
		const response = await axios.get(
			`/scenario/seed=${generationParameters.seed.seedString}/route?airborneWaypoints=${generationParameters.airborneWaypoints}&hasEmergency=${generationParameters.hasEmergency}`
		);

		return response.data;
	} catch (error: unknown) {
		if (error.message === 'Network Error') {
			NullRouteStore.set(true);
		} else {
			console.error('Error: ', error);
		}
	}
}

// For testing
export async function initiateRouteV2(): Promise<void> {
	try {
		const response = await axios.get(
			`/routetest/seed=${generationParameters.seed.seedString}?airborneWaypoints=${generationParameters.airborneWaypoints}&hasEmergency=${generationParameters.hasEmergency}`
		);

		if (response.data === undefined) {
			NullRouteStore.set(true);
		} else {
			console.log(response.data);
			RouteElementStore.set(response.data);
		}
	} catch (error: unknown) {
		if (error.message === 'Network Error') {
			NullRouteStore.set(true);
		} else {
			console.error('Error: ', error);
		}
	}
}

/**
 * Gets the waypoints from the server
 *
 * @remarks
 * This function gets the waypoints from the server.
 *
 * @returns Promise<Waypoint[] | undefined>
 */
export async function getWaypointsFromServer(): Promise<Waypoint[] | undefined> {
	try {
		const response = await axios.get(
			`/scenario/seed=${generationParameters.seed.seedString}/waypoints?airborneWaypoints=${generationParameters.airborneWaypoints}&hasEmergency=${generationParameters.hasEmergency}`
		);

		return response.data;
	} catch (error: unknown) {
		if (error.message === 'Network Error') {
			NullRouteStore.set(true);
		} else {
			console.error('Error: ', error);
		}
	}
}

/**
 * Checks the radio call by the server
 *
 * @remarks
 * This function checks the radio call by the server.
 *
 * @returns Promise<ServerResponse | undefined>
 */
export async function checkRadioCallByServer(
	radioCall: RadioCall
): Promise<ServerResponse | undefined> {
	if (!routeGenerated) {
		console.log('Error: No route');
		return;
	}
	try {
		const response = await axios.post(
			`/scenario/seed=${generationParameters.seed.scenarioSeed}/parse`,
			{
				data: radioCall.getJSONData()
			}
		);

		return response.data;
	} catch (error) {
		console.error('Error: ', error);
	}
}
