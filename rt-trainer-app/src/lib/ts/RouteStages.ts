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

export enum InboundForJoinStage {
	RequestJoin = 'Request Join',
	ReportDetails = 'Report Details',
	ReadbackJoinClearance = 'Readback Join Clearance',
	ReportAirodromeInSight = 'Report Airodrome In Sight',
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
