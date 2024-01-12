/* Type of routepoint. Each type has a different set of stages that can be performed. */
export enum RoutePointStageType {
	'Parked',
	'Taxiing',
	'Holding',
	'TakeOff',
	'Airborne',
	'Descent',
	'Approach',
	'Landing',
	'Landed'
}

/* Stages of a route point. Each stage has a different set of actions that can be performed.
	some of the airborne waypoint stages are optional depending on the generation. */
export enum ParkedStage {
	RadioCheck,
	DepartInfo,
	ReadbackDepartInfo,
	TaxiRequest,
	TaxiClearanceReadback
}

export enum TaxiingStage {
	ReadyForDeparture,
	InfoGivenForDeparture
}

export enum HoldingPointStage {
	ClearedForTakeOff,
	ReadbackClearance
}

export enum InboundForJoinStage {
	PreHandshake,
	PreLandingRequest,
	PreReadbackLandingClearance,
	PreAcknowledgementRAIS, // RAIS = report airodrome in sight
	PreAirodromeInSight,
	PreContactTower,
	PreAcknowledgeGoAround, // If told to go around by ATC
	PreAnnounceGoAround // If pilot decides to go around
}

export enum JoinCircuitStage {
	PreHandshake,
	PreCircuitRequest,
	PreReadbackCircuitClearance,
	PreAcknowledgementAltitude,
	PreReportDescending,
	PreAcknowledgeGoAround, // If told to go around by ATC
	PreAnnounceGoAround // If pilot decides to go around
}

export enum CircuitAndLandingStage {
	PreReportDownwind,
	PreReportTrafficInSight, // Optional if told to follow traffic
	PreReportFinal,
	PreReadbackContinueApproach,
	PreReadbackLandingClearance,
	PreAcknowledgeGoAround, // If told to go around by ATC
	PreAnnounceGoAround // If pilot decides to go around
}

export enum LandingToParkedStage {
	PreHandshake, // For large airports - may not even be needed
    PreReadbackVacateRunwayRequest,
    PreVacatedRunway,
    PreTaxiClearanceReadback,
}