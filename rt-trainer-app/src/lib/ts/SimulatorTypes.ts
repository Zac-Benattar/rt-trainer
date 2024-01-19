export enum FrequencyType {
	Information = 'Information',
	Tower = 'Tower',
	Ground = 'Ground',
	Radar = 'Radar',
	None = 'None'
}

export enum FlightRules {
	IFR = 'IFR', // Instrument Flight Rules
	VFR = 'VFR' // Visual Flight Rules
}

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

/* Point in space. */
export type Waypoint = {
	waypointType: WaypointType;
	location: Location;
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
	identEnabled: boolean;
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
