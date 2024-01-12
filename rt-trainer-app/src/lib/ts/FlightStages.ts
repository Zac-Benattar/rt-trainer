/* Type of routepoint. Each type has a different set of stages that can be performed. */
export enum RoutePointStageType {
	Parked = 'Parked',
	Taxiing = 'Taxiing',
	HoldingPoint = 'HoldingPoint',
	TakeOff = 'TakeOff',
	Airborne = 'Airborne',
	Descent = 'Descent',
	Approach = 'Approach',
	Landing = 'Landing',
	Landed = 'Landed',
}

/* Stages of a route point. Each stage has a different set of actions that can be performed.
	some of the airborne waypoint stages are optional depending on the generation. */
export enum ParkedStage {
	RadioCheck = 'RadioCheck',
	DepartInfo = 'DepartInfo',
	ReadbackDepartInfo = 'ReadbackDepartInfo',
	TaxiRequest = 'TaxiRequest',
	TaxiClearanceReadback = 'TaxiClearanceReadback',
}

export enum TaxiingStage {
	ReadyForDeparture = 'ReadyForDeparture',
	InfoGivenForDeparture = 'InfoGivenForDeparture',
}

export enum HoldingPointStage {
	ClearedForTakeOff = 'ClearedForTakeOff',
	ReadbackClearance = 'ReadbackClearance',
}

export enum InboundForJoinStage {
	Handshake = 'Handshake',
	LandingRequest = 'LandingRequest',
	ReadbackLandingClearance = 'ReadbackLandingClearance',
	AcknowledgementRAIS = 'AcknowledgementRAIS', // RAIS = report airodrome in sight
	AirodromeInSight = 'AirodromeInSight',
	ContactTower = 'ContactTower',
	AcknowledgeGoAround = 'AcknowledgeGoAround', // If told to go around by ATC
	AnnounceGoAround = 'AnnounceGoAround' // If pilot decides to go around
}

export enum JoinCircuitStage {
	Handshake = 'Handshake',
	CircuitRequest = 'CircuitRequest',
	ReadbackCircuitClearance = 'ReadbackCircuitClearance',
	AcknowledgementAltitude = 'AcknowledgementAltitude',
	ReportDescending = 'ReportDescending',
	AcknowledgeGoAround = 'AcknowledgeGoAround', // If told to go around by ATC
	AnnounceGoAround = 'AnnounceGoAround' // If pilot decides to go around
}

export enum CircuitAndLandingStage {
	ReportDownwind = 'ReportDownwind',
	ReportTrafficInSight = 'ReportTrafficInSight', // Optional if told to follow traffic
	ReportFinal = 'ReportFinal',
	ReadbackContinueApproach = 'ReadbackContinueApproach',
	ReadbackLandingClearance = 'ReadbackLandingClearance',
	AcknowledgeGoAround = 'AcknowledgeGoAround', // If told to go around by ATC
	AnnounceGoAround = 'AnnounceGoAround' // If pilot decides to go around
}

export enum LandingToParkedStage {
	Handshake = 'Handshake', // For large airports - may not even be needed
    ReadbackVacateRunwayRequest = 'ReadbackVacateRunwayRequest',
    VacatedRunway = 'VacatedRunway',
    TaxiClearanceReadback = 'TaxiClearanceReadback',
}