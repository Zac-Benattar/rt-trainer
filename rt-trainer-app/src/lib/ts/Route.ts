import {
	CurrentRoutePointIndexStore,
	EndPointIndexStore,
	GenerationParametersStore,
	NullRouteStore,
	RouteStore,
	StartPointIndexStore
} from '$lib/stores';
import axios from 'axios';
import type { GenerationParameters, ServerResponse } from './ServerClientTypes';
import type RadioCall from './RadioCall';
import { Waypoint } from './AeronauticalClasses/Waypoint';
import RoutePoint from './RoutePoints';
import ATZ from './AeronauticalClasses/ATZ';
import { Type } from 'class-transformer';
import type { Airport } from './AeronauticalClasses/Airport';
import Seed from './Seed';

/* Route generated for a scenario. */
export default class Route {
	@Type(() => Seed)
	seed: Seed;

	@Type(() => RoutePoint)
	routePoints: RoutePoint[] = [];

	@Type(() => ATZ)
	atzs: ATZ[] = [];

	@Type(() => Waypoint)
	waypoints: Waypoint[] = [];
	currentPointIndex: number = 0;

	constructor(
		seed: Seed,
		points: RoutePoint[],
		atzs: ATZ[],
		waypoints: Waypoint[],
		currentPointIndex?: number
	) {
		this.seed = seed;
		this.routePoints = points;
		this.atzs = atzs;
		this.waypoints = waypoints;
		if (currentPointIndex !== undefined) {
			this.currentPointIndex = currentPointIndex;
		}
	}

	public getCurrentPoint(): RoutePoint {
		return this.routePoints[this.currentPointIndex];
	}

	public getPoints(): RoutePoint[] {
		return this.routePoints;
	}

	public getStartPoint(): RoutePoint {
		return this.routePoints[0];
	}

	public getEndPoint(): RoutePoint {
		return this.routePoints[this.routePoints.length - 1];
	}

	public getStartAirport(): Airport {
		throw new Error('Unimplemented function');
	}

	public getEndAirport(): Airport {
		throw new Error('Unimplemented function')
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
			EndPointIndexStore.set(serverRouteResponse.routePoints.length - 1);
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
export async function getRouteFromServer(): Promise<Route | undefined> {
	try {
		const response = await axios.get(
			`/scenario/seed=${generationParameters.seed.seedString}/route?airborneWaypoints=${generationParameters.airborneWaypoints}&hasEmergency=${generationParameters.hasEmergency}`
		);

		return response.data;
	} catch (error: unknown) {
		if (error.message === 'Network Error') {
			NullRouteStore.set(true);
		} else {
			console.log('Error: ', error);
		}
	}
}

// For testing
export async function initiateRouteV2(): Promise<void> {
	try {
		const response = await axios.get(
			`/routegentest/seed=${generationParameters.seed.seedString}?hasEmergency=${generationParameters.hasEmergency}`
		);

		if (response.data === undefined) {
			NullRouteStore.set(true);
		} else {
			ResetCurrentRoutePointIndex();
			RouteStore.set(response.data);
	
			// By default end point index is set to -1 to indicate the user has not set the end of the route in the url
			// So we need to set it to the last point in the route if it has not been set
			if (endPointIndex == -1) {
				EndPointIndexStore.set(response.data.routePoints.length - 1);
			}
		}
	} catch (error: unknown) {
		if (error.message === 'Network Error') {
			NullRouteStore.set(true);
		} else {
			console.log('Error: ', error);
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
				data: radioCall
			}
		);

		return response.data;
	} catch (error) {
		console.error('Error: ', error);
	}
}
