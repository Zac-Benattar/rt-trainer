import {
	ClearSimulationStores,
	CurrentScenarioPointIndexStore,
	EndPointIndexStore,
	NullRouteStore,
	StartPointIndexStore,
	WaypointsStore
} from '$lib/stores';
import Waypoint from './AeronauticalClasses/Waypoint';
import ScenarioPoint from './ScenarioPoints';
import { Type } from 'class-transformer';
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
}