export enum FrequencyType {
	AFIS = 'AFIS',
	TWR = 'TWR',
	GND = 'GND'
}

export enum FlightRules {
	IFR = 'IFR', // Instrument Flight Rules
	VFR = 'VFR' // Visual Flight Rules
}

export type RadioFrequency = {
	frequencyType: FrequencyType;
	frequency: number;
	callsign: string;
};

export type Location = {
	lat: number;
	long: number;
};

/* Represents location, heading altitude and airSpeed of the aircraft. Term borrowed from robotics */
export type Pose = {
	location: Location;
	heading: number;
	altitude: number;
	airSpeed: number;
};

export type RunwayHoldingPoint = {
	name: string;
	location: Location;
};

export type Runway = {
	name: string;
	holdingPoints: RunwayHoldingPoint[];
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
	comFrequencies: RadioFrequency[];
	runways: Runway[];
	location: Location;
	altitude: number;
	startPoint: string;
	metorData: METORData;
};

export enum WaypointType {
	Aerodrome, // For use when not in the air
	NDB, // Non-directional beacon - helps with positioning
	VOR, // VHF Omnidirectional Range station - helps with positioning
	Fix, // Arbitrary well know easy to spot visual point e.g. a road junction or reservoir
	DME, // Distance Measuring Equipment - helps with positioning by measuring distance from a VOR
	GPS, // GPS waypoint - arbitrary point defined in terms of lat/long
	Intersection, // Intersection of two or more airways
	NewAirspace // Entering new airspace - changing frequency
}

/* A waypoint is a point in space that can be navigated to. Associated with points on the route.
	May or may not be visible. Has both a location for the waypoint itself and an aircraftPose,
	which represents the pose of the aircraft at this point. Used for cusomising the pose 
	at specific points, for example if ATC request a notification when a waypoint is in sight.
	In this case the aircraftPose can be set to a slight offset from the waypoint's location. */
export type Waypoint = {
	waypointType: WaypointType;
	location: Location;
	aircraftPose: Pose;
	visible: boolean;
	name: string;
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
	dialMode: TransponderDialMode;
	frequency: number;
	ident_enabled: boolean;
	vfrHasExecuted: boolean;
};

/* The details of a aircraft selected by the user. */
export type AircraftDetails = {
	callsign: string;
	prefix: string;
	aircraftType: string;
};

export enum EmergencyType {
	None = 'None',
	Mayday = 'Mayday',
	Pan = 'Pan'
}