import RouteElement from './RouteElement';

/* Point in space. */
export class Waypoint extends RouteElement {
	waypointType: WaypointType;
	name: string;
	arrivalTime: number;

	constructor(
		waypointType: WaypointType,
        coords: [number, number],
		name: string,
		arrivalTime: number
	) {
		super(name, [coords]);
		this.waypointType = waypointType;
		this.name = name;
		this.arrivalTime = arrivalTime;
	}

	public getName(): string {
		return this.name;
	}

	public getCoords(): [number, number][] {
		return this.geometry;
	}

    public getWaypointCoords(): [number, number] {
        return this.geometry[0];
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
