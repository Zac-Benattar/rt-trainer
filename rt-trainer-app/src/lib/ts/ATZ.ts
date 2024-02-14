import RouteElement from './RouteElement';
import { lineIntersectsPolygon, anyPointsInPolygon, pointInPolygon } from './utils';

export default class ATZ extends RouteElement {
	public height: string;
	public type: number;
	public centre: [number, number];

	constructor(
		name: string,
		geometry: [number, number][],
		centre: [number, number],
		type: number,
		height?: string
	) {
		super(name, geometry);
		this.type = type;
		this.centre = centre;
		if (height) {
			this.height = height;
		} else {
			this.height = 'GND';
		}
	}

	public getName(): string {
		if (this.type === 14) {
			return this.name + ' MATZ';
		}
		return this.name + ' ATZ';
	}

	public getHeight(): string {
		return this.height;
	}

	public getCoords(): [number, number][] {
		return this.geometry;
	}

	public getClosestPointOnEdge(coords: [number, number]): [number, number] {
		return findClosestPoint(coords, this.geometry[0]);
	}

	public pointInsideATZ(point: [number, number]): boolean {
		return pointInPolygon(point, this.geometry[0]);
	}

	public lineIntersectsATZ(start: [number, number], end: [number, number]): boolean {
		return lineIntersectsPolygon(start, end, this.geometry[0]);
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

function findClosestPoint(
	targetPoint: [number, number],
	pointsList: [number, number][]
): [number, number] | null {
	if (pointsList.length === 0) {
		return null; // No points in the list
	}

	let closestPoint = pointsList[0];
	let minDistance = calculateDistance(targetPoint, closestPoint);

	for (let i = 1; i < pointsList.length; i++) {
		const currentPoint = pointsList[i];
		const distance = calculateDistance(targetPoint, currentPoint);

		if (distance < minDistance) {
			minDistance = distance;
			closestPoint = currentPoint;
		}
	}

	return closestPoint;
}

function calculateDistance(point1: [number, number], point2: [number, number]): number {
	const [x1, y1] = point1;
	const [x2, y2] = point2;
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
