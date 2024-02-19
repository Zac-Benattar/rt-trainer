import {
	CurrentRoutePointIndexStore,
	EndPointIndexStore,
	GenerationParametersStore,
	NullRouteStore,
	ScenarioStore,
	StartPointIndexStore
} from '$lib/stores';
import axios from 'axios';
import type { GenerationParameters, ServerResponse } from './ServerClientTypes';
import type RadioCall from './RadioCall';
import { Waypoint } from './AeronauticalClasses/Waypoint';
import ScenarioPoint from './ScenarioPoints';
import { Type, plainToInstance } from 'class-transformer';
import { Airport } from './AeronauticalClasses/Airport';
import 'reflect-metadata';
import Airspace from './AeronauticalClasses/Airspace';

/* Route generated for a scenario. */
export default class Scenario {
	seed: string;

	@Type(() => ScenarioPoint)
	scenarioPoints: ScenarioPoint[] = [];

	@Type(() => Airport)
	airports: Airport[] = [];

	@Type(() => Airspace)
	airspaces: Airspace[] = [];

	@Type(() => Waypoint)
	waypoints: Waypoint[] = [];
	currentPointIndex: number = 0;

	constructor(seed: string, waypoints: Waypoint[], airspace: Airspace[], airports: Airport[], scenarioPoints: ScenarioPoint[]) {
		this.seed = seed;
		this.waypoints = waypoints;
		this.airspaces = airspace;
		this.airports = airports;
		this.scenarioPoints = scenarioPoints;
	}

	public getCurrentPoint(): ScenarioPoint {
		return this.scenarioPoints[this.currentPointIndex];
	}

	public getPoints(): ScenarioPoint[] {
		return this.scenarioPoints;
	}

	public getStartPoint(): ScenarioPoint {
		return this.scenarioPoints[0];
	}

	public getEndPoint(): ScenarioPoint {
		return this.scenarioPoints[this.scenarioPoints.length - 1];
	}

	public getStartAirport(): Airport {
		return this.airports[0];
	}

	public getEndAirport(): Airport {
		return this.airports[this.airports.length - 1];
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
			ScenarioStore.set(plainToInstance(Scenario, response.data as Scenario));

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
