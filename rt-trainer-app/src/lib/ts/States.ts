import {
	HoldingPointStage,
	ParkedStage,
	RoutePointStageType as RoutePointStateType,
	TaxiingStage
} from './FlightStages';

export type COMFrequency = {
	frequency_type: 'AFIS' | 'TWR' | 'GND';
	frequency: number;
	callsign: string;
};

export type Location = {
	lat: number;
	long: number;
};

export type Pose = {
	location: Location;
	heading: number;
	altitude: number;
	airSpeed: number;
};

export enum WaypointType {
	Aerodrome,
	NDB, // Non-directional beacon - helps with positioning
	VOR, // VHF Omnidirectional Range station - helps with positioning
	Fix, // Arbitrary well know easy to spot visual point e.g. a road junction or reservoir
	DME, // Distance Measuring Equipment - helps with positioning by measuring distance from a VOR
	GPS, // GPS waypoint - arbitrary point defined in terms of lat/long
	Intersection, // Intersection of two or more airways
	NewAirspace // Entering new airspace - changing frequency
}

/* A waypoint is a point in space that can be navigated to. Visible on the route. */
export type Waypoint = {
	waypoint_type: WaypointType;
	location: Location;
	name: string;
	com_frequencies: COMFrequency[];
};

export type HoldingPoint = {
	name: string;
};

export type Runway = {
	name: string;
	holding_points: HoldingPoint[];
};

/* METORlogical data. */
export type METORData = {
	avgWindDirection: number;
	meanWindSpeed: number;
	stdWindSpeed: number;
	meanPressure: number;
	stdPressure: number;
	meanTemperature: number;
	stdTemperature: number;
	meanDewpoint: number;
	stdDewpoint: number;
};

/* METOR data sample. Obtained from taking a random sample of the METOR data model. */
export type METORDataSample = {
	windDirection: number;
	windSpeed: number;
	pressure: number;
	temperature: number;
	dewpoint: number;
};

/* Aerodrome data. */
export type Aerodrome = {
	name: string;
	icao: string;
	comFrequencies: COMFrequency[];
	runways: Runway[];
	location: Location;
	altitude: number;
	startPoint: string;
	metorData: METORData;
};

/* Point on route. Used for generation and not visible to the user. */
export class RoutePointState {
	stateType: RoutePointStateType = RoutePointStateType.Parked;
	pose: Pose = {
		location: {
			lat: 0,
			long: 0
		},
		heading: 0,
		altitude: 0,
		airSpeed: 0
	};

	constructor(stateType: RoutePointStateType, pose: Pose) {
		this.stateType = stateType;
		this.pose = pose;
	}
}

export class ParkedState extends RoutePointState {
	stage: ParkedStage;
	constructor(stage: ParkedStage, aerodrome: Aerodrome) {
		super(RoutePointStateType.Parked, {
			location: aerodrome.location,
			heading: 0,
			altitude: aerodrome.altitude,
			airSpeed: 0
		});
		this.stage = stage;
	}
}

export class TaxiingState extends RoutePointState {
	stage: TaxiingStage;
	constructor(stage: TaxiingStage, aerodrome: Aerodrome) {
		super(RoutePointStateType.Taxiing, {
			location: aerodrome.location,
			heading: 0,
			altitude: aerodrome.altitude,
			airSpeed: 0
		});
		this.stage = stage;
	}
}

/* Holding point on route. Used for generation and not visible to the user. */
export class HoldingPointState extends RoutePointState {
	stage: HoldingPointStage;
	holding_point: HoldingPoint = {
		name: ''
	};

	constructor(stage: HoldingPointStage, holding_point: HoldingPoint, pose: Pose) {
		super(RoutePointStateType.HoldingPoint, pose);
		this.stage = stage;
		this.holding_point = holding_point;
	}
}

/* Point in the air. Used for generation and may be visible to the user if it conincides with a waypoint. */
export class AirborneState extends RoutePointState {
	flightRules: 'IFR' | 'VFR' = 'VFR';
	airbourneEvent: 'TakeOff' | 'Landing' = 'TakeOff';
	emergency: 'None' | 'Mayday' | 'Pan' = 'None';

	constructor(
		flightRules: 'IFR' | 'VFR',
		airbourneEvent: 'TakeOff' | 'Landing',
		emergency: 'None' | 'Mayday' | 'Pan',
		pose: Pose
	) {
		super(RoutePointStateType.Airborne, pose);
		this.flightRules = flightRules;
		this.airbourneEvent = airbourneEvent;
		this.emergency = emergency;
	}
}

/* The state data which must be sent to the server for use in parsing. */
export type CallParsingData = {
	stage: RoutePointState;
	fix: string;
	callsign: string;
	squark: boolean;
	currentTarget: COMFrequency;
	currentRadioFrequency: number;
	currentTransponderFrequency: number;
	aircraftType: string;
};

/* The state data recieved from the server after parsing. Used to update the simulator frontend. */
export type SimulatorUpdateData = {
	stage: RoutePointState;
	callsignModified: boolean;
	squark: boolean;
	currentTarget: COMFrequency;
	currentTransponderFrequency: number;
	location: Location;
	emergency: 'None' | 'Mayday' | 'Pan';
};

/* The simulator data which must be sent to the server to generate the next state. */
export type SentStateMessageSeeds = {
	state: CallParsingData;
	message: string;
	scenarioSeed: number;
	weatherSeed: number;
};

/* The simulator data recieved from the server after generating the next state. Used to update the simulator frontend. */
export type RecievedStateMessage = {
	state: SimulatorUpdateData;
	message: string;
};

/* The details of a radio call mistake made by the user. */
export type Mistake = {
	callExpected: string;
	callFound: string;
	details: string;
};

/* The details of a aircraft selected by the user. */
export type AircraftDetails = {
	callsign: string;
	prefix: string;
	aircraftType: string;
};

/* The seed used to generate the scenario and weather. Split into scenario and weather seed for easy access. */
export type ScenarioSeed = {
	seedString: string;
	scenarioSeed: number;
	weatherSeed: number;
};

/* The settings for the simulation. */
export type SimulatorSettings = {
	unexpectedEvents: boolean;
	speechInput: boolean;
	readRecievedCalls: boolean;
};

export type TransponderDialMode = 'OFF' | 'SBY' | 'GND' | 'STBY' | 'ON' | 'ALT' | 'TEST';

export type RadioMode = 'OFF' | 'COM' | 'NAV';

export type RadioDialMode = 'OFF' | 'SBY';

/* The state of the radio. */
export type RadioState = {
	mode: RadioMode;
	dialMode: RadioDialMode;
	activeFrequency: number;
	standbyFrequency: number;
	tertiaryFrequency: number;
};

/* The state of the transponder. */
export type TransponderState = {
	dial_mode: TransponderDialMode;
	frequency: number;
	ident_enabled: boolean;
	vfr_has_executed: boolean;
};
