/* Stages of a route point. Each stage has a different set of actions that can be performed.
	some of the airborne waypoint stages are optional depending on the generation. */
export enum StartUpStage {
	RadioCheck = 'Radio Check',
	DepartureInformationRequest = 'Departure Information Request',
	ReadbackDepartureInformation = 'Readback Departure Information'
}

export enum TaxiStage {
	TaxiRequest = 'Taxi Request',
	TaxiClearanceReadback = 'Taxi Clearance Readback',
	RequestTaxiInformation = 'Request Taxi Information', // Uncontrolled aerodrome
	AnnounceTaxiing = 'Announce Taxiing' // Uncontrolled aerodrome
}

export enum TakeOffStage {
	ReadyForDeparture = 'Ready For Departure',
	ReadbackAfterDepartureInformation = 'Readback After Departure Information',
	ReadbackClearance = 'Readback Clearance',
	AcknowledgeTraffic = 'Acknowledge Traffic', // Uncontrolled aerodrome
	AnnounceTakingOff = 'Report Taking Off', // Uncontrolled aerodrome
	AnnounceLeavingZone = 'Announce Leaving Zone' // Uncontrolled aerodrome
}

export enum ClimbOutStage {
	ReadbackNextContact = 'Readback Next Contact',
	ContactNextFrequency = 'Contact Next Frequency',
	AcknowledgeNewFrequencyRequest = 'Acknowledge New Frequency Request',
	ReportLeavingZone = 'Report Leaving Zone'
}

export enum ChangeZoneStage {
	RequestFrequencyChange = 'Request Frequency Change',
	AcknowledgeApproval = 'Acknowledge Approval',
	ContactNewFrequency = 'Contact New Frequency',
	PassMessage = 'Pass Message',
	Squawk = 'Squawk',
	ReadbackApproval = 'Readback Approval',
	ReadbackAlternative = 'Readback Alternative' // If atc not able to comply with request
}

export enum RequestServiceStage {
	RequestTrafficService = 'Request Traffic Service',
	RequestDeconflictionService = 'Request Deconfliction Service',
	PassMessage = 'Pass Message',
	Squawk = 'Squawk',
	ReadbackApproval = 'Readback Approval'
}

export enum RequestTrafficServiceMATZATZPenetrationStage {
	RequestTrafficService = 'Request Traffic Service',
	RequestMATZATZPenetration = 'Request MATZ/ATZ Penetration',
	PassMessage = 'Pass Message',
	Squawk = 'Squawk',
	ReadbackTrafficService = 'Readback Traffic Service',
	ReadbackDescendInstruction = 'Readback Descend Instruction',
	ReadbackClimbInstruction = 'Readback Climb Instruction',
	ReadbackDescentCompletion = 'Readback Descent Completion',
	ReadbackClimbCompletion = 'Readback Climb Completion',
	ReadbackApproval = 'Readback Approval'
}

export enum PositionReportStage {
	PositionReport = 'Position Report'
}

export enum AvoidingActionStage {
	ReportAvoidingAction = 'Report Avoiding Action' // Reading back the immediate movement to take to avoid action
}

export enum TrafficServiceStage {
	AcknowledgeTrafficInformation = 'Acknowledge Traffic Information' // Roger to traffic information
}

export enum RequestTrueBearingStage {
	RequestBearing = 'Request Bearing',
	ReadbackBearing = 'Readback Bearing'
}

export enum RequestQDMStage {
	RequestQDM = 'Request QDM',
	ReadbackQDM = 'Readback QDM'
}

export enum RequestWeatherStage {
	RequestWeather = 'Request Weather',
	RogerOrWilco = 'Roger Or Wilco'
}

export enum RequestTrueBearingControllerOverloadedStage {
	RequestBearing = 'Request Bearing',
	ReportChangingFrequency = 'Report Changing Frequency',
	RequestBearingFromSecondController = 'Request Bearing From Second Controller',
	ReportChangingFrequencyBack = 'Report Changing Frequency Back'
}

export enum RequestWeatherControllerOverloadedStage {
	RequestWeather = 'Request Weather',
	ReportChangingFrequency = 'Report Changing Frequency',
	RequestWeatherFromSecondController = 'Request Weather From Second Controller',
	ReportChangingFrequencyBack = 'Report Changing Frequency Back'
}

export enum PanStage {
	DeclareEmergency = 'Declare Emergency',
	WilcoInstructions = 'Wilco Instructions',
	CancelPan = 'Cancel Pan'
}

export enum PanPanStage {
	DeclareEmergency = 'Declare Emergency',
	WilcoInstructions = 'Wilco Instructions',
	CancelPanPan = 'Cancel Pan Pan'
}

export enum PanPanPanStage {
	DeclareEmergency = 'Declare Emergency',
	WilcoInstructions = 'Wilco Instructions',
	CancelPanPanPan = 'Cancel Pan Pan Pan'
}

export enum MaydayStage {
	DeclareEmergency = 'Declare Emergency',
	WilcoInstructions = 'Wilco Instructions',
	CancelMayday = 'Cancel Mayday'
}

export enum RelayMaydayStage {
	DeclareRelayedEmergency = 'Declare Relayed Emergency',
	CancelRelayedMayday = 'Cancel Relayed Mayday'
}

export enum InboundForJoinStage {
	RequestJoin = 'Request Join',
	ReportDetails = 'Report Details',
	ReadbackOverheadJoinClearance = 'Readback Overhead Join Clearance',
	ReportAerodromeInSight = 'Report Aerodrome In Sight',
	ContactTower = 'Contact Tower',
	AcknowledgeGoAround = 'Acknowledge Go Around', // If told to go around by ATC
	AnnounceGoAround = 'Announce Go Around' // If pilot decides to go around
}

export enum CircuitAndLandingStage {
	ReportStatus = 'Report Status',
	ReadbackLandingInformation = 'Readback Landing Information',
	ReportCrosswindJoin = 'Report Crosswind Join',
	ReportDescending = 'Report Descending',
	WilcoReportDownwind = 'Wilco Report Downwind',
	ReportDownwind = 'Report Downwind',
	WilcoFollowTraffic = 'Wilco Follow Traffic',
	ReportFinal = 'Report Final',
	ReadbackContinueApproach = 'Readback Continue Approach',
	ReadbackLandingClearance = 'Readback Landing Clearance',
	AcknowledgeGoAround = 'Acknowledge Go Around', // If told to go around by ATC
	AnnounceGoAround = 'Announce Go Around' // If pilot decides to go around
}

export enum LandingToParkedStage {
	ReadbackVacateRunwayRequest = 'Readback Vacate Runway Request',
	ReportVacatedRunway = 'Report Vacated Runway',
	ReportTaxiing = 'Report Taxiing', // Uncontrolled aerodrome
	ReadbackTaxiInformation = 'Readback Taxi Information'
}

export const StartAerodromeStage = { ...StartUpStage, ...TaxiStage, ...TakeOffStage };

export const AirborneStage = {};

export const LandingStage = {
	...InboundForJoinStage,
	...CircuitAndLandingStage,
	...LandingToParkedStage
};

export const RouteStage = {
	...StartAerodromeStage,
	...AirborneStage,
	...LandingStage
};
