import waypoints from '../../data/waypoints.json';
import { haversineDistance } from './utils';
import { WaypointType, type Pose, type Waypoint } from './SimulatorTypes';
import type Seed from './Seed';
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
import { ControlledAerodrome, UncontrolledAerodrome } from './Aerodrome';

const MAX_AERODROME_DISTANCE = 100000; // 100km
const MAX_ROUTE_DISTANCE = 300000; // 300km
const MAX_AIRBORNE_ROUTE_POINTS = 5;

// enum Season {
// 	Spring,
// 	Summer,
// 	Autumn,
// 	Winter
// }

function getWaypointsFromJSON(): Waypoint[] {
	const airborneWaypoints: Waypoint[] = [];

	waypoints.forEach((waypoint) => {
		airborneWaypoints.push({
			waypointType: WaypointType.VOR,
			name: waypoint.name,
			location: waypoint.location
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

	/* Get the start aerodrome states. This includes all stages of:     
	Parked,
    Taxiing,
    HoldingPoint,
    TakeOff.
	 */
	public static getStartAerodromeRoutePoints(seed: Seed): RoutePoint[] {
		const stages: RoutePoint[] = [];
		const startAerodrome: ControlledAerodrome | UncontrolledAerodrome =
			Route.getStartAerodrome(seed);
		const controlledAerodrome: boolean = startAerodrome instanceof ControlledAerodrome;
		const startPoints = startAerodrome.getStartPoints();
		const startPointIndex = seed.scenarioSeed % startPoints.length;

		if (controlledAerodrome) {
			const parkedPose: Pose = {
				location: startPoints[startPointIndex].location,
				heading: startPoints[startPointIndex].heading,
				altitude: startAerodrome.getAltitude(),
				airSpeed: 0.0
			};

			const parkedWaypoint: Waypoint = {
				waypointType: WaypointType.Aerodrome,
				location: startAerodrome.getLocation(),
				name: startAerodrome.getShortName()
			};

			const radioCheck = new ParkedPoint(
				ParkedStage.RadioCheck,
				parkedPose,
				getRadioCheckSimulatorUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(radioCheck);

			const requestDepartInfo = new ParkedPoint(
				ParkedStage.DepartureInformationRequest,
				parkedPose,
				getRequestingDepartInfoSimulatorUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(requestDepartInfo);

			const readbackDepartInfo = new ParkedPoint(
				ParkedStage.ReadbackDepartureInformation,
				parkedPose,
				getGetDepartInfoReadbackSimulatorUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(readbackDepartInfo);

			const taxiRequest = new ParkedPoint(
				ParkedStage.TaxiRequest,
				parkedPose,
				getTaxiRequestSimulatorUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(taxiRequest);

			const taxiClearanceReadback = new ParkedPoint(
				ParkedStage.TaxiClearanceReadback,
				parkedPose,
				getGetTaxiClearenceReadbackSimulatorUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(taxiClearanceReadback);
		} else {
			
		}

		return stages;
	}

	public static getAirborneRoutePoints(
		seed: Seed,
		airborneWaypoints: number,
		emergency: boolean
	): RoutePoint[] {
		let points: Waypoint[] = [];
		const startAerodrome: ControlledAerodrome | UncontrolledAerodrome =
			Route.getStartAerodrome(seed);
		const endAerodrome: ControlledAerodrome | UncontrolledAerodrome = Route.getEndAerodrome(seed);

		// Read in all waypoints from waypoints.json
		const possibleWaypoints = getWaypointsFromJSON();

		// Try many combinations of waypoints until a valid route is found
		for (let i = 0; i < possibleWaypoints.length * possibleWaypoints.length; i++) {
			// Push the start aerodrome to points in order to calculate the distance from it
			points = [];
			points.push({
				waypointType: WaypointType.Aerodrome,
				location: startAerodrome.getLocation(),
				name: 'startAerodrome'
			});
			let totalDistance = 0.0;

			// Add waypoints until the route is too long or contains too many points
			for (let i = 1; i < MAX_AIRBORNE_ROUTE_POINTS; i++) {
				const waypoint = possibleWaypoints[seed.scenarioSeed % possibleWaypoints.length];
				const distance = haversineDistance(points[points.length - 1]?.location, waypoint.location);

				// If route is too long or contains too many points, stop adding points
				if (
					totalDistance + distance >
						MAX_ROUTE_DISTANCE - haversineDistance(waypoint.location, endAerodrome.getLocation()) ||
					points.length - 1 >= MAX_AIRBORNE_ROUTE_POINTS
				) {
					break;
				}

				// Route valid with this waypoint - add it
				points.push(waypoint);
				totalDistance += distance;
			}

			// Suitable route found
			if (points.length >= airborneWaypoints) {
				break;
			}

			// No suitable route found - try again
		}

		// Remove the start aerodrome
		points.shift();

		// Add events at each point
		let emergencyGenerated: boolean = false;
		const routePoints: RoutePoint[] = [];

		return routePoints;
	}

	public static getEndAerodromeRoutePoints(seed: Seed): RoutePoint[] {
		const stages: RoutePoint[] = [];

		return stages;
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
		const possibleEndAerodromes: (ControlledAerodrome | UncontrolledAerodrome)[] = [];

		if (seed.scenarioSeed % 2 === 0) {
			possibleEndAerodromes.push(...UncontrolledAerodrome.getAerodromesFromJSON());
		} else {
			possibleEndAerodromes.push(...ControlledAerodrome.getAerodromesFromJSON());
		}

		let endAerodrome: ControlledAerodrome | UncontrolledAerodrome =
			possibleEndAerodromes[seed.scenarioSeed % possibleEndAerodromes.length];
		let endAerodromeFound: boolean = false;

		// If the end aerodrome is too far from the start aerodrome, find a new one
		for (let i = 0; i < possibleEndAerodromes.length; i++) {
			const distance = haversineDistance(startAerodrome.getLocation(), endAerodrome.getLocation());

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
	public generateRoute(seed: Seed, airborneWaypoints: number, emergency: boolean): RoutePoint[] {
		this.points.push(...Route.getStartAerodromeRoutePoints(seed));

		this.points.push(...Route.getAirborneRoutePoints(seed, airborneWaypoints, emergency));

		this.points.push(...Route.getEndAerodromeRoutePoints(seed));

		// console.log('Route points:');
		// for (let i = 0; i < this.points.length; i++) {
		// 	console.log(this.points[i]);
		// }

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
