import { init } from "@paralleldrive/cuid2";

const CUID = init({ length: 10 });

/* Point in space along a route. */
export default class Waypoint {
	type: WaypointType;
	location: [number, number];
	index: number;
	name: string;
	description: string;
	id: string;

	constructor(
		name: string,
		location: [number, number],
		waypointType: WaypointType,
		index: number,
		description: string = ''
	) {
		
		this.name = name;
		this.location = location;
		this.type = waypointType;
		this.index = index;
		this.description = description;
		this.id = CUID();
	}
}

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
