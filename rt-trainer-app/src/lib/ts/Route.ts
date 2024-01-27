import waypoints from '../../data/waypoints.json';
import { haversineDistance, lerpLocation } from './utils';
import { type Pose, EmergencyType, WaypointType, type Waypoint } from './RouteTypes';
import type Seed from './Seed';
import {
	getParkedInitialControlledUpdateData,
	getParkedMadeContactControlledUpdateData,
	getParkedInitialUncontrolledUpdateData,
	getParkedMadeContactUncontrolledUpdateData
} from './RoutePoints';
import RoutePoint from './RoutePoints';
import {
	ChangeZoneStage,
	CircuitAndLandingStage,
	ClimbOutStage,
	InboundForJoinStage,
	LandingToParkedStage,
	PanPanStage,
	StartUpStage,
	TakeOffStage,
	TaxiStage
} from './RouteStages';
import { ControlledAerodrome, UncontrolledAerodrome } from './Aerodrome';

const MAX_AERODROME_DISTANCE = 100000; // 100km
const MAX_ROUTE_DISTANCE = 300000; // 300km
const MAX_AIRBORNE_ROUTE_POINTS = 15;

function getWaypointsFromJSON(): Waypoint[] {
	const airborneWaypoints: Waypoint[] = [];

	waypoints.forEach((waypoint) => {
		airborneWaypoints.push({
			waypointType: WaypointType.VOR,
			name: waypoint.name,
			lat: waypoint.lat,
			long: waypoint.long
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
	public static getStartAerodromeRoutePoints(seed: Seed): RoutePoint[] {
		const stages: RoutePoint[] = [];
		const startAerodrome: ControlledAerodrome | UncontrolledAerodrome =
			Route.getStartAerodrome(seed);
		const startPoints = startAerodrome.getStartPoints();
		const startPointIndex = seed.scenarioSeed % startPoints.length;
		const holdingPoint = startAerodrome.getTakeoffRunwayTaxiwayHoldingPoint(seed);

		const parkedPose: Pose = {
			lat: startPoints[startPointIndex].lat,
			long: startPoints[startPointIndex].long,
			heading: startPoints[startPointIndex].heading,
			altitude: startAerodrome.getAltitude(),
			airSpeed: 0.0
		};

		const taxiPose: Pose = {
			lat: holdingPoint.lat,
			long: holdingPoint.long,
			heading: holdingPoint.heading,
			altitude: startAerodrome.getAltitude(),
			airSpeed: 0.0
		};

		const onRunwayPose: Pose = {
			lat: startAerodrome.getTakeoffRunway(seed).startLat,
			long: startAerodrome.getTakeoffRunway(seed).startLong,
			heading: startAerodrome.getTakeoffRunway(seed).heading,
			altitude: startAerodrome.getAltitude(),
			airSpeed: 0.0
		};

		if (startAerodrome instanceof ControlledAerodrome) {
			const radioCheck = new RoutePoint(
				StartUpStage.RadioCheck,
				parkedPose,
				getParkedInitialControlledUpdateData(seed, startAerodrome)
			);
			stages.push(radioCheck);

			const requestDepartInfo = new RoutePoint(
				StartUpStage.DepartureInformationRequest,
				parkedPose,
				getParkedInitialControlledUpdateData(seed, startAerodrome)
			);
			stages.push(requestDepartInfo);

			const readbackDepartInfo = new RoutePoint(
				StartUpStage.ReadbackDepartureInformation,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome)
			);
			stages.push(readbackDepartInfo);

			const taxiRequest = new RoutePoint(
				TaxiStage.TaxiRequest,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome)
			);
			stages.push(taxiRequest);

			const taxiClearanceReadback = new RoutePoint(
				TaxiStage.TaxiClearanceReadback,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome)
			);
			stages.push(taxiClearanceReadback);

			const ReadyForDeparture = new RoutePoint(
				TakeOffStage.ReadyForDeparture,
				taxiPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome)
			);
			stages.push(ReadyForDeparture);

			const readbackAfterDepartureInformation = new RoutePoint(
				TakeOffStage.ReadbackAfterDepartureInformation,
				taxiPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome)
			);
			stages.push(readbackAfterDepartureInformation);

			const readbackClearance = new RoutePoint(
				TakeOffStage.ReadbackClearance,
				taxiPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome)
			);
			stages.push(readbackClearance);

			const readbackNextContact = new RoutePoint(
				ClimbOutStage.ReadbackNextContact,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome)
			);
			stages.push(readbackNextContact);

			const contactNextFrequency = new RoutePoint(
				ClimbOutStage.ContactNextFrequency,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome)
			);
			stages.push(contactNextFrequency);

			const acknowledgeNewFrequencyRequest = new RoutePoint(
				ClimbOutStage.AcknowledgeNewFrequencyRequest,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome)
			);
			stages.push(acknowledgeNewFrequencyRequest);

			const reportLeavingZone = new RoutePoint(
				ClimbOutStage.ReportLeavingZone,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, startAerodrome)
			);
			stages.push(reportLeavingZone);
		} else {
			const radioCheck = new RoutePoint(
				StartUpStage.RadioCheck,
				parkedPose,
				getParkedInitialUncontrolledUpdateData(seed, startAerodrome)
			);
			stages.push(radioCheck);

			const requestTaxiInformation = new RoutePoint(
				TaxiStage.RequestTaxiInformation,
				parkedPose,
				getParkedInitialUncontrolledUpdateData(seed, startAerodrome)
			);
			stages.push(requestTaxiInformation);

			const readbackTaxiInformation = new RoutePoint(
				TaxiStage.AnnounceTaxiing,
				parkedPose,
				getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome)
			);
			stages.push(readbackTaxiInformation);

			const readyForDeparture = new RoutePoint(
				TakeOffStage.ReadyForDeparture,
				taxiPose,
				getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome)
			);
			stages.push(readyForDeparture);

			const acknowledgeTraffic = new RoutePoint(
				TakeOffStage.AcknowledgeTraffic,
				taxiPose,
				getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome)
			);
			stages.push(acknowledgeTraffic);

			const reportTakingOff = new RoutePoint(
				TakeOffStage.AnnounceTakingOff,
				onRunwayPose,
				getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome)
			);
			stages.push(reportTakingOff);

			const reportLeavingZone = new RoutePoint(
				ClimbOutStage.ReportLeavingZone,
				parkedPose,
				getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome)
			);
			stages.push(reportLeavingZone);
		}

		return stages;
	}

	public static getAirborneWaypoints(seed: Seed, numAirborneWaypoints: number): Waypoint[] {
		const startAerodrome: ControlledAerodrome | UncontrolledAerodrome =
			Route.getStartAerodrome(seed);
		const takeOffRunwayPosition = startAerodrome.getTakeoffRunway(seed).getCenterPoint();
		const endAerodrome: ControlledAerodrome | UncontrolledAerodrome = Route.getEndAerodrome(seed);
		const landingRunwayPosition = endAerodrome.getLandingRunway(seed).getCenterPoint();

		// Read in all waypoints from waypoints.json
		const possibleWaypoints = getWaypointsFromJSON();

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
					possibleWaypoints[(seed.scenarioSeed * j * (i + 1)) % possibleWaypoints.length];
				const distance = haversineDistance(
					waypoints[waypoints.length - 1]?.lat,
					waypoints[waypoints.length - 1]?.long,
					waypoint.lat,
					waypoint.long
				);

				// If route is too long or contains too many points, stop adding points
				if (
					totalDistance + distance >
						MAX_ROUTE_DISTANCE -
							haversineDistance(
								waypoint.lat,
								waypoint.long,
								landingRunwayPosition[0],
								landingRunwayPosition[1]
							) ||
					waypoints.length - 1 >= numAirborneWaypoints
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

	public static getAirborneRoutePoints(
		seed: Seed,
		numAirborneWaypoints: number,
		hasEmergency: boolean
	): RoutePoint[] {
		const waypoints: Waypoint[] = this.getAirborneWaypoints(seed, numAirborneWaypoints);

		// Add events at each point
		const routePoints: RoutePoint[] = [];
		const endStageIndexes: number[] = [];
		for (let i = 0; i < waypoints.length; i++) {
			const waypoint = waypoints[i];
			const pose: Pose = {
				lat: waypoint.lat,
				long: waypoint.long,
				heading: 0.0,
				altitude: 0.0,
				airSpeed: 0.0
			};

			const requestFrequencyChange = new RoutePoint(ChangeZoneStage.RequestFrequencyChange, pose, {
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: 0,
				currentTransponderFrequency: 0,
				emergency: EmergencyType.None
			});
			routePoints.push(requestFrequencyChange);

			const acknowledgeApproval = new RoutePoint(ChangeZoneStage.AcknowledgeApproval, pose, {
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: 0,
				currentTransponderFrequency: 0,
				emergency: EmergencyType.None
			});
			routePoints.push(acknowledgeApproval);

			const contactNewFrequency = new RoutePoint(ChangeZoneStage.ContactNewFrequency, pose, {
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: 0,
				currentTransponderFrequency: 0,
				emergency: EmergencyType.None
			});
			routePoints.push(contactNewFrequency);

			const passMessage = new RoutePoint(ChangeZoneStage.PassMessage, pose, {
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: 0,
				currentTransponderFrequency: 0,
				emergency: EmergencyType.None
			});
			routePoints.push(passMessage);

			const squawk = new RoutePoint(ChangeZoneStage.Squawk, pose, {
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: 0,
				currentTransponderFrequency: 0,
				emergency: EmergencyType.None
			});
			routePoints.push(squawk);

			const readbackApproval = new RoutePoint(ChangeZoneStage.ReadbackApproval, pose, {
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: 0,
				currentTransponderFrequency: 0,
				emergency: EmergencyType.None
			});
			routePoints.push(readbackApproval);
			endStageIndexes.push(routePoints.length - 1);
		}

		if (hasEmergency) {
			// Add emergency before a random point
			const emergencyPointIndex = (seed.scenarioSeed % (waypoints.length - 1)) + 1;
			const emergencyRoutePointIndex = endStageIndexes[emergencyPointIndex] + 1;

			console.log('Route Points: ' + routePoints.length);
			console.log('Emergency Route Point Index: ' + emergencyRoutePointIndex);
			let emergencyType: EmergencyType = EmergencyType.None;

			// Get a random emergency type which is not none
			const index = seed.scenarioSeed % (Object.keys(EmergencyType).length - 1);
			emergencyType = Object.values(EmergencyType)[index + 1];

			// Generate the points to add on the route
			// Get the percentage of the distance between the two points to add the emergency at
			// At least 5% of the distance must be between the two points, and at most 95%
			const lerpPercentage: number = (seed.scenarioSeed % 90) / 90 + 0.05;
			const emergencyLocation = lerpLocation(
				waypoints[emergencyPointIndex].lat,
				waypoints[emergencyPointIndex].long,
				waypoints[emergencyPointIndex - 1].lat,
				waypoints[emergencyPointIndex - 1].long,
				lerpPercentage
			);

			const emergencyPose: Pose = {
				lat: emergencyLocation.lat,
				long: emergencyLocation.long,
				heading: 0.0,
				altitude: 0.0,
				airSpeed: 0.0
			};

			const declareEmergency = new RoutePoint(PanPanStage.DeclareEmergency, emergencyPose, {
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: 0,
				currentTransponderFrequency: 0,
				emergency: emergencyType
			});
			routePoints.splice(emergencyRoutePointIndex, 0, declareEmergency);

			const wilcoInstructions = new RoutePoint(PanPanStage.WilcoInstructions, emergencyPose, {
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: 0,
				currentTransponderFrequency: 0,
				emergency: emergencyType
			});
			routePoints.splice(emergencyRoutePointIndex + 1, 0, wilcoInstructions);

			const cancelPanPan = new RoutePoint(PanPanStage.CancelPanPan, emergencyPose, {
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: 0,
				currentTransponderFrequency: 0,
				emergency: emergencyType
			});
			routePoints.splice(emergencyRoutePointIndex + 2, 0, cancelPanPan);
		}

		return routePoints;
	}

	public static getEndAerodromeRoutePoints(seed: Seed): RoutePoint[] {
		const stages: RoutePoint[] = [];
		const endAerodrome: ControlledAerodrome | UncontrolledAerodrome = Route.getEndAerodrome(seed);
		const parkingPoints = endAerodrome.getStartPoints();
		const parkingPointIndex = seed.scenarioSeed % parkingPoints.length;

		const parkedPose: Pose = {
			lat: parkingPoints[parkingPointIndex].lat,
			long: parkingPoints[parkingPointIndex].long,
			heading: parkingPoints[parkingPointIndex].heading,
			altitude: endAerodrome.getAltitude(),
			airSpeed: 0.0
		};

		if (endAerodrome instanceof ControlledAerodrome) {
			const requestJoin = new RoutePoint(
				InboundForJoinStage.RequestJoin,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(requestJoin);

			const reportDetails = new RoutePoint(
				InboundForJoinStage.ReportDetails,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportDetails);

			const readbackJoinClearance = new RoutePoint(
				InboundForJoinStage.ReadbackJoinClearance,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(readbackJoinClearance);

			const reportAirodromeInSight = new RoutePoint(
				InboundForJoinStage.ReportAirodromeInSight,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportAirodromeInSight);

			const contactTower = new RoutePoint(
				InboundForJoinStage.ContactTower,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(contactTower);

			const reportStatus = new RoutePoint(
				CircuitAndLandingStage.ReportStatus,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportStatus);

			const readbackLandingInformation = new RoutePoint(
				CircuitAndLandingStage.ReadbackLandingInformation,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(readbackLandingInformation);

			const reportDescending = new RoutePoint(
				CircuitAndLandingStage.ReportDescending,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportDescending);

			const wilcoReportDownwind = new RoutePoint(
				CircuitAndLandingStage.WilcoReportDownwind,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(wilcoReportDownwind);

			const reportDownwind = new RoutePoint(
				CircuitAndLandingStage.ReportDownwind,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportDownwind);

			const wilcoFollowTraffic = new RoutePoint(
				CircuitAndLandingStage.WilcoFollowTraffic,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(wilcoFollowTraffic);

			const reportFinal = new RoutePoint(
				CircuitAndLandingStage.ReportFinal,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportFinal);

			const readbackContinueApproach = new RoutePoint(
				CircuitAndLandingStage.ReadbackContinueApproach,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(readbackContinueApproach);

			const readbackLandingClearance = new RoutePoint(
				CircuitAndLandingStage.ReadbackLandingClearance,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(readbackLandingClearance);

			const readbackVacateRunwayRequest = new RoutePoint(
				LandingToParkedStage.ReadbackVacateRunwayRequest,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(readbackVacateRunwayRequest);

			const reportVacatedRunway = new RoutePoint(
				LandingToParkedStage.ReportVacatedRunway,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportVacatedRunway);

			const readbackTaxiInformation = new RoutePoint(
				LandingToParkedStage.ReadbackTaxiInformation,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(readbackTaxiInformation);
		} else {
			const requestJoin = new RoutePoint(
				InboundForJoinStage.RequestJoin,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(requestJoin);

			const reportDetails = new RoutePoint(
				InboundForJoinStage.ReportDetails,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportDetails);

			const reportCrosswindJoin = new RoutePoint(
				CircuitAndLandingStage.ReportCrosswindJoin,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportCrosswindJoin);

			const reportDownwind = new RoutePoint(
				CircuitAndLandingStage.ReportDownwind,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportDownwind);

			const reportFinal = new RoutePoint(
				CircuitAndLandingStage.ReportFinal,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportFinal);

			const readbackContinueApproach = new RoutePoint(
				CircuitAndLandingStage.ReadbackContinueApproach,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(readbackContinueApproach);

			const reportVacatedRunway = new RoutePoint(
				LandingToParkedStage.ReportVacatedRunway,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
			);
			stages.push(reportVacatedRunway);

			const reportTaxiing = new RoutePoint(
				LandingToParkedStage.ReportTaxiing,
				parkedPose,
				getParkedMadeContactControlledUpdateData(seed, endAerodrome)
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
