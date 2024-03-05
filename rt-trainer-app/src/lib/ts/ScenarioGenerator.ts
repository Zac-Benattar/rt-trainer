import type Airport from './AeronauticalClasses/Airport';
import type Airspace from './AeronauticalClasses/Airspace';
import type { AirportData, AirspaceData } from './AeronauticalClasses/OpenAIPTypes';
import type Waypoint from './AeronauticalClasses/Waypoint';
import {
	airportDataToAirport,
	airspaceDataToAirspace,
	readAirportDataFromDB,
	readAirspaceDataFromDB
} from './OpenAIPHandler';
import Scenario from './Scenario';
import type ScenarioPoint from './ScenarioPoints';
import {
	getAirborneScenarioPoints,
	getEndAirportScenarioPoints,
	getStartAirportScenarioPoints
} from './ScenarioPoints';
import { findIntersections } from './utils';

export async function generateScenario(
	scenarioId: string,
	name: string,
	description: string,
	seed: string,
	waypoints: Waypoint[],
	hasEmergency: boolean
): Promise<Scenario> {
	const airports: Airport[] = [];
	const airspaces: Airspace[] = [];
	const scenarioPoints: ScenarioPoint[] = [];

	waypoints.sort((a, b) => a.index - b.index);

	const airportsData: AirportData[] = await readAirportDataFromDB();
	const airspacesData: AirspaceData[] = await readAirspaceDataFromDB();

	// Add airports to list of valid airports for takeoff/landing
	const allAirports: Airport[] = [];
	for (let i = 0; i < airportsData.length; i++) {
		if (
			airportsData[i] &&
			airportsData[i].name != undefined &&
			airportsData[i].geometry.coordinates != undefined
		) {
			const airport: Airport = airportDataToAirport(airportsData[i]);
			allAirports.push(airport);
		}
	}

	// Add airspaces to list of valid airspaces for route
	const allAirspaces: Airspace[] = [];
	for (let i = 0; i < airspacesData.length; i++) {
		const airspace: Airspace = airspaceDataToAirspace(airspacesData[i]);
		allAirspaces.push(airspace);
	}

	const startAirport = allAirports.find((x) => x.name.includes(waypoints[0].name));
	if (startAirport == undefined) {
		throw new Error('Start airport not found');
	}

	airports.push(startAirport);

	const endAirport = allAirports.find((x) =>
		x.name.includes(waypoints[waypoints.length - 1].name.split(' ')[0])
	);
	if (endAirport == undefined) {
		throw new Error('End airport not found');
	}

	airports.push(endAirport);

	// Get all airspace along the route
	const route: [number, number][] = waypoints.map((x) => x.location);

	// Collect all intersection points with airspaces
	const intersectionPoints = findIntersections(route, allAirspaces);
	for (let i = 0; i < intersectionPoints.length; i++) {
		if (airspaces.findIndex((x) => x.id == intersectionPoints[i].airspaceId) == -1) {
			airspaces.push(
				allAirspaces.find((x) => x.id == intersectionPoints[i].airspaceId) as Airspace
			);
		}
	}

	scenarioPoints.push(...getStartAirportScenarioPoints(seed, waypoints, airspaces, startAirport));

	scenarioPoints.push(
		...getAirborneScenarioPoints(
			scenarioPoints.length,
			seed,
			waypoints,
			airspaces,
			intersectionPoints,
			startAirport,
			endAirport,
			scenarioPoints[scenarioPoints.length - 1],
			hasEmergency
		)
	);

	scenarioPoints.push(
		...getEndAirportScenarioPoints(
			scenarioPoints.length,
			seed,
			waypoints,
			airspaces,
			endAirport,
			scenarioPoints[scenarioPoints.length - 1]
		)
	);

	return new Scenario(
		scenarioId,
		name,
		description,
		seed.toString(),
		waypoints,
		airspaces,
		airports,
		scenarioPoints
	);
}
