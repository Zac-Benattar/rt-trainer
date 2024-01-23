import waypoints from '../../data/waypoints.json';
import { haversineDistance } from './utils';
import { WaypointType, type Pose, type Waypoint } from './SimulatorTypes';
import type Seed from './Seed';
import {
	StartUpPoint,
	getParkedInitialControlledUpdateData,
	getParkedMadeContactControlledUpdateData,
	getParkedInitialUncontrolledUpdateData,
	getParkedMadeContactUncontrolledUpdateData,
	AirbornePoint,
	TaxiPoint,
	TakeOffPoint,
	ClimbOutPoint,
	RoutePoint,
	type StartAerodromePoint,
	type LandingPoint,
	InboundForJoinPoint,
	CircuitAndLandingPoint,
	LandingToParkedPoint
} from './RoutePoints';
import {
	CircuitAndLandingStage,
	ClimbOutStage,
	InboundForJoinStage,
	LandingToParkedStage,
	StartUpStage,
	TakeOffStage,
	TaxiStage
} from './RouteStages';
import { ControlledAerodrome, UncontrolledAerodrome } from './Aerodrome';

const MAX_AERODROME_DISTANCE = 100000; // 100km
const MAX_ROUTE_DISTANCE = 300000; // 300km
const MAX_AIRBORNE_ROUTE_POINTS = 5;

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
	Start up,
    Taxiing,
    TakeOff,
	Climb Out of the start aerodrome's airspace.
	 */
	public static getStartAerodromeRoutePoints(seed: Seed): StartAerodromePoint[] {
		const stages: StartAerodromePoint[] = [];
		const startAerodrome: ControlledAerodrome | UncontrolledAerodrome =
			Route.getStartAerodrome(seed);
		const startPoints = startAerodrome.getStartPoints();
		const startPointIndex = seed.scenarioSeed % startPoints.length;

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

		if (startAerodrome instanceof ControlledAerodrome) {
			const radioCheck = new StartUpPoint(
				StartUpStage.RadioCheck,
				parkedPose,
				getParkedInitialControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(radioCheck);

			const requestDepartInfo = new StartUpPoint(
				StartUpStage.DepartureInformationRequest,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(requestDepartInfo);

			const readbackDepartInfo = new StartUpPoint(
				StartUpStage.ReadbackDepartureInformation,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(readbackDepartInfo);

			const taxiRequest = new TaxiPoint(
				TaxiStage.TaxiRequest,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(taxiRequest);

			const taxiClearanceReadback = new TaxiPoint(
				TaxiStage.TaxiClearanceReadback,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(taxiClearanceReadback);

			const ReadyForDeparture = new TakeOffPoint(
				TakeOffStage.ReadyForDeparture,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(ReadyForDeparture);

			const readbackAfterDepartureInformation = new TakeOffPoint(
				TakeOffStage.ReadbackAfterDepartureInformation,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(readbackAfterDepartureInformation);

			const readbackClearance = new TakeOffPoint(
				TakeOffStage.ReadbackClearance,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(readbackClearance);

			const readbackNextContact = new ClimbOutPoint(
				ClimbOutStage.ReadbackNextContact,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(readbackNextContact);

			const contactNextFrequency = new ClimbOutPoint(
				ClimbOutStage.ContactNextFrequency,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(contactNextFrequency);

			const acknowledgeNewFrequencyRequest = new ClimbOutPoint(
				ClimbOutStage.AcknowledgeNewFrequencyRequest,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(acknowledgeNewFrequencyRequest);

			const reportLeavingZone = new ClimbOutPoint(
				ClimbOutStage.ReportLeavingZone,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(reportLeavingZone);
		} else {
			const radioCheck = new StartUpPoint(
				StartUpStage.RadioCheck,
				parkedPose,
				getParkedInitialUncontrolledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(radioCheck);

			const requestTaxiInformation = new TaxiPoint(
				TaxiStage.RequestTaxiInformation,
				parkedPose,
				getParkedInitialUncontrolledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(requestTaxiInformation);

			const readbackTaxiInformation = new TaxiPoint(
				TaxiStage.AnnounceTaxiing,
				parkedPose,
				getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(readbackTaxiInformation);

			const readyForDeparture = new TakeOffPoint(
				TakeOffStage.ReadyForDeparture,
				parkedPose,
				getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(readyForDeparture);

			const acknowledgeTraffic = new TakeOffPoint(
				TakeOffStage.AcknowledgeTraffic,
				parkedPose,
				getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(acknowledgeTraffic);

			const reportTakingOff = new TakeOffPoint(
				TakeOffStage.AnnounceTakingOff,
				parkedPose,
				getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(reportTakingOff);

			const reportLeavingZone = new ClimbOutPoint(
				ClimbOutStage.ReportLeavingZone,
				parkedPose,
				getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome),
				parkedWaypoint
			);
			stages.push(reportLeavingZone);
		}

		return stages;
	}

	public static getAirborneRoutePoints(
		seed: Seed,
		airborneWaypoints: number,
		emergency: boolean
	): AirbornePoint[] {
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
		const routePoints: AirbornePoint[] = [];

		return routePoints;
	}

	public static getEndAerodromeRoutePoints(seed: Seed): LandingPoint[] {
		const stages: LandingPoint[] = [];
		const endAerodrome: ControlledAerodrome | UncontrolledAerodrome = Route.getEndAerodrome(seed);
		const parkingPoints = endAerodrome.getStartPoints();
		const parkingPointIndex = seed.scenarioSeed % parkingPoints.length;

		const parkedPose: Pose = {
			location: parkingPoints[parkingPointIndex].location,
			heading: parkingPoints[parkingPointIndex].heading,
			altitude: endAerodrome.getAltitude(),
			airSpeed: 0.0
		};

		const parkedWaypoint: Waypoint = {
			waypointType: WaypointType.Aerodrome,
			location: endAerodrome.getLocation(),
			name: endAerodrome.getShortName()
		};

		if (endAerodrome instanceof ControlledAerodrome) {
			const requestJoin = new InboundForJoinPoint(
				InboundForJoinStage.RequestJoin,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(requestJoin);

			const reportDetails = new InboundForJoinPoint(
				InboundForJoinStage.ReportDetails,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportDetails);

			const readbackJoinClearance = new InboundForJoinPoint(
				InboundForJoinStage.ReadbackJoinClearance,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(readbackJoinClearance);

			const reportAirodromeInSight = new InboundForJoinPoint(
				InboundForJoinStage.ReportAirodromeInSight,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportAirodromeInSight);

			const contactTower = new InboundForJoinPoint(
				InboundForJoinStage.ContactTower,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(contactTower);

			const reportStatus = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReportStatus,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportStatus);

			const readbackLandingInformation = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReadbackLandingInformation,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(readbackLandingInformation);

			const reportDescending = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReportDescending,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportDescending);

			const wilcoReportDownwind = new CircuitAndLandingPoint(
				CircuitAndLandingStage.WilcoReportDownwind,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(wilcoReportDownwind);

			const reportDownwind = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReportDownwind,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportDownwind);

			const wilcoFollowTraffic = new CircuitAndLandingPoint(
				CircuitAndLandingStage.WilcoFollowTraffic,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(wilcoFollowTraffic);

			const reportFinal = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReportFinal,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportFinal);

			const readbackContinueApproach = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReadbackContinueApproach,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(readbackContinueApproach);

			const readbackLandingClearance = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReadbackLandingClearance,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(readbackLandingClearance);

			const readbackVacateRunwayRequest = new LandingToParkedPoint(
				LandingToParkedStage.ReadbackVacateRunwayRequest,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(readbackVacateRunwayRequest);

			const reportVacatedRunway = new LandingToParkedPoint(
				LandingToParkedStage.ReportVacatedRunway,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportVacatedRunway);

			const readbackTaxiInformation = new LandingToParkedPoint(
				LandingToParkedStage.ReadbackTaxiInformation,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(readbackTaxiInformation);
		} else {
			const requestJoin = new InboundForJoinPoint(
				InboundForJoinStage.RequestJoin,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(requestJoin);

			const reportDetails = new InboundForJoinPoint(
				InboundForJoinStage.ReportDetails,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportDetails);

			const reportCrosswindJoin = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReportCrosswindJoin,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportCrosswindJoin);

			const reportDownwind = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReportDownwind,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportDownwind);

			const reportFinal = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReportFinal,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportFinal);

			const readbackContinueApproach = new CircuitAndLandingPoint(
				CircuitAndLandingStage.ReadbackContinueApproach,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(readbackContinueApproach);

			const reportVacatedRunway = new LandingToParkedPoint(
				LandingToParkedStage.ReportVacatedRunway,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportVacatedRunway);

			const reportTaxiing = new LandingToParkedPoint(
				LandingToParkedStage.ReportTaxiing,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome),
				parkedWaypoint
			);
			stages.push(reportTaxiing);
		}

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
