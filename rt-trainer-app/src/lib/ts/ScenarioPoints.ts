import type { SimulatorUpdateData } from './ServerClientTypes';
import { EmergencyType, type FrequencyChangePoint, type Pose } from './ScenarioTypes';
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
	getHeadingBetween,
	haversineDistance,
	lerp,
	lerpLocation,
	simpleHash,
	toDegrees,
	type Intersection
} from './utils';
import type Airport from './AeronauticalClasses/Airport';
import type Waypoint from './AeronauticalClasses/Waypoint';
import type Airspace from './AeronauticalClasses/Airspace';

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

	constructor(
		index: number,
		stage: string,
		pose: Pose,
		updateData: SimulatorUpdateData,
		nextWaypointIndex: number,
		timeAtPoint: number
	) {
		this.index = index;
		this.stage = stage;
		this.pose = pose;
		this.updateData = updateData;
		this.nextWaypointIndex = nextWaypointIndex;
		this.timeAtPoint = timeAtPoint;
	}
}

export function getParkedInitialControlledUpdateData(
	seed: number,
	airport: Airport
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: airport.getShortName() + ' Ground',
		currentTargetFrequency: airport.getParkedFrequencyValue(),
		currentTransponderFrequency: '7000',
		currentPressure: 1013,
		emergency: EmergencyType.None
	};
}

export function getParkedMadeContactControlledUpdateData(
	seed: number,
	startAerodrome: Airport
): SimulatorUpdateData {
	return {
		callsignModified: true, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + ' Ground',
		currentTargetFrequency: startAerodrome.getParkedFrequencyValue(),
		currentTransponderFrequency: '7000',
		currentPressure: 1013,
		emergency: EmergencyType.None
	};
}

export function getParkedInitialUncontrolledUpdateData(
	seed: number,
	startAerodrome: Airport
): SimulatorUpdateData {
	return {
		callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + ' Information',
		currentTargetFrequency: startAerodrome.getParkedFrequencyValue(),
		currentTransponderFrequency: '7000',
		currentPressure: 1013,
		emergency: EmergencyType.None
	};
}

export function getParkedMadeContactUncontrolledUpdateData(
	seed: number,
	startAerodrome: Airport
): SimulatorUpdateData {
	return {
		callsignModified: true, // States whether callsign has been modified by ATC, e.g. shortened
		squark: false,
		currentTarget: startAerodrome.getShortName() + ' Information',
		currentTargetFrequency: startAerodrome.getParkedFrequencyValue(),
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
	const initialRouteHeading = getHeadingBetween(
		waypoints[0].getCoords()[0],
		waypoints[0].getCoords()[1],
		waypoints[1].getCoords()[0],
		waypoints[1].getCoords()[1]
	);

	const groundedPose: Pose = {
		lat: startAirport.coordinates[0],
		long: startAirport.coordinates[1],
		trueHeading: 0,
		altitude: 0,
		airSpeed: 0.0
	};

	const takingOffPosition = startAirport.getPointAlongTakeoffRunwayVector(seed, 0);
	const takingOffPose: Pose = {
		lat: takingOffPosition[0],
		long: takingOffPosition[1],
		trueHeading: takeoffRunway.trueHeading,
		altitude: 0,
		airSpeed: 0.0
	};

	const climbingOutPosition = startAirport.getPointAlongTakeoffRunwayVector(seed, 1.0);
	const climbingOutPose: Pose = {
		lat: climbingOutPosition[0],
		long: climbingOutPosition[1],
		trueHeading: takeoffRunway.trueHeading,
		altitude: 1200,
		airSpeed: 70.0
	};

	const takeoffAirspace = airspaces.find((x) => x.name.includes(startAirport.name));
	if (!takeoffAirspace) {
		throw new Error('No takeoff airspace found for ' + startAirport.name);
	}
	const startRoute = [waypoints[0].getCoords(), waypoints[1].getCoords()];
	const leavingZonePosition = findIntersections(startRoute, [takeoffAirspace]);
	const leavingZonePose: Pose = {
		lat: leavingZonePosition[0].point[0],
		long: leavingZonePosition[0].point[1],
		trueHeading: initialRouteHeading,
		altitude: 1200,
		airSpeed: 70.0
	};

	if (startAirport.isControlled()) {
		const radioCheck = new ScenarioPoint(
			pointIndex++,
			StartUpStage.RadioCheck,
			groundedPose,
			getParkedInitialControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime
		);
		stages.push(radioCheck);

		const requestDepartInfo = new ScenarioPoint(
			pointIndex++,
			StartUpStage.DepartureInformationRequest,
			groundedPose,
			getParkedInitialControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime
		);
		stages.push(requestDepartInfo);

		const readbackDepartInfo = new ScenarioPoint(
			pointIndex++,
			StartUpStage.ReadbackDepartureInformation,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 1
		);
		stages.push(readbackDepartInfo);

		const taxiRequest = new ScenarioPoint(
			pointIndex++,
			TaxiStage.TaxiRequest,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 1
		);
		stages.push(taxiRequest);

		const taxiClearanceReadback = new ScenarioPoint(
			pointIndex++,
			TaxiStage.TaxiClearanceReadback,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 5
		);
		stages.push(taxiClearanceReadback);

		const ReadyForDeparture = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.ReadyForDeparture,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 8
		);
		stages.push(ReadyForDeparture);

		const readbackAfterDepartureInformation = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.ReadbackAfterDepartureInformation,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 9
		);
		stages.push(readbackAfterDepartureInformation);

		const readbackClearance = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.ReadbackClearance,
			groundedPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 9
		);
		stages.push(readbackClearance);

		const readbackNextContact = new ScenarioPoint(
			pointIndex++,
			ClimbOutStage.ReadbackNextContact,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 12
		);
		stages.push(readbackNextContact);

		const contactNextFrequency = new ScenarioPoint(
			pointIndex++,
			ClimbOutStage.ContactNextFrequency,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 15
		);
		stages.push(contactNextFrequency);

		const acknowledgeNewFrequencyRequest = new ScenarioPoint(
			pointIndex++,
			ClimbOutStage.AcknowledgeNewFrequencyRequest,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 15
		);
		stages.push(acknowledgeNewFrequencyRequest);

		const reportLeavingZone = new ScenarioPoint(
			pointIndex++,
			ClimbOutStage.ReportLeavingZone,
			climbingOutPose,
			getParkedMadeContactControlledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 18
		);
		stages.push(reportLeavingZone);
	} else {
		const radioCheck = new ScenarioPoint(
			pointIndex++,
			StartUpStage.RadioCheck,
			groundedPose,
			getParkedInitialUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime
		);
		stages.push(radioCheck);

		const requestTaxiInformation = new ScenarioPoint(
			pointIndex++,
			TaxiStage.RequestTaxiInformation,
			groundedPose,
			getParkedInitialUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 1
		);
		stages.push(requestTaxiInformation);

		const readbackTaxiInformation = new ScenarioPoint(
			pointIndex++,
			TaxiStage.AnnounceTaxiing,
			groundedPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 1
		);
		stages.push(readbackTaxiInformation);

		const readyForDeparture = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.ReadyForDeparture,
			groundedPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 8
		);
		stages.push(readyForDeparture);

		const acknowledgeTraffic = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.AcknowledgeTraffic,
			groundedPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 9
		);
		stages.push(acknowledgeTraffic);

		const reportTakingOff = new ScenarioPoint(
			pointIndex++,
			TakeOffStage.AnnounceTakingOff,
			takingOffPose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 10
		);
		stages.push(reportTakingOff);

		const reportLeavingZone = new ScenarioPoint(
			pointIndex++,
			ClimbOutStage.AnnounceLeavingZone,
			leavingZonePose,
			getParkedMadeContactUncontrolledUpdateData(seed, startAirport),
			0,
			startAerodromeTime + 15
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
	const distanceToLandingAirportFromPrevPoint = haversineDistance(
		previousScenarioPoint.pose.lat,
		previousScenarioPoint.pose.long,
		endAirport.coordinates[0],
		endAirport.coordinates[1]
	);

	const landingTime =
		previousPointTime +
		10 +
		Math.round(
			(distanceToLandingAirportFromPrevPoint / AIRCRAFT_AVERAGE_SPEED / NAUTICAL_MILE) *
				FLIGHT_TIME_MULTIPLIER
		);
	const landingRunway = endAirport.getLandingRunway(seed);

	const parkedPose: Pose = {
		lat: endAirport.coordinates[0],
		long: endAirport.coordinates[1],
		trueHeading: 0,
		altitude: 0,
		airSpeed: 0.0
	};

	const followTrafficLocation = endAirport.getPointAlongLandingRunwayVector(seed, -3.5);
	const followTrafficPose: Pose = {
		lat: followTrafficLocation[0],
		long: followTrafficLocation[1],
		trueHeading: landingRunway.trueHeading,
		altitude: 1200,
		airSpeed: 84.0
	};

	const reportFinalLocation = endAirport.getPointAlongLandingRunwayVector(seed, -1.6);
	const reportFinalPose: Pose = {
		lat: reportFinalLocation[0],
		long: reportFinalLocation[1],
		trueHeading: landingRunway.trueHeading,
		altitude: 750,
		airSpeed: 55.0
	};

	const onRunwayPose: Pose = {
		lat: endAirport.getPointAlongLandingRunwayVector(seed, 0)[0],
		long: endAirport.getPointAlongLandingRunwayVector(seed, 0)[1],
		trueHeading: landingRunway.trueHeading,
		altitude: 0.0,
		airSpeed: 0.0
	};

	const runwayVacatedPose: Pose = {
		lat: endAirport.coordinates[0],
		long: endAirport.coordinates[1],
		trueHeading: 0,
		altitude: 0.0,
		airSpeed: 0.0
	};

	if (endAirport.isControlled()) {
		const requestJoin = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.RequestJoin,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 10
		);
		stages.push(requestJoin);

		const reportDetails = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.ReportDetails,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 10
		);
		stages.push(reportDetails);

		const readbackOverheadJoinClearance = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.ReadbackOverheadJoinClearance,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 9
		);
		stages.push(readbackOverheadJoinClearance);

		const reportAirodromeInSight = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.ReportAirportInSight,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 9
		);
		stages.push(reportAirodromeInSight);

		const contactTower = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.ContactTower,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 8
		);
		stages.push(contactTower);

		const reportStatus = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportStatus,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 8
		);
		stages.push(reportStatus);

		const readbackLandingInformation = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReadbackLandingInformation,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 7
		);
		stages.push(readbackLandingInformation);

		const reportDescending = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportDescending,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 7
		);
		stages.push(reportDescending);

		const wilcoReportDownwind = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.WilcoReportDownwind,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 6
		);
		stages.push(wilcoReportDownwind);

		const reportDownwind = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportDownwind,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 6
		);
		stages.push(reportDownwind);

		const wilcoFollowTraffic = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.WilcoFollowTraffic,
			followTrafficPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 5
		);
		stages.push(wilcoFollowTraffic);

		const reportFinal = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportFinal,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 4
		);
		stages.push(reportFinal);

		const readbackContinueApproach = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReadbackContinueApproach,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 3
		);
		stages.push(readbackContinueApproach);

		const readbackLandingClearance = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReadbackLandingClearance,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 3
		);
		stages.push(readbackLandingClearance);

		const readbackVacateRunwayRequest = new ScenarioPoint(
			pointIndex++,
			LandingToParkedStage.ReadbackVacateRunwayRequest,
			onRunwayPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 2
		);
		stages.push(readbackVacateRunwayRequest);

		const reportVacatedRunway = new ScenarioPoint(
			pointIndex++,
			LandingToParkedStage.ReportVacatedRunway,
			runwayVacatedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime + 5
		);
		stages.push(reportVacatedRunway);

		const readbackTaxiInformation = new ScenarioPoint(
			pointIndex++,
			LandingToParkedStage.ReadbackTaxiInformation,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime + 5
		);
		stages.push(readbackTaxiInformation);
	} else {
		const requestJoin = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.RequestJoin,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 10
		);
		stages.push(requestJoin);

		const reportDetails = new ScenarioPoint(
			pointIndex++,
			InboundForJoinStage.ReportDetails,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 10
		);
		stages.push(reportDetails);

		const reportCrosswindJoin = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportCrosswindJoin,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 9
		);
		stages.push(reportCrosswindJoin);

		const reportDownwind = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportDownwind,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 6
		);
		stages.push(reportDownwind);

		const reportFinal = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReportFinal,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 4
		);
		stages.push(reportFinal);

		const readbackContinueApproach = new ScenarioPoint(
			pointIndex++,
			CircuitAndLandingStage.ReadbackContinueApproach,
			reportFinalPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime - 3
		);
		stages.push(readbackContinueApproach);

		const reportVacatedRunway = new ScenarioPoint(
			pointIndex++,
			LandingToParkedStage.ReportVacatedRunway,
			runwayVacatedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime + 5
		);
		stages.push(reportVacatedRunway);

		const reportTaxiing = new ScenarioPoint(
			pointIndex++,
			LandingToParkedStage.ReportTaxiing,
			parkedPose,
			getParkedMadeContactControlledUpdateData(seed, endAirport),
			waypoints.length - 1,
			landingTime + 5
		);
		stages.push(reportTaxiing);
	}

	return stages;
}

function getFrequencyChanges(airspaceChangePoints: Intersection[]): FrequencyChangePoint[] {
	if (airspaceChangePoints.length == 0) {
		return [];
	}

	const frequencyChanges: FrequencyChangePoint[] = [];

	for (let i = 0; i < airspaceChangePoints.length - 1; i++) {
		if (airspaceChangePoints[i].airspaceId != airspaceChangePoints[i + 1].airspaceId)
			frequencyChanges.push({
				oldAirspaceId: airspaceChangePoints[i].airspaceId,
				newAirspaceId: airspaceChangePoints[i + 1].airspaceId,
				coordinates: airspaceChangePoints[i + 1].point
			});
	}

	return frequencyChanges;
}

export function getAirborneScenarioPoints(
	pointIndex: number,
	seedString: string,
	waypoints: Waypoint[],
	airspaces: Airspace[],
	airspaceIntersectionPoints: Intersection[],
	startAirport: Airport,
	endAirport: Airport,
	previousScenarioPoint: ScenarioPoint,
	hasEmergency: boolean
): ScenarioPoint[] {
	const seed = simpleHash(seedString);
	const frequencyChanges: FrequencyChangePoint[] = getFrequencyChanges(airspaceIntersectionPoints);

	// Add events at each point
	const scenarioPoints: ScenarioPoint[] = [];
	const endStageIndexes: number[] = [];
	let timeAtPreviousPoint = previousScenarioPoint.timeAtPoint;
	let previousCoord = [previousScenarioPoint.pose.lat, previousScenarioPoint.pose.long];
	for (let i = 0; i < frequencyChanges.length; i++) {
		const distanceToNextPoint: number = haversineDistance(
			previousCoord[0],
			previousCoord[1],
			frequencyChanges[i].coordinates[0],
			frequencyChanges[i].coordinates[1]
		);
		const timeAtCurrentPoint =
			timeAtPreviousPoint +
			Math.round(
				(distanceToNextPoint / AIRCRAFT_AVERAGE_SPEED / NAUTICAL_MILE) * FLIGHT_TIME_MULTIPLIER
			);

		const freqChange = frequencyChanges[i];
		const heading = Math.round(
			toDegrees(
				Math.atan2(
					freqChange.coordinates[1] - previousCoord[1],
					freqChange.coordinates[0] - previousCoord[0]
				)
			)
		);
		const pose: Pose = {
			lat: freqChange.coordinates[0],
			long: freqChange.coordinates[1],
			trueHeading: heading,
			altitude: 2000,
			airSpeed: 130
		};

		const requestFrequencyChange = new ScenarioPoint(
			pointIndex++,
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
			timeAtCurrentPoint
		);
		scenarioPoints.push(requestFrequencyChange);

		const acknowledgeApproval = new ScenarioPoint(
			pointIndex++,
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
			timeAtCurrentPoint + 1
		);
		scenarioPoints.push(acknowledgeApproval);

		const contactNewFrequency = new ScenarioPoint(
			pointIndex++,
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
			timeAtCurrentPoint + 1
		);
		scenarioPoints.push(contactNewFrequency);

		const passMessage = new ScenarioPoint(
			pointIndex++,
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
			timeAtCurrentPoint + 2
		);
		scenarioPoints.push(passMessage);

		const squawk = new ScenarioPoint(
			pointIndex++,
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
			timeAtCurrentPoint + 2
		);
		scenarioPoints.push(squawk);

		const readbackApproval = new ScenarioPoint(
			pointIndex++,
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
			timeAtCurrentPoint + 3
		);
		scenarioPoints.push(readbackApproval);
		endStageIndexes.push(scenarioPoints.length - 1);

		previousCoord = freqChange.coordinates;
		timeAtPreviousPoint = timeAtCurrentPoint + 3;
	}

	if (hasEmergency && scenarioPoints.length > 0) {
		// Add emergency before a random waypoint on the route, not first point
		const emergencyPointIndex = (seed % (waypoints.length - 1)) + 1;
		const emergencyScenarioPointIndex = endStageIndexes[emergencyPointIndex - 1] + 1;

		let emergencyType: EmergencyType = EmergencyType.None;

		// Get a random emergency type which is not none
		const index = seed % (Object.keys(EmergencyType).length - 1);
		emergencyType = Object.values(EmergencyType)[index + 1];

		// Generate the points to add on the route
		// Get the percentage of the distance between the two points to add the emergency at
		// At least 5% of the distance must be between the two points, and at most 90%
		// This minimises the chance of the emergency ending after the next actual route point time
		const lerpPercentage: number = (seed % 85) / 100 + 0.05;
		const emergencyLocation = lerpLocation(
			waypoints[emergencyPointIndex].lat,
			waypoints[emergencyPointIndex].long,
			waypoints[emergencyPointIndex - 1].lat,
			waypoints[emergencyPointIndex - 1].long,
			lerpPercentage
		);

		const emergencyTime: number = Math.round(
			lerp(
				scenarioPoints[emergencyScenarioPointIndex - 1].timeAtPoint,
				scenarioPoints[emergencyScenarioPointIndex].timeAtPoint,
				lerpPercentage
			)
		);

		const emergencyPose: Pose = {
			lat: emergencyLocation.lat,
			long: emergencyLocation.long,
			trueHeading: scenarioPoints[emergencyPointIndex - 1].pose.trueHeading,
			altitude: 0.0,
			airSpeed: 0.0
		};

		const declareEmergency = new ScenarioPoint(
			pointIndex++,
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
		scenarioPoints.splice(emergencyScenarioPointIndex, 0, declareEmergency);

		const wilcoInstructions = new ScenarioPoint(
			pointIndex++,
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
		scenarioPoints.splice(emergencyScenarioPointIndex + 1, 0, wilcoInstructions);

		const cancelPanPan = new ScenarioPoint(
			pointIndex++,
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
		scenarioPoints.splice(emergencyScenarioPointIndex + 2, 0, cancelPanPan);
	}

	return scenarioPoints;
}
