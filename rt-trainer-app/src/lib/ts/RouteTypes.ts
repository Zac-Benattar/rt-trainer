export enum WaypointType {
	Aerodrome, // For use when not in the air
	NDB, // Non-directional beacon - helps with positioning
	VOR, // VHF Omnidirectional Range station - helps with positioning
	Fix, // Arbitrary well know easy to spot visual point e.g. a road junction or reservoir
	DME, // Distance Measuring Equipment - helps with positioning by measuring distance from a VOR
	GPS, // GPS waypoint - arbitrary point defined in terms of lat/long
	Intersection, // Intersection of two or more airways
	NewAirspace, // Entering new airspace - changing frequency
	Emergency // Emergency - no special location
}

export enum EmergencyType {
	None = 'None',
	EngineFailure = 'Engine Failure',
	RelayEmergency = 'Relay Emergency',
}

/* Represents location, heading altitude and airSpeed of the aircraft. Term borrowed from robotics */
export type Pose = {
	lat: number;
	long: number
	magneticHeading: number;
	trueHeading: number;
	altitude: number;
	airSpeed: number;
};

/* Point in space. */
export type Waypoint = {
	waypointType: WaypointType;
	lat: number;
	long: number;
	name: string;
};

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