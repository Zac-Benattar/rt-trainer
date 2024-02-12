
import RouteElement from './RouteElement';
import { lineIntersectsPolygon, anyPointsInPolygon, pointInPolygon } from './utils';

export default class ATZ extends RouteElement {
	public height: string;
	public type: number;

	constructor(name: string, coords: [number, number][], type: number, height?: string) {
		super(name, coords);
		this.type = type;
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
		return this.coords;
	}

	public getClosestPointOnEdge(coords: [number, number]): [number, number] {
		return findClosestPoint(coords, this.coords);
	}

    public pointInsideATZ(point: [number, number]): boolean {
        return pointInPolygon(point, this.coords);
    }

	public lineIntersectsATZ(start: [number, number], end: [number, number]): boolean {
		return lineIntersectsPolygon(start, end, this.coords);
	}

	public isIncludedInRoute(route: [number, number][]): boolean {
		return anyPointsInPolygon(this.coords, route);
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
