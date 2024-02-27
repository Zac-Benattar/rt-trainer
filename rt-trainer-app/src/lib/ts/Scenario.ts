import {
	AirspacesStore,
	ClearSimulationStores,
	CurrentRoutePointIndexStore,
	EndPointIndexStore,
	NullRouteStore,
	ScenarioStore,
	StartPointIndexStore,
	WaypointsStore
} from '$lib/stores';
import axios from 'axios';
import type { ServerResponse } from './ServerClientTypes';
import type RadioCall from './RadioCall';
import Waypoint from './AeronauticalClasses/Waypoint';
import ScenarioPoint from './ScenarioPoints';
import { Type, plainToInstance } from 'class-transformer';
import Airport from './AeronauticalClasses/Airport';
import 'reflect-metadata';
import Airspace from './AeronauticalClasses/Airspace';

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

	constructor(
		seed: string,
		waypoints: Waypoint[],
		airspace: Airspace[],
		airports: Airport[],
		scenarioPoints: ScenarioPoint[]
	) {
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
let routeGenerated = false;
NullRouteStore.subscribe((value) => {
	routeGenerated = !value;
});

export function ResetCurrentRoutePointIndex(): void {
	CurrentRoutePointIndexStore.set(startPointIndex);
}

/**
 * Fetches a scenario from the server by its id. Returns undefined if the scenario is not found.
 *
 * @param scenarioId
 * @returns Scenario | undefined
 */
export async function fetchScenarioById(scenarioId: string): Promise<Scenario | undefined> {
	try {
		const response = await axios.get(`/scenario/${scenarioId}`);

		if (response.data === undefined) {
			return undefined;
		} else {
			return plainToInstance(Scenario, response.data as Scenario);
		}
	} catch (error: unknown) {
		console.log('Error: ', error);
	}
}

/**
 * Fetches the scenario info from the server where it is generated and loads it into the stores
 *
 * @remarks
 * Sets the null route store to true if the scenario is not found.
 * Sets end point index store to the last point in the route if it is set to -1 (default value).
 *
 * @returns Promise<void>
 */
export async function loadScenarioById(scenarioId: string): Promise<void> {
	const scenario = await fetchScenarioById(scenarioId);

	// Check the scenario was returned correctly
	if (scenario == null || scenario == undefined) {
		console.log('Failed to generate scenario');
		NullRouteStore.set(true);
		return;
	}

	// Reset all existing scenario stores and load the new scenario
	ClearSimulationStores();
	NullRouteStore.set(false);
	ScenarioStore.set(scenario);

	// By default end point index is set to -1 to indicate the user has not set the end of the route in the url
	// So we need to set it to the last point in the route if it has not been set
	if (endPointIndex == -1) {
		EndPointIndexStore.set(scenario.scenarioPoints.length - 1);
	}
}

export type RouteData = {
	waypoints: Waypoint[];
	airspaces: Airspace[];
	airports: Airport[];
};

/**
 * Fetches a FRTOL route from the server. Returns undefined if the route is not found.
 *
 * @param routeSeed - The seed for the route
 * @returns RouteData | undefined
 */
export async function fetchFRTOLRouteBySeed(routeSeed: string): Promise<RouteData | undefined> {
	try {
		const response = await axios.get(`/generateroute/${routeSeed}`);

		if (response.data === undefined) {
			return undefined;
		} else {
			const routeData = {
				waypoints: response.data.waypoints.map((waypoint: Waypoint) =>
					plainToInstance(Waypoint, waypoint)
				),
				airspaces: response.data.airspaces.map((airspace: Airspace) =>
					plainToInstance(Airspace, airspace)
				),
				airports: response.data.airports.map((airport: Airport) =>
					plainToInstance(Airport, airport)
				)
			};
			return routeData;
		}
	} catch (error: unknown) {
		console.log('Error: ', error);
	}
}

/**
 * Loads the route data for a given route defined by its seed from the server into the stores.
 *
 * @param routeSeed - The seed of the route to load (as a string)
 * @returns Promise<void>
 */
export async function loadRouteDataBySeed(routeSeed: string): Promise<void> {
	const routeData = await fetchFRTOLRouteBySeed(routeSeed);

	// Check the scenario was returned correctly
	if (routeData == null || routeData == undefined) {
		console.log('Failed to generate route');
		NullRouteStore.set(true);
		return;
	}

	// Reset all existing simulation stores and load the route data into the stores
	ClearSimulationStores();
	NullRouteStore.set(false);
	WaypointsStore.set(routeData.waypoints);
	AirspacesStore.set(routeData.airspaces);
}

/**
 * Checks the radio call by the server. Gets back the radio call in response, the feedback and the expected user response.
 *
 * @param radioCall - The radio call to check
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
		const response = await axios.post(`/parse`, {
			data: radioCall
		});

		return response.data;
	} catch (error) {
		console.error('Error: ', error);
	}
}
