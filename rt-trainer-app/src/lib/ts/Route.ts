import visualReferencePoints from '../data/visual_reference_points.json';
import {
	haversineDistance,
	stringDecimalLatitudeToNumber,
	stringDecimalLongitudeToNumber
} from './utils';
import { WaypointType, type Waypoint } from './RouteTypes';
import type Seed from './Seed';
import RoutePoint, {
	getAirborneRoutePoints,
	getEndAerodromeRoutePoints,
	getStartAerodromeRoutePoints
} from './RoutePoints';
import { ControlledAerodrome, UncontrolledAerodrome } from './Aerodrome';

const MAX_AERODROME_DISTANCE = 150000; // 150km
const MAX_ROUTE_DISTANCE = 200000; // 200km
const MAX_AIRBORNE_ROUTE_POINTS = 15;

const VRPs = getWaypointsFromVRPsJSON();

export function getWaypointsFromVRPsJSON(): Waypoint[] {
	const airborneWaypoints: Waypoint[] = [];

	visualReferencePoints.forEach((waypoint) => {
		const lat = stringDecimalLatitudeToNumber(waypoint.Latitude);
		const long = stringDecimalLongitudeToNumber(waypoint.Longitude);
		if (lat == null || long == null) {
			console.log('Failed to load VRP: ' + waypoint['VRP name']);
			return;
		}

		airborneWaypoints.push({
			waypointType: WaypointType.Fix,
			name: waypoint['VRP name'],
			lat: lat,
			long: long
		});
	});

	return airborneWaypoints;
}

/* Route generated for a scenario. */
export default class Route {
	protected points: RoutePoint[] = [];
	protected currentPointIndex: number = 0;

	public getCurrentPoint(): RoutePoint {
		return this.points[this.currentPointIndex];
	}

	/* Get a start aerodrome. */
	public static getStartAerodrome(seed: Seed): ControlledAerodrome | UncontrolledAerodrome {
		if (seed.scenarioSeed % 2 === 0) {
			const controlledAerodromes = ControlledAerodrome.getAerodromesFromJSON();
			return controlledAerodromes[seed.scenarioSeed % controlledAerodromes.length];
		}
		const uncontrolledAerodromes = UncontrolledAerodrome.getAerodromesFromJSON();
		return uncontrolledAerodromes[seed.scenarioSeed % uncontrolledAerodromes.length];
	}

	public static getAirborneWaypoints(seed: Seed, numAirborneWaypoints: number): Waypoint[] {
		const startAerodrome: ControlledAerodrome | UncontrolledAerodrome =
			Route.getStartAerodrome(seed);
		const takeOffRunwayPosition = startAerodrome.getTakeoffRunway(seed).getCenterPoint();
		const endAerodrome: ControlledAerodrome | UncontrolledAerodrome = Route.getEndAerodrome(seed);
		const landingRunwayPosition = endAerodrome.getLandingRunway(seed).getCenterPoint();

		// Limit the number of airborne waypoints to save compute
		if (numAirborneWaypoints > MAX_AIRBORNE_ROUTE_POINTS) {
			numAirborneWaypoints = MAX_AIRBORNE_ROUTE_POINTS;
		}

		let iterations = 0;
		const maxIterations = 1000;
		// Try many combinations of waypoints until a valid route is found
		for (let i = 0; i < maxIterations; i++) {
			const waypoints: Waypoint[] = [];
			// Push the start aerodrome to points in order to calculate the distance from it
			waypoints.push({
				waypointType: WaypointType.Aerodrome,
				lat: takeOffRunwayPosition[0],
				long: takeOffRunwayPosition[1],
				name: 'startAerodrome'
			});
			let totalDistance = 0.0;

			// Add waypoints until the route is too long or contains too many points
			for (let j = 1; j < numAirborneWaypoints + 1; j++) {
				const waypoint =
					VRPs[(seed.scenarioSeed * j * (i + 1)) % VRPs.length];

				// Prevent same waypoint coming up multiple times
				if (waypoints.findIndex((x) => x === waypoint) != -1) break;

				const distance = haversineDistance(
					waypoints[waypoints.length - 1]?.lat,
					waypoints[waypoints.length - 1]?.long,
					waypoint.lat,
					waypoint.long
				);

				// If route is too long or contains too many points, stop adding points
				if (
					waypoints.length - 1 >= numAirborneWaypoints ||
					totalDistance + distance >
						MAX_ROUTE_DISTANCE -
							haversineDistance(
								waypoint.lat,
								waypoint.long,
								landingRunwayPosition[0],
								landingRunwayPosition[1]
							)
				) {
					break;
				}

				// Route valid with this waypoint - add it
				waypoints.push(waypoint);
				totalDistance += distance;
			}

			// Suitable route found
			if (waypoints.length > 1 && waypoints.length - 1 >= numAirborneWaypoints) {
				// Remove the start aerodrome
				waypoints.shift();

				console.log('Route generated in: ' + (iterations + 1) + ' iterations');
				return waypoints;
			}

			// No suitable route found - try again
			iterations++;
		}

		// No suitable route found after max iterations - unrecoverable error
		throw new Error('No suitable route found in ' + maxIterations + ' iterations');
	}

	/* Get end aerodrome for a given seed.
		Depending on whether the seed is odd or even a the large or small aerodrome list is loaded.
		Then an potential airodrome is picked based on the seed modulo number of possible 
		end aerodromes. If this is not within the maximum distance from the start aerodrome, 
		the next aerodrome is checked, and so on until all are checked. 
		Error thrown if none found as the whole route generation is based on start and 
		end aerodromes so this is not recoverable. */
	public static getEndAerodrome(seed: Seed): ControlledAerodrome | UncontrolledAerodrome {
		const startAerodrome: ControlledAerodrome | UncontrolledAerodrome =
			Route.getStartAerodrome(seed);
		const takeOffRunwayPosition = startAerodrome.getTakeoffRunway(seed).getCenterPoint();
		const possibleEndAerodromes: (ControlledAerodrome | UncontrolledAerodrome)[] = [];

		if (seed.scenarioSeed % 2 === 0) {
			possibleEndAerodromes.push(...UncontrolledAerodrome.getAerodromesFromJSON());
		} else {
			possibleEndAerodromes.push(...ControlledAerodrome.getAerodromesFromJSON());
		}

		let endAerodrome: ControlledAerodrome | UncontrolledAerodrome =
			possibleEndAerodromes[seed.scenarioSeed % possibleEndAerodromes.length];
		const landingRunwayPosition = endAerodrome.getLandingRunway(seed).getCenterPoint();
		let endAerodromeFound: boolean = false;

		// If the end aerodrome is too far from the start aerodrome, find a new one
		for (let i = 0; i < possibleEndAerodromes.length; i++) {
			const distance = haversineDistance(
				takeOffRunwayPosition[0],
				takeOffRunwayPosition[1],
				landingRunwayPosition[0],
				landingRunwayPosition[1]
			);

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

	/* Generate the route based off of the seed. */
	public generateRoute(seed: Seed, numAirborneWaypoints: number, emergency: boolean): RoutePoint[] {
		this.points.push(...getStartAerodromeRoutePoints(seed));

		this.points.push(...getAirborneRoutePoints(seed, numAirborneWaypoints, emergency));

		this.points.push(...getEndAerodromeRoutePoints(seed, numAirborneWaypoints));

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

	public static getRouteWaypoints(seed: Seed, numAirborneWaypoints: number): Waypoint[] {
		const waypoints: Waypoint[] = [];
		const startAerodrome = Route.getStartAerodrome(seed);
		const startAerodromeRunwayCenterPoint = startAerodrome.getTakeoffRunway(seed).getCenterPoint();
		const endAerodrome = Route.getEndAerodrome(seed);
		const endAerodromeRunwayCenterPoint = endAerodrome.getLandingRunway(seed).getCenterPoint();

		waypoints.push({
			waypointType: WaypointType.Aerodrome,
			lat: startAerodromeRunwayCenterPoint[0],
			long: startAerodromeRunwayCenterPoint[1],
			name: startAerodrome.getShortName()
		});

		waypoints.push(...Route.getAirborneWaypoints(seed, numAirborneWaypoints));

		waypoints.push({
			waypointType: WaypointType.Aerodrome,
			lat: endAerodromeRunwayCenterPoint[0],
			long: endAerodromeRunwayCenterPoint[1],
			name: endAerodrome.getShortName()
		});

		return waypoints;
	}
}
