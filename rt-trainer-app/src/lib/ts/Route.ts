import smallAerodromes from '../../data/small_aerodromes.json';
import largeAerodromes from '../../data/large_aerodromes.json';
import waypoints from '../../data/waypoints.json';
import { haversineDistance, seededNormalDistribution } from './utils';
import {
	FrequencyType,
	type Aerodrome,
	type RadioFrequency,
	type METORDataSample,
	type METORData,
	WaypointType,
	type Pose,
	type Waypoint
} from './SimulatorTypes';
import type { Seed } from './ServerClientTypes';
import {
	ParkedPoint,
	getRadioCheckSimulatorUpdateData,
	type RoutePoint,
	getRequestingDepartInfoSimulatorUpdateData,
	getGetDepartInfoReadbackSimulatorUpdateData,
	getTaxiRequestSimulatorUpdateData,
	getGetTaxiClearenceReadbackSimulatorUpdateData
} from './RouteStates';
import { ParkedStage } from './FlightStages';

const MAX_AERODROME_DISTANCE = 100000; // 100km
const MAX_ROUTE_DISTANCE = 300000; // 300km
const MIN_AIRBORNE_ROUTE_POINTS = 2;
const MAX_AIRBORNE_ROUTE_POINTS = 5;

// enum Season {
// 	Spring,
// 	Summer,
// 	Autumn,
// 	Winter
// }

function getSmallAerodromesFromJSON(): Aerodrome[] {
	const aerodromes: Aerodrome[] = [];

	smallAerodromes.forEach((aerodrome) => {
		const radioFrequencies: RadioFrequency[] = [];
		aerodrome.radioFrequencies.forEach((comFrequency) => {
			let frequencyType: FrequencyType;
			switch (comFrequency.frequencyType) {
				case 'AFIS':
					frequencyType = FrequencyType.AFIS;
					break;
				case 'GND':
					frequencyType = FrequencyType.GND;
					break;
				case 'TWR':
					frequencyType = FrequencyType.TWR;
					break;
				default:
					frequencyType = FrequencyType.TWR;
					break;
			}

			radioFrequencies.push({
				frequencyType: frequencyType,
				frequency: comFrequency.frequency,
				callsign: comFrequency.callsign
			});
		});

		aerodromes.push({
			name: aerodrome.name,
			icao: aerodrome.icao,
			radioFrequencies: radioFrequencies,
			runways: aerodrome.runways,
			location: aerodrome.location,
			altitude: aerodrome.altitude,
			startPoint: aerodrome.startPoint,
			metorData: aerodrome.metorData
		});
	});

	return aerodromes;
}

function getLargeAerodromesFromJSON(): Aerodrome[] {
	const aerodromes: Aerodrome[] = [];

	largeAerodromes.forEach((aerodrome) => {
		const radioFrequencies: RadioFrequency[] = [];
		aerodrome.radioFrequencies.forEach((comFrequency) => {
			let frequencyType: FrequencyType;
			switch (comFrequency.frequencyType) {
				case 'AFIS':
					frequencyType = FrequencyType.AFIS;
					break;
				case 'GND':
					frequencyType = FrequencyType.GND;
					break;
				case 'TWR':
					frequencyType = FrequencyType.TWR;
					break;
				default:
					frequencyType = FrequencyType.TWR;
					break;
			}

			radioFrequencies.push({
				frequencyType: frequencyType,
				frequency: comFrequency.frequency,
				callsign: comFrequency.callsign
			});
		});

		aerodromes.push({
			name: aerodrome.name,
			icao: aerodrome.icao,
			radioFrequencies: radioFrequencies,
			runways: aerodrome.runways,
			location: aerodrome.location,
			altitude: aerodrome.altitude,
			startPoint: aerodrome.startPoint,
			metorData: aerodrome.metorData
		});
	});

	return aerodromes;
}

function getWaypointsFromJSON(): Waypoint[] {
	const airborneWaypoints: Waypoint[] = [];

	waypoints.forEach((waypoint) => {
		const radioFrequencies: RadioFrequency[] = [];
		for (let i = 0; i < waypoint.radioFrequencies.length; i++) {
			let frequencyType: FrequencyType;
			switch (waypoint.radioFrequencies[i].frequencyType) {
				case 'AFIS':
					frequencyType = FrequencyType.AFIS;
					break;
				case 'GND':
					frequencyType = FrequencyType.GND;
					break;
				case 'TWR':
					frequencyType = FrequencyType.TWR;
					break;
				default:
					frequencyType = FrequencyType.TWR;
					break;
			}

			radioFrequencies.push({
				frequencyType: frequencyType,
				frequency: waypoint.radioFrequencies[i].frequency,
				callsign: waypoint.radioFrequencies[i].callsign
			});
		}

		airborneWaypoints.push({
			waypointType: WaypointType.VOR,
			name: waypoint.name,
			location: waypoint.location,
			radioFrequencies: radioFrequencies
		});
	});

	return airborneWaypoints;
}

/* Route generated for a scenario. */
export default class Route {
	protected points: RoutePoint[] = [];

	/* Get a start aerodrome. */
	public static getStartAerodrome(seed: Seed): Aerodrome {
		if (seed.scenarioSeed % 2 === 0) {
			return getLargeAerodromesFromJSON()[seed.scenarioSeed % largeAerodromes.length];
		}
		return getSmallAerodromesFromJSON()[seed.scenarioSeed % smallAerodromes.length];
	}

	/* Get the start aerodrome states. This includes all stages of:     
	Parked,
    Taxiing,
    HoldingPoint,
    TakeOff.
	 */
	public static getStartAerodromeRoutePoints(seed: Seed): RoutePoint[] {
		const stages: RoutePoint[] = [];
		const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);

		const parkedPose: Pose = {
			location: startAerodrome.location,
			heading: 0.0,
			altitude: startAerodrome.altitude,
			airSpeed: 0.0
		};

		const radioCheck = new ParkedPoint(
			ParkedStage.RadioCheck,
			parkedPose,
			getRadioCheckSimulatorUpdateData(seed, startAerodrome)
		);
		stages.push(radioCheck);

		const requestDepartInfo = new ParkedPoint(
			ParkedStage.DepartInfo,
			parkedPose,
			getRequestingDepartInfoSimulatorUpdateData(seed, startAerodrome)
		);
		stages.push(requestDepartInfo);

		const readbackDepartInfo = new ParkedPoint(
			ParkedStage.ReadbackDepartInfo,
			parkedPose,
			getGetDepartInfoReadbackSimulatorUpdateData(seed, startAerodrome)
		);
		stages.push(readbackDepartInfo);

		const taxiRequest = new ParkedPoint(
			ParkedStage.TaxiRequest,
			parkedPose,
			getTaxiRequestSimulatorUpdateData(seed, startAerodrome)
		);
		stages.push(taxiRequest);

		const taxiClearanceReadback = new ParkedPoint(
			ParkedStage.TaxiClearanceReadback,
			parkedPose,
			getGetTaxiClearenceReadbackSimulatorUpdateData(seed, startAerodrome)
		);
		stages.push(taxiClearanceReadback);

		return stages;
	}

	public static getAirborneRoutePoints(seed: Seed): RoutePoint[] {
		let points: Waypoint[] = [];
		const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);
		const endAerodrome: Aerodrome = Route.getEndAerodrome(seed);
		// Read in all waypoints from waypoints.json

		const possibleWaypoints = getWaypointsFromJSON();

		// Push the start aerodrome to points in order to calculate the distance from it
		points.push({
			waypointType: WaypointType.Aerodrome,
			location: startAerodrome.location,
			name: 'startAerodrome',
			radioFrequencies: startAerodrome.radioFrequencies
		});

		// Try many combinations of waypoints until a valid route is found
		for (let i = 0; i < possibleWaypoints.length * possibleWaypoints.length; i++) {
			let totalDistance = 0.0;
			// Add waypoints until the route is too long or contains too many points
			for (let i = 0; i < MAX_AIRBORNE_ROUTE_POINTS; i++) {
				const waypoint = possibleWaypoints[seed.scenarioSeed % possibleWaypoints.length];
				const distance = haversineDistance(points[points.length - 1]?.location, waypoint.location);

				// If route is too long or contains too many points, stop adding points
				if (
					totalDistance + distance >
						MAX_ROUTE_DISTANCE - haversineDistance(waypoint.location, endAerodrome.location) ||
					points.length - 1 >= MAX_AIRBORNE_ROUTE_POINTS
				) {
					break;
				}

				// Route valid with this waypoint - add it
				points.push(waypoint);
				totalDistance += distance;
			}

			// Suitable route found
			if (points.length >= MIN_AIRBORNE_ROUTE_POINTS) {
				break;
			}

			// No suitable route found - reset points and try again
			points = [];
			points.push({
				waypointType: WaypointType.Aerodrome,
				location: startAerodrome.location,
				name: 'startAerodrome',
				radioFrequencies: startAerodrome.radioFrequencies
			});
		}

		// Remove the start aerodrome
		points.shift();

		// Add events at each point
	}

	public static getEndAerodromeRoutePoints(seed: Seed): RoutePoint[] {}

	/* Get end aerodrome for a given seed.
		Depending on whether the seed is odd or even a large or small aerodrome is picked.
		Then an potential airodrome is picked based on the seed modulo number of possible 
		end aerodromes. If this is not within the maximum distance from the start aerodrome, 
		the next aerodrome is checked, and so on until all are checked. 
		Error thrown if none found as the whole route generation is based on start and 
		end aerodromes so this is not recoverable. */
	public static getEndAerodrome(seed: Seed): Aerodrome {
		const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);
		const possibleEndAerodromes: Aerodrome[] = [];

		if (seed.scenarioSeed % 2 === 0) {
			possibleEndAerodromes.push(...getSmallAerodromesFromJSON());
		} else {
			possibleEndAerodromes.push(...getLargeAerodromesFromJSON());
		}

		let endAerodrome: Aerodrome =
			possibleEndAerodromes[seed.scenarioSeed % possibleEndAerodromes.length];
		let endAerodromeFound: boolean = false;

		// If the end aerodrome is too far from the start aerodrome, find a new one
		for (let i = 0; i < possibleEndAerodromes.length; i++) {
			const distance = haversineDistance(startAerodrome.location, endAerodrome.location);

			if (distance <= MAX_AERODROME_DISTANCE) {
				endAerodromeFound = true;
				break;
			}

			endAerodrome = possibleEndAerodromes[(seed.scenarioSeed + i) % possibleEndAerodromes.length];
		}

		if (!endAerodromeFound) {
			throw new Error(
				'Could not find an end aerodrome within the maximum distance: ' +
					MAX_AERODROME_DISTANCE +
					'm'
			);
		}

		return endAerodrome;
	}

	public static getMETORSample(seed: Seed, metorData: METORData): METORDataSample {
		// let season: Season = Season.Spring;
		let meanTemperature: number = 0.0;

		switch (seed.weatherSeed % 4) {
			case 0:
				// season = Season.Spring;
				meanTemperature = metorData.meanTemperature * 1.3;
				break;
			case 1:
				// season = Season.Summer;
				meanTemperature = metorData.meanTemperature * 1.7;
				break;
			case 2:
				// season = Season.Autumn;
				meanTemperature = metorData.meanTemperature * 1.1;
				break;
			case 3:
				// season = Season.Winter;
				meanTemperature = metorData.meanTemperature * 0.4;
				break;
		}

		// Simulate temperature, wind direction, wind speed and pressure with a normal distribution
		const wind_direction =
			seededNormalDistribution(seed.weatherSeed.toString(), metorData.avgWindDirection, 10.0) %
			360.0;

		const temperature = seededNormalDistribution(
			seed.weatherSeed.toString(),
			meanTemperature,
			metorData.stdTemperature
		);

		const wind_speed = seededNormalDistribution(
			seed.weatherSeed.toString(),
			metorData.meanWindSpeed,
			metorData.stdWindSpeed
		);

		const pressure = seededNormalDistribution(
			seed.weatherSeed.toString(),
			metorData.meanPressure,
			metorData.stdTemperature
		);

		return {
			windDirection: wind_direction,
			windSpeed: wind_speed,
			pressure: pressure,
			temperature: temperature,
			dewpoint: temperature * 0.95 - 1.2 // Basic dewpoint aproximation - not based on any actual formula
		};
	}

	/* Generate the route based off of the seed. */
	public generateRoute(seed: Seed): RoutePoint[] {
		this.points.push(...Route.getStartAerodromeRoutePoints(seed));

		this.points.push(...Route.getAirborneRoutePoints(seed));

		this.points.push(...Route.getEndAerodromeRoutePoints(seed));

		console.log('Route points:');
		for (let i = 0; i < this.points.length; i++) {
			console.log(this.points[i]);
		}

		return this.points;
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
}
