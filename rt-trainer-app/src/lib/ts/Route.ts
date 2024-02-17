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
import Airspace from './AeronauticalClasses/Airspace';
import { Type, plainToInstance } from 'class-transformer';
import type { Airport } from './AeronauticalClasses/Airport';
import Seed from './Seed';
import 'reflect-metadata';

/* Route generated for a scenario. */
export default class Route {
	@Type(() => Seed)
	seed: Seed;

	@Type(() => RoutePoint)
	routePoints: RoutePoint[] = [];

	@Type(() => Airspace)
	atzs: Airspace[] = [];

	@Type(() => Waypoint)
	waypoints: Waypoint[] = [];
	currentPointIndex: number = 0;

	constructor(
		seed: Seed,
		points: RoutePoint[],
		atzs: Airspace[],
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
		throw new Error('Unimplemented function');
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
let currentRouteId: number = 2;

export function ResetCurrentRoutePointIndex(): void {
	CurrentRoutePointIndexStore.set(startPointIndex);
}

/**
 * Gets the scenario from the db and loads it into the store
 *
 * @remarks
 * This function initiates the scenario by getting the route, waypoints and ATZs from the server.
 * It then updates the stores with the route, waypoints and ATZs.
 *
 * @returns Promise<void>
 */
export async function loadScenario(): Promise<void> {
	// Get the state from the server
	const response = await axios.get(`/scenario/${currentRouteId}/route`);

	if (response.data === undefined || response.data.error != undefined) {
		NullRouteStore.set(true);
	} else {
		console.log(response);

		// Update stores with the route
		ResetCurrentRoutePointIndex();
		RouteStore.set(response.data);

		// By default end point index is set to -1 to indicate the user has not set the end of the route in the url
		// So we need to set it to the last point in the route if it has not been set
		if (endPointIndex == -1) {
			EndPointIndexStore.set(response.data.routePoints.length - 1);
		}
	}
}

/**
 * Generates a route from the server
 *
 * @remarks
 * This function generates a route from the server and updates the store with the route.
 *
 * @returns Promise<void>
 */
export async function generateRoute(): Promise<void> {
	try {
		const response = await axios.get(
			`/routegentest/seed=${generationParameters.seed.seedString}?hasEmergency=${generationParameters.hasEmergency}`
		);

		if (response.data === undefined) {
			NullRouteStore.set(true);
		} else {
			ResetCurrentRoutePointIndex();
			RouteStore.set(plainToInstance(Route, response.data));

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
