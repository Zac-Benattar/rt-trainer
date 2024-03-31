import {
	AirportsStore,
	AirspacesStore,
	ClearSimulationStores,
	CurrentScenarioPointIndexStore,
	EndPointIndexStore,
	NullRouteStore,
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
import { waypointsTable } from '$lib/db/schema';

export default class Scenario {
	id: string;
	name: string;
	description: string;

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
		id: string,
		name: string,
		description: string,
		seed: string,
		waypoints: Waypoint[],
		airspace: Airspace[],
		airports: Airport[],
		scenarioPoints: ScenarioPoint[]
	) {
		this.id = id;
		this.name = name;
		this.description = description;
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
	CurrentScenarioPointIndexStore.set(startPointIndex);
}

// /**
//  * Fetches a scenario from the server by its id. Returns undefined if the scenario is not found.
//  *
//  * @param scenarioId
//  * @returns Scenario | undefined
//  */
// export async function fetchScenarioById(scenarioId: string): Promise<Scenario | undefined> {
// 	try {
// 		const response = await axios.get(`/api/scenarios/${scenarioId}`);

// 		if (response.data === undefined) {
// 			return undefined;
// 		} else {
// 			return plainToInstance(Scenario, response.data as Scenario);
// 		}
// 	} catch (error: unknown) {
// 		console.log('Error: ', error);
// 	}
// }

// /**
//  * Fetches the scenario info from the server where it is generated and loads it into the stores
//  *
//  * @remarks
//  * Sets the null route store to true if the scenario is not found.
//  * Sets end point index store to the last point in the route if it is set to -1 (default value).
//  *
//  * @returns Promise<void>
//  */
// export async function loadScenarioById(scenarioId: string): Promise<void> {
// 	const scenario = await fetchScenarioById(scenarioId);

// 	// Check the scenario was returned correctly
// 	if (scenario == null || scenario == undefined) {
// 		console.log('Failed to generate scenario');
// 		NullRouteStore.set(true);
// 		return;
// 	}

// 	// Reset all existing scenario stores and load the new scenario
// 	ClearSimulationStores();
// 	NullRouteStore.set(false);
// 	ScenarioStore.set(scenario);

// 	// By default end point index is set to -1 to indicate the user has not set the end of the route in the url
// 	// So we need to set it to the last point in the route if it has not been set
// 	if (endPointIndex == -1) {
// 		EndPointIndexStore.set(scenario.scenarioPoints.length - 1);
// 	}
// }

export type RouteData = {
	waypoints: Waypoint[];
	airspaces: Airspace[];
	airports: Airport[];
};

/**
 * Fetches a FRTOL route from the server where is is generated for this specific response.
 * Returns undefined if the route is not found.
 *
 * @param routeSeed - The seed for the route
 * @returns RouteData | undefined
 */
export async function fetchFRTOLRouteBySeed(routeSeed: string): Promise<RouteData | undefined> {
	try {
		const response = await axios.get(`/generateroute/${routeSeed}`);

		if (response.data === undefined || response.data == '') {
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

export async function loadFRTOLRouteBySeed(routeSeed: string): Promise<void> {
	ClearSimulationStores();
	const routeData = await fetchFRTOLRouteBySeed(routeSeed);
	if (routeData) loadRouteData(routeData);
	else NullRouteStore.set(true);
}

/**
 * Loads the given route data into the stores.
 *
 * @param routeData - The route data to load
 * @returns void
 */
export function loadRouteData(routeData: RouteData): void {
	// Check the scenario was returned correctly
	if (routeData == null || routeData == undefined) {
		console.log('Bad route data attempted to be loaded into stores');
		NullRouteStore.set(true);
		return;
	}

	// Reset all existing simulation stores and load the route data into the stores
	ClearSimulationStores();
	NullRouteStore.set(false);
	WaypointsStore.set(routeData.waypoints);
	AirspacesStore.set(routeData.airspaces);
	AirportsStore.set(routeData.airports);
}

export async function fetchRouteDataById(routeId: string): Promise<RouteData | undefined> {
	try {
		const response = await axios.get(`/api/routes/${routeId}`);

		if (response.data === undefined || response.data == '') {
			return undefined;
		} else {
			const routeData: RouteData = {
				waypoints: response.data.waypoints.map((waypoint: Waypoint) =>
					plainToInstance(Waypoint, waypoint)
				),
				// needs fixing
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

export async function loadRouteDataById(routeId: string): Promise<void> {
	const routeData = await fetchRouteDataById(routeId);

	// Check the scenario was returned correctly
	if (routeData == null || routeData == undefined) {
		console.log('Failed to load route');
		NullRouteStore.set(true);
		return;
	}

	// Reset all existing simulation stores and load the route data into the stores
	ClearSimulationStores();
	NullRouteStore.set(false);
	WaypointsStore.set(routeData.waypoints);
	AirspacesStore.set(routeData.airspaces);
	AirportsStore.set(routeData.airports);
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
