/* Point in space along a route. */
export default class Waypoint {
	type: WaypointType;
	lat: number;
	long: number;
	index: number;
	name: string;

	constructor(name: string, lat: number, long: number, waypointType: WaypointType, index: number) {
		this.name = name;
		this.lat = lat;
		this.long = long;
		this.type = waypointType;
		this.index = index;
	}

	public getName(): string {
		return this.name;
	}

	public getLat(): number {
		return this.lat;
	}

	public getLong(): number {
		return this.long;
	}

	public getCoords(): [number, number] {
		return [this.lat, this.long];
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
