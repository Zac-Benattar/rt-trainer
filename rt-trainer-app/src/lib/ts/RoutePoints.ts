import type { SimulatorUpdateData } from './ServerClientTypes';
import type Seed from './Seed';
import { EmergencyType, type Pose } from './RouteTypes';
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
import Route from './Route';
import { lerp, lerpLocation } from './utils';
import type { Airport } from './AeronauticalClasses/Airport';
import type { Waypoint } from './AeronauticalClasses/Waypoint';

/* A point on the route used in generation. Not necissarily visible to the user */
export default class RoutePoint {
	stage: string;
	pose: Pose;
	updateData: SimulatorUpdateData;
	nextWaypointIndex: number;
	timeAtPoint: number;

	constructor(
		stage: string,
		pose: Pose,
		updateData: SimulatorUpdateData,
		nextWaypointIndex: number,
		timeAtPoint: number
	) {
		this.stage = stage;
		this.pose = pose;
		this.updateData = updateData;
		this.nextWaypointIndex = nextWaypointIndex;
		this.timeAtPoint = timeAtPoint;
	}
}

export function getParkedInitialControlledUpdateData(
	seed: Seed,
	airport: Airport
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: airport.getShortName() + ' Ground',
		currentTargetFrequency: airport.getGroundFrequency(),
		currentTransponderFrequency: '7000',
		currentPressure: 1013,
		emergency: EmergencyType.None
	};
}

export function getParkedMadeContactControlledUpdateData(
	seed: Seed,
	startAerodrome: Airport
): SimulatorUpdateData {
	return {
		callsignModified: true, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + ' Ground',
		currentTargetFrequency: startAerodrome.getGroundFrequency(),
		currentTransponderFrequency: '7000',
		currentPressure: 1013,
		emergency: EmergencyType.None
	};
}

export function getParkedInitialUncontrolledUpdateData(
	seed: Seed,
	startAerodrome: Airport
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + ' Information',
		currentTargetFrequency: startAerodrome.getGroundFrequency(),
		currentTransponderFrequency: '7000',
		currentPressure: 1013,
		emergency: EmergencyType.None
	};
}

export function getParkedMadeContactUncontrolledUpdateData(
	seed: Seed,
	startAerodrome: Airport
): SimulatorUpdateData {
	return {
		callsignModified: true, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + ' Information',
		currentTargetFrequency: startAerodrome.getGroundFrequency(),
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
export function getStartAerodromeRoutePoints(seed: Seed, route: Route): RoutePoint[] {
	const stages: RoutePoint[] = [];
	const startAerodrome: Airport = route.getStartAirport();
	const startAerodromeTime: number = startAerodrome.getStartTime();
	const startPoints = startAerodrome.getStartPoints();
	const startPointIndex = seed.scenarioSeed % startPoints.length;
	const holdingPoint = startAerodrome.getTakeoffRunwayTaxiwayHoldingPoint();
	const takeoffRunway = startAerodrome.getTakeoffRunway();

	const parkedPose: Pose = {
		lat: startPoints[startPointIndex].lat,
		long: startPoints[startPointIndex].long,
		magneticHeading: startPoints[startPointIndex].heading,
		trueHeading: startPoints[startPointIndex].heading,
		altitude: 0,
		airSpeed: 0.0
	};

	const taxiPose: Pose = {
		lat: holdingPoint.lat,
		long: holdingPoint.long,
		magneticHeading: holdingPoint.heading,
		trueHeading: holdingPoint.heading,
		altitude: 0,
		airSpeed: 0.0
	};

	const onRunwayPose: Pose = {
		lat: takeoffRunway.startLat,
		long: takeoffRunway.startLong,
		magneticHeading: takeoffRunway.magneticHeading,
		trueHeading: takeoffRunway.trueHeading,
		altitude: 0,
		airSpeed: 0.0
	};

	const climbingOutPosition = takeoffRunway.getPointAlongVector(1.3);
	const climbingOutPose: Pose = {
		lat: climbingOutPosition.lat,
		long: climbingOutPosition.long,
		magneticHeading: takeoffRunway.magneticHeading,
		trueHeading: takeoffRunway.trueHeading,
		altitude: 1200,
		airSpeed: 70.0
	};

	if (startAerodrome.isControlled()) {
		const radioCheck = new RoutePoint(
			StartUpStage.RadioCheck,
			parkedPose,
			getParkedInitialControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime
		);
		stages.push(radioCheck);

		const requestDepartInfo = new RoutePoint(
			StartUpStage.DepartureInformationRequest,
			parkedPose,
			getParkedInitialControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime
		);
		stages.push(requestDepartInfo);

		const readbackDepartInfo = new RoutePoint(
			StartUpStage.ReadbackDepartureInformation,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 1
		);
		stages.push(readbackDepartInfo);

		const taxiRequest = new RoutePoint(
			TaxiStage.TaxiRequest,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 1
		);
		stages.push(taxiRequest);

		const taxiClearanceReadback = new RoutePoint(
			TaxiStage.TaxiClearanceReadback,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 5
		);
		stages.push(taxiClearanceReadback);

		const ReadyForDeparture = new RoutePoint(
			TakeOffStage.ReadyForDeparture,
			taxiPose,
			getParkedMadeContactControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 8
		);
		stages.push(ReadyForDeparture);

		const readbackAfterDepartureInformation = new RoutePoint(
			TakeOffStage.ReadbackAfterDepartureInformation,
			taxiPose,
			getParkedMadeContactControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 9
		);
		stages.push(readbackAfterDepartureInformation);

		const readbackClearance = new RoutePoint(
			TakeOffStage.ReadbackClearance,
			taxiPose,
			getParkedMadeContactControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 9
		);
		stages.push(readbackClearance);

		const readbackNextContact = new RoutePoint(
			ClimbOutStage.ReadbackNextContact,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 12
		);
		stages.push(readbackNextContact);

		const contactNextFrequency = new RoutePoint(
			ClimbOutStage.ContactNextFrequency,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 15
		);
		stages.push(contactNextFrequency);

		const acknowledgeNewFrequencyRequest = new RoutePoint(
			ClimbOutStage.AcknowledgeNewFrequencyRequest,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 15
		);
		stages.push(acknowledgeNewFrequencyRequest);

		const reportLeavingZone = new RoutePoint(
			ClimbOutStage.ReportLeavingZone,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 18
		);
		stages.push(reportLeavingZone);
	} else {
		const radioCheck = new RoutePoint(
			StartUpStage.RadioCheck,
			parkedPose,
			getParkedInitialUncontrolledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime
		);
		stages.push(radioCheck);

		const requestTaxiInformation = new RoutePoint(
			TaxiStage.RequestTaxiInformation,
			parkedPose,
			getParkedInitialUncontrolledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 1
		);
		stages.push(requestTaxiInformation);

		const readbackTaxiInformation = new RoutePoint(
			TaxiStage.AnnounceTaxiing,
			parkedPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 1
		);
		stages.push(readbackTaxiInformation);

		const readyForDeparture = new RoutePoint(
			TakeOffStage.ReadyForDeparture,
			taxiPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 8
		);
		stages.push(readyForDeparture);

		const acknowledgeTraffic = new RoutePoint(
			TakeOffStage.AcknowledgeTraffic,
			taxiPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 9
		);
		stages.push(acknowledgeTraffic);

		const reportTakingOff = new RoutePoint(
			TakeOffStage.AnnounceTakingOff,
			onRunwayPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 10
		);
		stages.push(reportTakingOff);

		const reportLeavingZone = new RoutePoint(
			ClimbOutStage.AnnounceLeavingZone,
			climbingOutPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAerodrome),
			0,
			startAerodromeTime + 15
		);
		stages.push(reportLeavingZone);
	}

	return stages;
}

export function getEndAerodromeRoutePoints(seed: Seed, route: Route): RoutePoint[] {
	const stages: RoutePoint[] = [];
	const endAerodrome: Airport = route.getEndAirport();
	const waypoints: Waypoint[] = []
	const landingTime = waypoints[waypoints.length - 1].arrivalTime;
	const landingRunway = endAerodrome.getLandingRunway(seed);

	const parkedPose: Pose = {
		lat: endAerodrome.coordinates[0],
		long: endAerodrome.coordinates[1],
		magneticHeading: 0,
		trueHeading: 0,
		altitude: 0,
		airSpeed: 0.0
	};

	const followTrafficLocation = landingRunway.getPointAlongVector(-4.5);
	const followTrafficPose: Pose = {
		lat: followTrafficLocation[0],
		long: followTrafficLocation[1],
		magneticHeading: 0,
		trueHeading: landingRunway.trueHeading,
		altitude: 1200,
		airSpeed: 84.0
	};

	const reportFinalLocation = landingRunway.getPointAlongVector(-3.6);
	const reportFinalPose: Pose = {
		lat: reportFinalLocation[0],
		long: reportFinalLocation[1],
		magneticHeading: 0,
		trueHeading: landingRunway.trueHeading,
		altitude: 750,
		airSpeed: 55.0
	};

	const onRunwayPose: Pose = {
		lat: landingRunway.getPointAlongVector(0)[0],
		long: landingRunway.getPointAlongVector(0)[1],
		magneticHeading: 0,
		trueHeading: landingRunway.trueHeading,
		altitude: 0.0,
		airSpeed: 0.0
	};

	const runwayVacatedPose: Pose = {
		lat: endAerodrome.coordinates[0],
		long: endAerodrome.coordinates[1],
		magneticHeading: 0,
		trueHeading: 0,
		altitude: 0.0,
		airSpeed: 0.0
	};

	if (endAerodrome.isControlled()) {
		const requestJoin = new RoutePoint(
			InboundForJoinStage.RequestJoin,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 15
		);
		stages.push(requestJoin);

		const reportDetails = new RoutePoint(
			InboundForJoinStage.ReportDetails,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 15
		);
		stages.push(reportDetails);

		const readbackOverheadJoinClearance = new RoutePoint(
			InboundForJoinStage.ReadbackOverheadJoinClearance,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 14
		);
		stages.push(readbackOverheadJoinClearance);

		const reportAirodromeInSight = new RoutePoint(
			InboundForJoinStage.ReportAerodromeInSight,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 10
		);
		stages.push(reportAirodromeInSight);

		const contactTower = new RoutePoint(
			InboundForJoinStage.ContactTower,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 10
		);
		stages.push(contactTower);

		const reportStatus = new RoutePoint(
			CircuitAndLandingStage.ReportStatus,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 9
		);
		stages.push(reportStatus);

		const readbackLandingInformation = new RoutePoint(
			CircuitAndLandingStage.ReadbackLandingInformation,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 9
		);
		stages.push(readbackLandingInformation);

		const reportDescending = new RoutePoint(
			CircuitAndLandingStage.ReportDescending,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 7
		);
		stages.push(reportDescending);

		const wilcoReportDownwind = new RoutePoint(
			CircuitAndLandingStage.WilcoReportDownwind,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 7
		);
		stages.push(wilcoReportDownwind);

		const reportDownwind = new RoutePoint(
			CircuitAndLandingStage.ReportDownwind,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 5
		);
		stages.push(reportDownwind);

		const wilcoFollowTraffic = new RoutePoint(
			CircuitAndLandingStage.WilcoFollowTraffic,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 4
		);
		stages.push(wilcoFollowTraffic);

		const reportFinal = new RoutePoint(
			CircuitAndLandingStage.ReportFinal,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 4
		);
		stages.push(reportFinal);

		const readbackContinueApproach = new RoutePoint(
			CircuitAndLandingStage.ReadbackContinueApproach,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 3
		);
		stages.push(readbackContinueApproach);

		const readbackLandingClearance = new RoutePoint(
			CircuitAndLandingStage.ReadbackLandingClearance,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 3
		);
		stages.push(readbackLandingClearance);

		const readbackVacateRunwayRequest = new RoutePoint(
			LandingToParkedStage.ReadbackVacateRunwayRequest,
			onRunwayPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 2
		);
		stages.push(readbackVacateRunwayRequest);

		const reportVacatedRunway = new RoutePoint(
			LandingToParkedStage.ReportVacatedRunway,
			runwayVacatedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime + 5
		);
		stages.push(reportVacatedRunway);

		const readbackTaxiInformation = new RoutePoint(
			LandingToParkedStage.ReadbackTaxiInformation,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime + 5
		);
		stages.push(readbackTaxiInformation);
	} else {
		const requestJoin = new RoutePoint(
			InboundForJoinStage.RequestJoin,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 15
		);
		stages.push(requestJoin);

		const reportDetails = new RoutePoint(
			InboundForJoinStage.ReportDetails,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 15
		);
		stages.push(reportDetails);

		const reportCrosswindJoin = new RoutePoint(
			CircuitAndLandingStage.ReportCrosswindJoin,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 14
		);
		stages.push(reportCrosswindJoin);

		const reportDownwind = new RoutePoint(
			CircuitAndLandingStage.ReportDownwind,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 12
		);
		stages.push(reportDownwind);

		const reportFinal = new RoutePoint(
			CircuitAndLandingStage.ReportFinal,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 4
		);
		stages.push(reportFinal);

		const readbackContinueApproach = new RoutePoint(
			CircuitAndLandingStage.ReadbackContinueApproach,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime - 3
		);
		stages.push(readbackContinueApproach);

		const reportVacatedRunway = new RoutePoint(
			LandingToParkedStage.ReportVacatedRunway,
			runwayVacatedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime + 5
		);
		stages.push(reportVacatedRunway);

		const reportTaxiing = new RoutePoint(
			LandingToParkedStage.ReportTaxiing,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAerodrome),
			numAirborneWaypoints + 1,
			landingTime + 5
		);
		stages.push(reportTaxiing);
	}

	return stages;
}

export function getAirborneRoutePoints(
	seed: Seed,
	numAirborneWaypoints: number,
	hasEmergency: boolean
): RoutePoint[] {
	const waypoints: Waypoint[] = [];

	// Add events at each point
	const routePoints: RoutePoint[] = [];
	const endStageIndexes: number[] = [];
	for (let i = 0; i < waypoints.length; i++) {
		const waypoint = waypoints[i];
		const pose: Pose = {
			lat: waypoint.lat,
			long: waypoint.long,
			magneticHeading: 0.0,
			trueHeading: 0.0,
			altitude: 0.0,
			airSpeed: 0.0
		};

		const requestFrequencyChange = new RoutePoint(
			ChangeZoneStage.RequestFrequencyChange,
			pose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: '000.000',
				currentTransponderFrequency: '0000',
				currentPressure: 1013,
				emergency: EmergencyType.None
			},
			i + 1,
			waypoint.arrivalTime - 1
		);
		routePoints.push(requestFrequencyChange);

		const acknowledgeApproval = new RoutePoint(
			ChangeZoneStage.AcknowledgeApproval,
			pose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: '000.000',
				currentTransponderFrequency: '0000',
				currentPressure: 1013,
				emergency: EmergencyType.None
			},
			i + 1,
			waypoint.arrivalTime
		);
		routePoints.push(acknowledgeApproval);

		const contactNewFrequency = new RoutePoint(
			ChangeZoneStage.ContactNewFrequency,
			pose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: '000.000',
				currentTransponderFrequency: '0000',
				currentPressure: 1013,
				emergency: EmergencyType.None
			},
			i + 1,
			waypoint.arrivalTime + 1
		);
		routePoints.push(contactNewFrequency);

		const passMessage = new RoutePoint(
			ChangeZoneStage.PassMessage,
			pose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: '000.000',
				currentTransponderFrequency: '0000',
				currentPressure: 1013,
				emergency: EmergencyType.None
			},
			i + 1,
			waypoint.arrivalTime + 2
		);
		routePoints.push(passMessage);

		const squawk = new RoutePoint(
			ChangeZoneStage.Squawk,
			pose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: '000.000',
				currentTransponderFrequency: '0000',
				currentPressure: 1013,
				emergency: EmergencyType.None
			},
			i + 1,
			waypoint.arrivalTime + 3
		);
		routePoints.push(squawk);

		const readbackApproval = new RoutePoint(
			ChangeZoneStage.ReadbackApproval,
			pose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: '000.000',
				currentTransponderFrequency: '0000',
				currentPressure: 1013,
				emergency: EmergencyType.None
			},
			i + 1,
			waypoint.arrivalTime + 4
		);
		routePoints.push(readbackApproval);
		endStageIndexes.push(routePoints.length - 1);
	}

	if (hasEmergency) {
		// Add emergency before a random waypoint on the route, not first point
		const emergencyPointIndex = (seed.scenarioSeed % (waypoints.length - 1)) + 1;
		const emergencyRoutePointIndex = endStageIndexes[emergencyPointIndex - 1] + 1;

		let emergencyType: EmergencyType = EmergencyType.None;

		// Get a random emergency type which is not none
		const index = seed.scenarioSeed % (Object.keys(EmergencyType).length - 1);
		emergencyType = Object.values(EmergencyType)[index + 1];

		// Generate the points to add on the route
		// Get the percentage of the distance between the two points to add the emergency at
		// At least 5% of the distance must be between the two points, and at most 90%
		// This minimises the chance of the emergency ending after the next actual route point time
		const lerpPercentage: number = (seed.scenarioSeed % 85) / 100 + 0.05;
		const emergencyLocation = lerpLocation(
			waypoints[emergencyPointIndex].lat,
			waypoints[emergencyPointIndex].long,
			waypoints[emergencyPointIndex - 1].lat,
			waypoints[emergencyPointIndex - 1].long,
			lerpPercentage
		);

		const emergencyTime: number = Math.round(
			lerp(
				waypoints[emergencyPointIndex - 1].arrivalTime,
				waypoints[emergencyPointIndex].arrivalTime,
				lerpPercentage
			)
		);

		const emergencyPose: Pose = {
			lat: emergencyLocation.lat,
			long: emergencyLocation.long,
			magneticHeading: 0.0,
			trueHeading: 0.0,
			altitude: 0.0,
			airSpeed: 0.0
		};

		const declareEmergency = new RoutePoint(
			PanPanStage.DeclareEmergency,
			emergencyPose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: '000.000',
				currentTransponderFrequency: '0000',
				currentPressure: 1013,
				emergency: emergencyType
			},
			emergencyPointIndex,
			emergencyTime
		);
		routePoints.splice(emergencyRoutePointIndex, 0, declareEmergency);

		const wilcoInstructions = new RoutePoint(
			PanPanStage.WilcoInstructions,
			emergencyPose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: '000.000',
				currentTransponderFrequency: '0000',
				currentPressure: 1013,
				emergency: emergencyType
			},
			emergencyPointIndex,
			emergencyTime + 1
		);
		routePoints.splice(emergencyRoutePointIndex + 1, 0, wilcoInstructions);

		const cancelPanPan = new RoutePoint(
			PanPanStage.CancelPanPan,
			emergencyPose,
			{
				callsignModified: false,
				squark: false,
				currentTarget: '',
				currentTargetFrequency: '000.000',
				currentTransponderFrequency: '0000',
				currentPressure: 1013,
				emergency: emergencyType
			},
			emergencyPointIndex,
			emergencyTime + 4
		);
		routePoints.splice(emergencyRoutePointIndex + 2, 0, cancelPanPan);
	}

	return routePoints;
}
