import type Airport from './AeronauticalClasses/Airport';
import type Airspace from './AeronauticalClasses/Airspace';
import type { AirportData, AirspaceData } from './AeronauticalClasses/OpenAIPTypes';
import type Waypoint from './AeronauticalClasses/Waypoint';
import {
	airportDataToAirport,
	airspaceDataToAirspace,
	readAirportDataFromJSON,
	readAirspaceDataFromJSON
} from './OpenAIPHandler';
import Scenario from './Scenario';
import type ScenarioPoint from './ScenarioPoints';
import { getEndAirportScenarioPoints, getStartAirportScenarioPoints } from './ScenarioPoints';
import type { FrequencyChangePoint } from './ScenarioTypes';
import { findAirspaceChangePoints } from './utils';

export function generateScenario(seed: number, waypoints: Waypoint[]): Scenario {
	const airports: Airport[] = [];
	const airspaces: Airspace[] = [];
	const scenarioPoints: ScenarioPoint[] = [];

	const AIRCRAFT_AVERAGE_SPEED = 125; // knots
	const NAUTICAL_MILE = 1852;
	const FLIGHT_TIME_MULTIPLIER = 1.3;

	const airportsData: AirportData[] = readAirportDataFromJSON();
	const airspacesData: AirspaceData[] = readAirspaceDataFromJSON();

	// Add airports to list of valid airports for takeoff/landing
	const allAirports: Airport[] = [];
	for (let i = 0; i < airportsData.length; i++) {
		const airport: Airport = airportDataToAirport(airportsData[i]);
		allAirports.push(airport);
	}

	// Add airspaces to list of valid airspaces for route
	const allAirspaces: Airspace[] = [];
	for (let i = 0; i < airspacesData.length; i++) {
		const airspace: Airspace = airspaceDataToAirspace(airspacesData[i]);
		allAirspaces.push(airspace);
	}

	const startAirport = allAirports.find((x) => x.name == waypoints[0].name);
	if (startAirport == undefined) {
		throw new Error('Start airport not found');
	}

	airports.push(startAirport);

	const endAirport = allAirports.find((x) => x.name == waypoints[waypoints.length - 1].name);
	if (endAirport == undefined) {
		throw new Error('End airport not found');
	}

	airports.push(endAirport);

	// Get all airspace along the route
	const route: [number, number][] = [
		startAirport.coordinates,
		waypoints[1].getCoords(),
		waypoints[2].getCoords(),
		endAirport.coordinates
	];

	// Get all on route airspaces
	const frequencyChangePoints: FrequencyChangePoint[] = [];
	const intersectionPoints: { airspace: Airspace; coordinates: [number, number] }[] =
		findAirspaceChangePoints(route, allAirspaces);
	for (let i = 0; i < intersectionPoints.length; i++) {
		if (airspaces.indexOf(intersectionPoints[i].airspace) == -1)
			airspaces.push(intersectionPoints[i].airspace);
	}
	// console.log(intersectionPoints);

	// Calculate the frequency change points

	// Generate the scenario points

	scenarioPoints.push(...getStartAirportScenarioPoints(seed, waypoints, airspaces, airports));

	// Calculate airborne scenarion points

	scenarioPoints.push(...getEndAirportScenarioPoints(seed, waypoints, airspaces, airports));

	return new Scenario(seed.toString(), waypoints, airspaces, airports, scenarioPoints);
}
