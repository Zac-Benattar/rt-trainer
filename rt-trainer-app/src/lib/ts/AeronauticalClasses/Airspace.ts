import {
	lineIntersectsPolygon,
	pointInPolygon,
	getClosestPointFromCollection,
} from '../utils';

export default class Airspace {
	public id: string;
	public name: string;
	public type: number;
	public icaoClass: number;
	public activity: number;
	public onDemand: boolean;
	public onRequest: boolean;
	public byNotam: boolean;
	public specialAgreement: boolean;
	public requestCompliance: boolean;
	public centrePoint: [number, number];
	public coordinates: [number, number][];
	public country: string;
	public upperLimit: number;
	public lowerLimit: number;
	public upperLimitMax: number;
	public lowerLimitMin: number;

	constructor(
		id: string,
		name: string,
		type: number,
		icaoClass: number,
		activity: number,
		onDemand: boolean,
		onRequest: boolean,
		byNotam: boolean,
		specialAgreement: boolean,
		requestCompliance: boolean,
		centrePoint: [number, number],
		coordinates: [number, number][],
		country: string,
		upperLimit: number,
		lowerLimit: number,
		upperLimitMax: number,
		lowerLimitMin: number
	) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.icaoClass = icaoClass;
		this.activity = activity;
		this.onDemand = onDemand;
		this.onRequest = onRequest;
		this.byNotam = byNotam;
		this.specialAgreement = specialAgreement;
		this.requestCompliance = requestCompliance;
		this.centrePoint = centrePoint;
		this.coordinates = coordinates;
		this.country = country;
		this.upperLimit = upperLimit;
		this.lowerLimit = lowerLimit;
		this.upperLimitMax = upperLimitMax;
		this.lowerLimitMin = lowerLimitMin;
	}

	public getDisplayName(): string {
		if (this.type === 14) {
			return this.name + ' MATZ';
		}
		return this.name + ' ATZ';
	}

	public getCoords(): [number, number][] {
		return this.coordinates;
	}

	public getClosestPointOnEdge(coords: [number, number]): [number, number] | null {
		return getClosestPointFromCollection(coords, this.coordinates);
	}

	public pointInsideATZ(point: [number, number]): boolean {
		return pointInPolygon(point, this.coordinates);
	}

	public lineIntersectsATZ(start: [number, number], end: [number, number]): boolean {
		return lineIntersectsPolygon(start, end, this.coordinates);
	}

	public isIncludedInRoute(route: [number, number][]): boolean {
		// For each line in the route, check if it intersects the ATZ
		for (let i = 0; i < route.length - 1; i++) {
			if (this.lineIntersectsATZ(route[i], route[i + 1])) {
				return true;
			}
		}
		return false;
	}
}
