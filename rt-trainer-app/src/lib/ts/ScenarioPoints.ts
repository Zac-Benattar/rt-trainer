import type { SimulatorUpdateData } from './ServerClientTypes';
import { EmergencyType, type Pose } from './ScenarioTypes';
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
} from './ScenarioStages';
import {
	findIntersections,
	simpleHash,
	type Intersection,
	lerp,
	getRandomFrequency,
	getRandomSqwuakCode,
	calculateDistanceAlongRoute,
	getSeededTimeInMinutes
} from './utils';
import * as turf from '@turf/turf';
import type Airport from './AeronauticalClasses/Airport';
import type Waypoint from './AeronauticalClasses/Waypoint';
import type Airspace from './AeronauticalClasses/Airspace';
import type { Position } from '@turf/turf';

const AIRCRAFT_AVERAGE_SPEED = 125; // knots
const NAUTICAL_MILE = 1852;
const FLIGHT_TIME_MULTIPLIER = 1.3;

/* A point on the route used in generation. Not necissarily visible to the user */
export default class ScenarioPoint {
	index: number;
	stage: string;
	pose: Pose;
	updateData: SimulatorUpdateData;
	nextWaypointIndex: number;
	timeAtPoint: number;
	distanceAlongRoute: number;

	constructor(
		index: number,
		stage: string,
		pose: Pose,
		updateData: SimulatorUpdateData,
		nextWaypointIndex: number,
		timeAtPoint: number,
		distanceAlongRoute: number
	) {
		this.index = index;
		this.stage = stage;
		this.pose = pose;
		this.updateData = updateData;
		this.nextWaypointIndex = nextWaypointIndex;
		this.timeAtPoint = timeAtPoint;
		this.distanceAlongRoute = distanceAlongRoute;
	}
}

export function getParkedInitialControlledUpdateData(
	seed: number,
	airport: Airport
): SimulatorUpdateData {
	let name = airport.getParkedFrequency()?.name;
	if (airport.getParkedFrequency()?.name == 'INFO') {
		name = airport.getShortName() + ' Information';
	}
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: name,
		currentTargetFrequency: airport.getParkedFrequency()?.value,
		currentTransponderFrequency: '7000',
		currentPressure: 1013,
		emergency: EmergencyType.None
	};
}

export function getParkedMadeContactControlledUpdateData(
	seed: number,
	airport: Airport
): SimulatorUpdateData {
	let name = airport.getParkedFrequency()?.name;
	if (airport.getParkedFrequency()?.name == 'INFO') {
		name = airport.getShortName() + ' Information';
	}
	return {
		callsignModified: true, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: name,
		currentTargetFrequency: airport.getParkedFrequency()?.value,
		currentTransponderFrequency: '7000',
		currentPressure: 1013,
		emergency: EmergencyType.None
	};
}

export function getParkedInitialUncontrolledUpdateData(
	seed: number,
	airport: Airport
): SimulatorUpdateData {
	let name = airport.getParkedFrequency()?.name;
	if (airport.getParkedFrequency()?.name == 'INFO') {
		name = airport.getShortName() + ' Information';
	}
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: name,
		currentTargetFrequency: airport.getParkedFrequency()?.value,
		currentTransponderFrequency: '7000',
		currentPressure: 1013,
		emergency: EmergencyType.None
	};
}

export function getParkedMadeContactUncontrolledUpdateData(
	seed: number,
	airport: Airport
): SimulatorUpdateData {
	let name = airport.getParkedFrequency()?.name;
	if (airport.getParkedFrequency()?.name == 'INFO') {
		name = airport.getShortName() + ' Information';
	}
	return {
		callsignModified: true, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: name,
		currentTargetFrequency: airport.getParkedFrequency()?.value,
		currentTransponderFrequency: '7000',
		currentPressure: 1013,
		emergency: EmergencyType.None
	};
}

/* Get the start aerodrome states. This includes all stages of:     
	Start up,
    Taxiing,
    TakeOff,
	Climb Out of the start aerodrome's airspace.
	 */
export function getStartAirportScenarioPoints(
	seedString: string,
	waypoints: Waypoint[],
	airspaces: Airspace[],
	startAirport: Airport
): ScenarioPoint[] {
	let pointIndex = 0;
	const seed = simpleHash(seedString);
	const stages: ScenarioPoint[] = [];
	const startAerodromeTime: number = startAirport.getStartTime(seed);
	const takeoffRunway = startAirport.getTakeoffRunway(seed);
	const initialRouteHeading = Math.round(
		turf.bearing(waypoints[0].location, waypoints[1].location)
	);

	const waypointCoords = waypoints.map((waypoint) => waypoint.location);

	const groundedPose: Pose = {
		position: startAirport.coordinates,
		trueHeading: 0,
		altitude: 0,
		airSpeed: 0.0
	};

	const takingOffPosition = startAirport.getPointAlongTakeoffRunwayVector(seed, 0);
	const takingOffPose: Pose = {
		position: takingOffPosition,
		trueHeading: takeoffRunway.trueHeading,
		altitude: 0,
		airSpeed: 0.0
	};

	const climbingOutPosition = startAirport.getPointAlongTakeoffRunwayVector(seed, 1.0);
	const climbingOutPose: Pose = {
		position: climbingOutPosition,
		trueHeading: takeoffRunway.trueHeading,
		altitude: 1200,
		airSpeed: 70.0
	};

	const takeoffAirspace = airspaces.find((x) => x.name.includes(startAirport.name));

	if (startAirport.isControlled() && takeoffAirspace) {
		const firstRouteSegment = [waypoints[0].location, waypoints[1].location];
		const leavingZonePosition: Position = findIntersections(firstRouteSegment, [takeoffAirspace])[0]
			.position;
		const leavingZonePose: Pose = {
			position: leavingZonePosition,
			trueHeading: initialRouteHeading,
			altitude: 1200,
			airSpeed: 70.0
		};
		const radioCheck = new ScenarioPoint(
			pointIndex++,
			StartUpStage.RadioCheck,
			groundedPose,
			getParkedInitialControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime,
			0
		);
		stages.push(radioCheck);

		const requestDepartInfo = new ScenarioPoint(
			pointIndex++,
			StartUpStage.DepartureInformationRequest,
			groundedPose,
			getParkedInitialControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime,
			0
		);
		stages.push(requestDepartInfo);

		const readbackDepartInfo = new ScenarioPoint(
			pointIndex++,
			StartUpStage.ReadbackDepartureInformation,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 1,
			0
		);
		stages.push(readbackDepartInfo);

		const taxiRequest = new ScenarioPoint(
			pointIndex++,
			TaxiStage.TaxiRequest,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 1,
			0
		);
		stages.push(taxiRequest);

		const taxiClearanceReadback = new ScenarioPoint(
			pointIndex++,
			TaxiStage.TaxiClearanceReadback,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 5,
			0
		);
		stages.push(taxiClearanceReadback);

		const ReadyForDeparture = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.ReadyForDeparture,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 8,
			0
		);
		stages.push(ReadyForDeparture);

		const readbackAfterDepartureInformation = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.ReadbackAfterDepartureInformation,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 9,
			0
		);
		stages.push(readbackAfterDepartureInformation);

		const readbackClearance = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.ReadbackClearance,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 9,
			0
		);
		stages.push(readbackClearance);

		const readbackNextContact = new ScenarioPoint(
			pointIndex++,
			ClimbOutStage.ReadbackNextContact,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 12,
			calculateDistanceAlongRoute(waypointCoords, climbingOutPose.position)
		);
		stages.push(readbackNextContact);

		const contactNextFrequency = new ScenarioPoint(
			pointIndex++,
			ClimbOutStage.ContactNextFrequency,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 15,
			calculateDistanceAlongRoute(waypointCoords, climbingOutPose.position)
		);
		stages.push(contactNextFrequency);

		const acknowledgeNewFrequencyRequest = new ScenarioPoint(
			pointIndex++,
			ClimbOutStage.AcknowledgeNewFrequencyRequest,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 15,
			calculateDistanceAlongRoute(waypointCoords, climbingOutPose.position)
		);
		stages.push(acknowledgeNewFrequencyRequest);

		const reportLeavingZone = new ScenarioPoint(
			pointIndex++,
			ClimbOutStage.ReportLeavingZone,
			leavingZonePose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 18,
			calculateDistanceAlongRoute(waypointCoords, leavingZonePose.position)
		);
		stages.push(reportLeavingZone);
	} else {
		const firstRouteSegment = [waypoints[0].location, waypoints[1].location];
		let leavingZonePosition: Position = [0, 0];
		if (takeoffAirspace)
			leavingZonePosition = findIntersections(firstRouteSegment, [takeoffAirspace])[0].position;
		// 3.3 should be 4 but this avoids a bug for the demo
		else
			leavingZonePosition = turf.destination(waypoints[0].location, 3.3, initialRouteHeading, {
				units: 'kilometers'
			}).geometry.coordinates;

		const leavingZonePose: Pose = {
			position: leavingZonePosition,
			trueHeading: initialRouteHeading,
			altitude: 1200,
			airSpeed: 70.0
		};

		const radioCheck = new ScenarioPoint(
			pointIndex++,
			StartUpStage.RadioCheck,
			groundedPose,
			getParkedInitialUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime,
			0
		);
		stages.push(radioCheck);

		const requestTaxiInformation = new ScenarioPoint(
			pointIndex++,
			TaxiStage.RequestTaxiInformation,
			groundedPose,
			getParkedInitialUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 1,
			0
		);
		stages.push(requestTaxiInformation);

		const readbackTaxiInformation = new ScenarioPoint(
			pointIndex++,
			TaxiStage.AnnounceTaxiing,
			groundedPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 1,
			0
		);
		stages.push(readbackTaxiInformation);

		const readyForDeparture = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.ReadyForDeparture,
			groundedPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 8,
			0
		);
		stages.push(readyForDeparture);

		const acknowledgeTraffic = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.AcknowledgeTraffic,
			groundedPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 9,
			0
		);
		stages.push(acknowledgeTraffic);

		const reportTakingOff = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.AnnounceTakingOff,
			takingOffPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 10,
			calculateDistanceAlongRoute(waypointCoords, takingOffPose.position)
		);
		stages.push(reportTakingOff);

		const reportLeavingZone = new ScenarioPoint(
			pointIndex++,
			ClimbOutStage.AnnounceLeavingZone,
			leavingZonePose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 15,
			calculateDistanceAlongRoute(waypointCoords, leavingZonePose.position)
		);
		stages.push(reportLeavingZone);
	}

	return stages;
}

export function getEndAirportScenarioPoints(
	pointIndex: number,
	seedString: string,
	waypoints: Waypoint[],
	airspaces: Airspace[],
	endAirport: Airport,
	previousScenarioPoint: ScenarioPoint
): ScenarioPoint[] {
	const seed = simpleHash(seedString);
	const stages: ScenarioPoint[] = [];
	const previousPointTime = previousScenarioPoint.timeAtPoint;
	const distanceToLandingAirportFromPrevPoint = turf.distance(
		previousScenarioPoint.pose.position,
		endAirport.coordinates
	);

	const waypointCoords = waypoints.map((waypoint) => waypoint.location);

	const landingTime =
		previousPointTime +
		10 +
		Math.round(
			(distanceToLandingAirportFromPrevPoint / AIRCRAFT_AVERAGE_SPEED / NAUTICAL_MILE) *
				FLIGHT_TIME_MULTIPLIER
		);
	const landingRunway = endAirport.getLandingRunway(seed);

	const parkedPose: Pose = {
		position: endAirport.coordinates,
		trueHeading: 0,
		altitude: 0,
		airSpeed: 0.0
	};

	/* Safety Sense: "When arriving at an ATC aerodrome you should call 15 NM or 5 minutes
	 flying time from the ATZ boundary (whichever is greater)"*/
	const requestJoinDistance = -16.0 + (seed % 20) * 0.1;
	const requestJoinLocation = endAirport.getPointAlongLandingRunwayVector(
		seed,
		requestJoinDistance
	);
	const requestJoinPose: Pose = {
		position: requestJoinLocation,
		trueHeading: landingRunway.trueHeading,
		altitude: 1200,
		airSpeed: 84.0
	};
	const requestJoinDistanceAlongRoute = calculateDistanceAlongRoute(
		waypointCoords,
		requestJoinLocation
	);

	const followTrafficDistance = -7.0 + (seed % 20) * 0.1;
	const followTrafficLocation = endAirport.getPointAlongLandingRunwayVector(
		seed,
		-followTrafficDistance
	);
	const followTrafficPose: Pose = {
		position: followTrafficLocation,
		trueHeading: landingRunway.trueHeading,
		altitude: 1200,
		airSpeed: 84.0
	};
	const followTrafficDistanceAlongRoute = calculateDistanceAlongRoute(
		waypointCoords,
		followTrafficLocation
	);

	const reportFinalDistance = -4.0 + (seed % 20) * 0.1;
	const reportFinalLocation = endAirport.getPointAlongLandingRunwayVector(
		seed,
		reportFinalDistance
	);
	const reportFinalPose: Pose = {
		position: reportFinalLocation,
		trueHeading: landingRunway.trueHeading,
		altitude: 750,
		airSpeed: 55.0
	};
	const reportFinalDistanceAlongRoute = calculateDistanceAlongRoute(
		waypointCoords,
		reportFinalLocation
	);

	const onRunwayPose: Pose = {
		position: endAirport.getPointAlongLandingRunwayVector(seed, -0.05),
		trueHeading: landingRunway.trueHeading,
		altitude: 0.0,
		airSpeed: 0.0
	};
	const onRunwayDistanceAlongRoute = calculateDistanceAlongRoute(
		waypointCoords,
		onRunwayPose.position
	);

	const runwayVacatedPose: Pose = {
		position: endAirport.coordinates,
		trueHeading: 0,
		altitude: 0.0,
		airSpeed: 0.0
	};
	const runwayVacatedDistanceAlongRoute = calculateDistanceAlongRoute(
		waypointCoords,
		runwayVacatedPose.position
	);

	if (endAirport.isControlled()) {
		const requestJoin = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.RequestJoin,
			requestJoinPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 10,
			requestJoinDistanceAlongRoute
		);
		stages.push(requestJoin);

		const reportDetails = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.ReportDetails,
			requestJoinPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 10,
			requestJoinDistanceAlongRoute
		);
		stages.push(reportDetails);

		const readbackOverheadJoinClearance = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.ReadbackOverheadJoinClearance,
			requestJoinPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 9,
			requestJoinDistanceAlongRoute
		);
		stages.push(readbackOverheadJoinClearance);

		const reportAirodromeInSight = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.ReportAirportInSight,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 9,
			followTrafficDistanceAlongRoute
		);
		stages.push(reportAirodromeInSight);

		const contactTower = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.ContactTower,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 8,
			followTrafficDistanceAlongRoute
		);
		stages.push(contactTower);

		const reportStatus = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportStatus,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 8,
			followTrafficDistanceAlongRoute
		);
		stages.push(reportStatus);

		const readbackLandingInformation = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReadbackLandingInformation,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 7,
			followTrafficDistanceAlongRoute
		);
		stages.push(readbackLandingInformation);

		const reportDescending = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportDescending,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 7,
			followTrafficDistance
		);
		stages.push(reportDescending);

		const wilcoReportDownwind = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.WilcoReportDownwind,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 6,
			followTrafficDistance
		);
		stages.push(wilcoReportDownwind);

		const reportDownwind = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportDownwind,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 6,
			followTrafficDistance
		);
		stages.push(reportDownwind);

		const wilcoFollowTraffic = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.WilcoFollowTraffic,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 5,
			followTrafficDistance
		);
		stages.push(wilcoFollowTraffic);

		const reportFinal = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportFinal,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 4,
			reportFinalDistanceAlongRoute
		);
		stages.push(reportFinal);

		const readbackContinueApproach = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReadbackContinueApproach,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 3,
			reportFinalDistanceAlongRoute
		);
		stages.push(readbackContinueApproach);

		const readbackLandingClearance = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReadbackLandingClearance,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 3,
			reportFinalDistanceAlongRoute
		);
		stages.push(readbackLandingClearance);

		const readbackVacateRunwayRequest = new ScenarioPoint(
			pointIndex++,
			LandingToParkedStage.ReadbackVacateRunwayRequest,
			onRunwayPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 2,
			onRunwayDistanceAlongRoute
		);
		stages.push(readbackVacateRunwayRequest);

		const reportVacatedRunway = new ScenarioPoint(
			pointIndex++,
			LandingToParkedStage.ReportVacatedRunway,
			runwayVacatedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime + 5,
			runwayVacatedDistanceAlongRoute
		);
		stages.push(reportVacatedRunway);

		const readbackTaxiInformation = new ScenarioPoint(
			pointIndex++,
			LandingToParkedStage.ReadbackTaxiInformation,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime + 5,
			runwayVacatedDistanceAlongRoute
		);
		stages.push(readbackTaxiInformation);
	} else {
		const requestJoin = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.RequestJoin,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 10,
			reportFinalDistanceAlongRoute
		);
		stages.push(requestJoin);

		const reportDetails = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.ReportDetails,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 10,
			reportFinalDistanceAlongRoute
		);
		stages.push(reportDetails);

		const reportCrosswindJoin = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportCrosswindJoin,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 9,
			reportFinalDistanceAlongRoute
		);
		stages.push(reportCrosswindJoin);

		const reportDownwind = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportDownwind,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 6,
			reportFinalDistanceAlongRoute
		);
		stages.push(reportDownwind);

		const reportFinal = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportFinal,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 4,
			reportFinalDistanceAlongRoute
		);
		stages.push(reportFinal);

		const readbackContinueApproach = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReadbackContinueApproach,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 3,
			reportFinalDistanceAlongRoute
		);
		stages.push(readbackContinueApproach);

		const reportVacatedRunway = new ScenarioPoint(
			pointIndex++,
			LandingToParkedStage.ReportVacatedRunway,
			runwayVacatedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime + 5,
			runwayVacatedDistanceAlongRoute
		);
		stages.push(reportVacatedRunway);

		const reportTaxiing = new ScenarioPoint(
			pointIndex++,
			LandingToParkedStage.ReportTaxiing,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime + 5,
			runwayVacatedDistanceAlongRoute
		);
		stages.push(reportTaxiing);
	}

	return stages;
}

export function getAirborneScenarioPoints(
	pointIndex: number,
	seedString: string,
	waypoints: Waypoint[],
	airspaces: Airspace[],
	airspaceIntersectionPoints: Intersection[],
	startAirport: Airport | undefined,
	endAirport: Airport | undefined,
	previousScenarioPoint: ScenarioPoint,
	hasEmergency: boolean
): ScenarioPoint[] {
	const seed = simpleHash(seedString);

	// Add events at each point
	const scenarioPoints: ScenarioPoint[] = [];
	const endStageIndexes: number[] = [];
	let timeAtPreviousPoint: number;
	let previousPosition: [number, number] = [0, 0];
	if (previousScenarioPoint) {
		timeAtPreviousPoint = previousScenarioPoint.timeAtPoint;
		previousPosition = previousScenarioPoint.pose.position;
	} else {
		timeAtPreviousPoint = getSeededTimeInMinutes(seed, 780, 840);
		previousPosition = waypoints[0].location;
	}

	const waypointCoords = waypoints.map((waypoint) => waypoint.location);
	const waypointDistancesAlongRoute = waypoints.map((waypoint, index) => {
		if (index == 0) return 0;
		return calculateDistanceAlongRoute(waypointCoords, waypoint.location);
	});

	let startIntersection = 0;
	if (previousScenarioPoint && previousScenarioPoint.stage == 'Announce Leaving Zone') startIntersection = 1;

	for (let i = startIntersection; i < airspaceIntersectionPoints.length; i++) {
		const distanceFromPrevPoint: number = turf.distance(
			previousPosition,
			airspaceIntersectionPoints[i].position,
			{ units: 'kilometers' }
		);
		let distanceToNextPoint: number = -1;
		if (i < airspaceIntersectionPoints.length - 1) {
			distanceToNextPoint = turf.distance(
				airspaceIntersectionPoints[i].position,
				airspaceIntersectionPoints[i + 1].position,
				{ units: 'kilometers' }
			);
		}
		const timeAtCurrentPoint =
			timeAtPreviousPoint +
			Math.round(
				(distanceFromPrevPoint / AIRCRAFT_AVERAGE_SPEED / NAUTICAL_MILE) * FLIGHT_TIME_MULTIPLIER
			);

		const heading = Math.round(
			turf.bearingToAngle(turf.bearing(previousPosition, airspaceIntersectionPoints[i].position))
		);

		const preIntersectionPose: Pose = {
			position: turf.destination(airspaceIntersectionPoints[i].position, -0.5, heading, {
				units: 'kilometers'
			}).geometry.coordinates,
			trueHeading: heading,
			altitude: 2000,
			airSpeed: 130
		};
		const preIntersectionPoseDistanceAlongRoute = calculateDistanceAlongRoute(
			waypointCoords,
			preIntersectionPose.position
		);

		const intersectionPose: Pose = {
			position: airspaceIntersectionPoints[i].position,
			trueHeading: heading,
			altitude: 2000,
			airSpeed: 130
		};
		const intersectionPoseDistanceAlongRoute = calculateDistanceAlongRoute(
			waypointCoords,
			intersectionPose.position
		);

		const currentAirspace = airspaces.find(
			(x) => x.id == airspaceIntersectionPoints[i].airspaceId
		) as Airspace;

		const nextAirspace = airspaces.find(
			(x) => x.id == airspaceIntersectionPoints[i + 1]?.airspaceId
		) as Airspace;

		// If the distance to the next airspace is less than 10m
		// then we are switching immediately from one to another
		// Otherwise it is just entering the airspace
		const switchingAirspace = distanceToNextPoint < 0.01 && distanceToNextPoint > 0;

		if (switchingAirspace && currentAirspace.name == nextAirspace.name) {
			continue;
		}

		// Add logic to determine what stages to add at each point
		if (!airspaceIntersectionPoints[i].enteringAirspace || switchingAirspace) {
			const currentFreq = getRandomFrequency(seed, currentAirspace.id);

			const requestFrequencyChange = new ScenarioPoint(
				pointIndex++,
				ChangeZoneStage.RequestFrequencyChange,
				preIntersectionPose,
				{
					callsignModified: false,
					squark: false,
					currentTarget: currentAirspace.name,
					currentTargetFrequency: currentFreq,
					currentTransponderFrequency: '7000',
					currentPressure: 1013,
					emergency: EmergencyType.None
				},
				i + 1,
				timeAtCurrentPoint,
				preIntersectionPoseDistanceAlongRoute
			);
			scenarioPoints.push(requestFrequencyChange);

			const acknowledgeApproval = new ScenarioPoint(
				pointIndex++,
				ChangeZoneStage.AcknowledgeApproval,
				preIntersectionPose,
				{
					callsignModified: false,
					squark: false,
					currentTarget: currentAirspace.name,
					currentTargetFrequency: currentFreq,
					currentTransponderFrequency: '7000',
					currentPressure: 1013,
					emergency: EmergencyType.None
				},
				i + 1,
				timeAtCurrentPoint + 1,
				preIntersectionPoseDistanceAlongRoute
			);
			scenarioPoints.push(acknowledgeApproval);
		}

		if (airspaceIntersectionPoints[i].enteringAirspace || switchingAirspace) {
			let newFreq = getRandomFrequency(seed, currentAirspace.id);
			let squarkCode = getRandomSqwuakCode(seed, currentAirspace.id);
			if (switchingAirspace) {
				newFreq = getRandomFrequency(seed, nextAirspace.id);
				squarkCode = getRandomSqwuakCode(seed, nextAirspace.id);
			}

			const contactNewFrequency = new ScenarioPoint(
				pointIndex++,
				ChangeZoneStage.ContactNewFrequency,
				preIntersectionPose,
				{
					callsignModified: false,
					squark: false,
					currentTarget: currentAirspace.name,
					currentTargetFrequency: newFreq,
					currentTransponderFrequency: '7000',
					currentPressure: 1013,
					emergency: EmergencyType.None
				},
				i + 1,
				timeAtCurrentPoint + 1,
				preIntersectionPoseDistanceAlongRoute
			);
			scenarioPoints.push(contactNewFrequency);

			const passMessage = new ScenarioPoint(
				pointIndex++,
				ChangeZoneStage.PassMessage,
				preIntersectionPose,
				{
					callsignModified: false,
					squark: false,
					currentTarget: currentAirspace.name,
					currentTargetFrequency: newFreq,
					currentTransponderFrequency: '7000',
					currentPressure: 1013,
					emergency: EmergencyType.None
				},
				i + 1,
				timeAtCurrentPoint + 2,
				preIntersectionPoseDistanceAlongRoute
			);
			scenarioPoints.push(passMessage);

			const squawk = new ScenarioPoint(
				pointIndex++,
				ChangeZoneStage.Squawk,
				preIntersectionPose,
				{
					callsignModified: false,
					squark: false,
					currentTarget: currentAirspace.name,
					currentTargetFrequency: newFreq,
					currentTransponderFrequency: squarkCode,
					currentPressure: 1013,
					emergency: EmergencyType.None
				},
				i + 1,
				timeAtCurrentPoint + 2,
				preIntersectionPoseDistanceAlongRoute
			);
			scenarioPoints.push(squawk);

			const readbackApproval = new ScenarioPoint(
				pointIndex++,
				ChangeZoneStage.ReadbackApproval,
				intersectionPose,
				{
					callsignModified: false,
					squark: false,
					currentTarget: currentAirspace.name,
					currentTargetFrequency: newFreq,
					currentTransponderFrequency: '7000',
					currentPressure: 1013,
					emergency: EmergencyType.None
				},
				i + 1,
				timeAtCurrentPoint + 3,
				intersectionPoseDistanceAlongRoute
			);
			scenarioPoints.push(readbackApproval);
		}

		endStageIndexes.push(scenarioPoints.length - 1);

		previousPosition = airspaceIntersectionPoints[i].position;

		timeAtPreviousPoint = timeAtCurrentPoint + 3;

		if (switchingAirspace) i++;
	}

	if (hasEmergency && scenarioPoints.length > 0) {
		// Add emergency before a random waypoint on the route
		const emergencyScenarioPointIndex =
			endStageIndexes[(seed % (endStageIndexes.length - 1))] - 1;

		// Get a random emergency type which is not none
		const emergencyTypeIndex = seed % (Object.keys(EmergencyType).length - 1);
		const emergencyType = Object.values(EmergencyType)[emergencyTypeIndex + 1];

		// Generate the points to add on the route
		// Get the percentage of the distance between the two points to add the emergency at
		// At least 5% of the distance must be between the two points, and at most 90%
		// This minimises the chance of the emergency ending after the next actual route point time
		const lerpPercentage: number = (seed % 85) / 100 + 0.05;
		const segmentDistance: number = turf.distance(
			scenarioPoints[emergencyScenarioPointIndex].pose.position,
			scenarioPoints[emergencyScenarioPointIndex + 1].pose.position
		);
		const emergencyPosition: Position = turf.along(
			turf.lineString([
				scenarioPoints[emergencyScenarioPointIndex].pose.position,
				scenarioPoints[emergencyScenarioPointIndex + 1].pose.position
			]),
			segmentDistance * lerpPercentage
		).geometry.coordinates;
		emergencyPosition[0] = parseFloat(emergencyPosition[0].toFixed(8));
		emergencyPosition[1] = parseFloat(emergencyPosition[1].toFixed(8));

		const emergencyTime: number = Math.round(
			lerp(
				scenarioPoints[emergencyScenarioPointIndex].timeAtPoint,
				scenarioPoints[emergencyScenarioPointIndex + 1].timeAtPoint,
				lerpPercentage
			)
		);

		const emergencyPose: Pose = {
			position: emergencyPosition,
			trueHeading: scenarioPoints[emergencyScenarioPointIndex].pose.trueHeading,
			altitude: 1200.0,
			airSpeed: 90.0
		};
		const emergencyPoseDistanceAlongRoute = calculateDistanceAlongRoute(
			waypointCoords,
			emergencyPose.position
		);

		const declareEmergency = new ScenarioPoint(
			pointIndex++,
			PanPanStage.DeclareEmergency,
			emergencyPose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: scenarioPoints[emergencyScenarioPointIndex].updateData.currentTarget,
				currentTargetFrequency:
					scenarioPoints[emergencyScenarioPointIndex].updateData.currentTargetFrequency,
				currentTransponderFrequency: '7000',
				currentPressure: 1013,
				emergency: emergencyType
			},
			scenarioPoints[emergencyScenarioPointIndex].nextWaypointIndex,
			emergencyTime,
			emergencyPoseDistanceAlongRoute
		);

		const wilcoInstructions = new ScenarioPoint(
			pointIndex++,
			PanPanStage.WilcoInstructions,
			emergencyPose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: scenarioPoints[emergencyScenarioPointIndex].updateData.currentTarget,
				currentTargetFrequency:
					scenarioPoints[emergencyScenarioPointIndex].updateData.currentTargetFrequency,
				currentTransponderFrequency: '7000',
				currentPressure: 1013,
				emergency: emergencyType
			},
			scenarioPoints[emergencyScenarioPointIndex].nextWaypointIndex,
			emergencyTime + 1,
			emergencyPoseDistanceAlongRoute
		);

		const cancelPanPan = new ScenarioPoint(
			pointIndex++,
			PanPanStage.CancelPanPan,
			emergencyPose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: scenarioPoints[emergencyScenarioPointIndex].updateData.currentTarget,
				currentTargetFrequency:
					scenarioPoints[emergencyScenarioPointIndex].updateData.currentTargetFrequency,
				currentTransponderFrequency: '7000',
				currentPressure: 1013,
				emergency: emergencyType
			},
			scenarioPoints[emergencyScenarioPointIndex].nextWaypointIndex,
			emergencyTime + 4,
			emergencyPoseDistanceAlongRoute
		);

		scenarioPoints.splice(
			emergencyScenarioPointIndex,
			0,
			...[declareEmergency, wilcoInstructions, cancelPanPan]
		);
	}

	return scenarioPoints;
}
