export default class Runway {
	designator: string;
	trueHeading: number;
	alignedTrueNorth: boolean;
	operations: number;
	mainRunway: boolean;
	turnDirection: number;
	landingOnly: boolean;
	takeOffOnly: boolean;
	lengthValue: number;
	lengthUnit: number;
	widthValue: number;
	widthUnit: number;
	toraValue: number;
	toraUnit: number;
	todaValue: number;
	todaUnit: number;
	asdaValue: number;
	asdaUnit: number;
	ldaValue: number;
	ldaUnit: number;
	thresholdCoordinates: [number, number];
	elevationValue: number;
	elevationUnit: number;
	exclusiveAircraftType: number[];
	pilotCtrlLighting: boolean;
	lightingSystem: number[];
	visualApproachAids: number[];

	constructor(
		designator: string,
		trueHeading: number,
		alignedTrueNorth: boolean,
		operations: number,
		mainRunway: boolean,
		turnDirection: number,
		landingOnly: boolean,
		takeOffOnly: boolean,
		lengthValue: number,
		lengthUnit: number,
		widthValue: number,
		widthUnit: number,
		toraValue: number,
		toraUnit: number,
		todaValue: number,
		todaUnit: number,
		asdaValue: number,
		asdaUnit: number,
		ldaValue: number,
		ldaUnit: number,
		thresholdCoordinates: [number, number],
		elevationValue: number,
		elevationUnit: number,
		exclusiveAircraftType: number[],
		pilotCtrlLighting: boolean,
		lightingSystem: number[],
		visualApproachAids: number[]
	) {
		this.designator = designator;
		this.trueHeading = trueHeading;
		this.alignedTrueNorth = alignedTrueNorth;
		this.operations = operations;
		this.mainRunway = mainRunway;
		this.turnDirection = turnDirection;
		this.landingOnly = landingOnly;
		this.takeOffOnly = takeOffOnly;
		this.lengthValue = lengthValue;
		this.lengthUnit = lengthUnit;
		this.widthValue = widthValue;
		this.widthUnit = widthUnit;
		this.toraValue = toraValue;
		this.toraUnit = toraUnit;
		this.todaValue = todaValue;
		this.todaUnit = todaUnit;
		this.asdaValue = asdaValue;
		this.asdaUnit = asdaUnit;
		this.ldaValue = ldaValue;
		this.ldaUnit = ldaUnit;
		this.thresholdCoordinates = thresholdCoordinates;
		this.elevationValue = elevationValue;
		this.elevationUnit = elevationUnit;
		this.exclusiveAircraftType = exclusiveAircraftType;
		this.pilotCtrlLighting = pilotCtrlLighting;
		this.lightingSystem = lightingSystem;
		this.visualApproachAids = visualApproachAids;
	}
}
