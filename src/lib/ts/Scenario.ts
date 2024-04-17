import {
	AllAirportsStore,
	AllAirspacesStore,
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

export type RouteData = {
	waypoints: Waypoint[];
	airports: Airport[];
	airspaces: Airspace[];
};

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
	WaypointsStore.set(routeData.waypoints.sort((a, b) => a.index - b.index));
	AllAirspacesStore.set(routeData.airspaces);
	AllAirportsStore.set(routeData.airports);
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
	AllAirspacesStore.set(routeData.airspaces);
	AllAirportsStore.set(routeData.airports);
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
