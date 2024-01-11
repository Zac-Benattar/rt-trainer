export enum Status {
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

export enum EmergencyType {
	'None',
	'Mayday',
	'PanPan'
}

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
	air_speed: number;
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

export type METORData = {
	avg_wind_direction: number;
	mean_wind_speed: number;
	std_wind_speed: number;
	mean_pressure: number;
	std_pressure: number;
	mean_temperature: number;
	std_temperature: number;
	mean_dewpoint: number;
	std_dewpoint: number;
};

export type METORDataSample = {
	wind_direction: number;
	wind_speed: number;
	pressure: number;
	temperature: number;
	dewpoint: number;
};

export type Aerodrome = {
	name: string;
	icao: string;
	com_freqs: COMFrequency[];
	runways: Runway[];
	lat: number;
	long: number;
	start_point: string;
	metor_data: METORData;
};

export enum RoutePointType {
	Aerodrome,
	Waypoint,
};

export type RoutePoint = {
	point_type: RoutePointType;
	location: Location;
	name: string;
	com_frequencies: COMFrequency[];
	states: RecievedState[];
}

export type SentState = {
	stage: RoutePointStage;
	prefix: string;
	callsign: string;
	squark: boolean;
	current_target: COMFrequency;
	current_radio_frequency: number;
	current_transponder_frequency: number;
	aircraft_type: string;
};

export type RecievedState = {
	stage: RoutePointStage;
	callsign_modified: boolean;
	squark: boolean;
	current_target: COMFrequency;
	current_transponder_frequency: number;
	pose: Pose;
	emergency: EmergencyType;
};

export type TransponderDialMode = 'OFF' | 'SBY' | 'GND' | 'STBY' | 'ON' | 'ALT' | 'TEST';

export type RadioMode = 'OFF' | 'COM' | 'NAV';

export type RadioDialMode = 'OFF' | 'SBY';

export type SentStateMessageSeeds = {
	state: SentState;
	message: string;
	scenario_seed: number;
	weather_seed: number;
};

export type RecievedStateMessage = {
	state: RecievedState;
	message: string;
};

export type Mistake = {
	details: string;
	message: string;
};

export type AircraftDetails = {
	callsign: string;
	prefix: string;
	aircraft_type: string;
};

export type ScenarioSeed = {
	seedString: string;
	scenarioSeed: number;
	weatherSeed: number;
};

export type SimulatorSettings = {
	unexpectedEvents: boolean;
	speechInput: boolean;
	readRecievedCalls: boolean;
};

export type RadioState = {
	mode: RadioMode;
	dial_mode: RadioDialMode;
	active_frequency: number;
	standby_frequency: number;
	tertiary_frequency: number;
};

export type TransponderState = {
	dial_mode: TransponderDialMode;
	frequency: number;
	ident_enabled: boolean;
	vfr_has_executed: boolean;
};
