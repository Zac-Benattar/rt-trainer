import type Airspace from './AeronauticalClasses/Airspace';
import type Waypoint from './AeronauticalClasses/Waypoint';

// Simple hash function: hash * 31 + char
export function simpleHash(str: string): number {
	let hash = 0;

	if (str === undefined || str.length === 0) {
		return hash;
	}

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
	}

	return Math.abs(hash);
}

// Splits a number into two halves and pads them with zeros to make sure they are the same length
export function splitAndPadNumber(input: number): [number, number] {
	const numberString = input.toString();
	const halfLength = Math.ceil(numberString.length / 2);
	const firstHalf = parseInt(numberString.padEnd(halfLength, '0').slice(0, halfLength));
	const secondHalf = parseInt(numberString.slice(halfLength).padEnd(halfLength, '0'));
	return [firstHalf, secondHalf];
}

// Function to generate a seeded normal distribution
export function seededNormalDistribution(
	seedString: string,
	mean: number,
	standardDeviation: number
): number {
	// Generate two 'random' numbers from seed for the Box-Muller transform
	const [v1, v2] = splitAndPadNumber(simpleHash(seedString));
	const u1 = 1 / v1;
	const u2 = 1 / v2;

	// Box-Muller transform
	const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

	// Scale and shift to get the desired mean and standard deviation
	const result = z0 * standardDeviation + mean;

	return result;
}

/* Returns the distance between two locations on the earth in metres. */
export function haversineDistance(
	lat1: number,
	long1: number,
	lat2: number,
	long2: number
): number {
	const R = 6371e3; // metres
	const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((long2 - long1) * Math.PI) / 180;

	return (
		2 *
		R *
		Math.asin(
			Math.sqrt(
				Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
					Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
			)
		)
	);
}

/* Returns a lower copy of the string with single length spaces and no punctuation. */
export function processString(str: string): string {
	return trimSpaces(removePunctuation(str.toLowerCase()));
}

/* Removes all punctuation from a string. */
export function removePunctuation(str: string): string {
	return str.replace(/(?<=\d),(?=\d)|[^\d\w\s.-]/g, ' ');
}

/* Shortens all spaces to a single space. */
export function trimSpaces(str: string): string {
	return str.replace(/\s+/g, ' ');
}

/* Removes all digits from a string. */
export function removeDigits(str: string): string {
	return str.replace(/[0-9]/g, '');
}

export function isCallsignStandardRegistration(callsign: string): boolean {
	return callsign.length == 6 && callsign.charAt(1) == '-';
}

/* Returns a abbreviated callsign. */
export function getAbbreviatedCallsign(
	scenarioSeed: number,
	aircraftType: string,
	callsign: string
): string {
	let abbreviatedCallsign: string = '';
	if (callsign.length == 6) {
		if (isCallsignStandardRegistration(callsign)) {
			// G-OFLY -> G-LY
			abbreviatedCallsign += callsign.charAt(0);
			abbreviatedCallsign += '-';
			abbreviatedCallsign += callsign.charAt(4);
			abbreviatedCallsign += callsign.charAt(5);
		} else {
			abbreviatedCallsign += callsign;
		}
	} else {
		const callsign_words: string[] = callsign.split(' ');
		abbreviatedCallsign += callsign_words[0];
	}

	return abbreviatedCallsign;
}

export function replacePhoneticAlphabetDecimalWithNumber(str: string): string {
	return str.replace(/(\d{3}) decimal (\d{3})/g, '$1.$2');
}

export function numberToPhoneticString(number: number, precision: number): string {
	const phoneticNumbers = {
		'0': 'Zero',
		'1': 'One',
		'2': 'Two',
		'3': 'Three',
		'4': 'Four',
		'5': 'Five',
		'6': 'Six',
		'7': 'Seven',
		'8': 'Eight',
		'9': 'Nine'
	};

	const stringNumber = number.toFixed(precision);
	let result: string = '';

	for (let i = 0; i < stringNumber.length; i++) {
		const char = stringNumber[i];

		if (/[0-9]/.test(char)) {
			result += phoneticNumbers[char] + ' ';
		} else if (char === '-') {
			result += 'Dash ';
			continue;
		} else if (char === '.') {
			result += 'Decimal ';
		} else {
			result += char + ' ';
		}
	}

	return result.trim();
}

export function replacePhoneticAlphabetWithChars(str: string): string {
	const phoneticAlphabetMapping = {
		alpha: 'A',
		bravo: 'B',
		charlie: 'C',
		delta: 'D',
		echo: 'E',
		foxtrot: 'F',
		golf: 'G',
		hotel: 'H',
		india: 'I',
		juliet: 'J',
		kilo: 'K',
		lima: 'L',
		mike: 'M',
		november: 'N',
		oscar: 'O',
		papa: 'P',
		quebec: 'Q',
		romeo: 'R',
		sierra: 'S',
		tango: 'T',
		uniform: 'U',
		victor: 'V',
		whiskey: 'W',
		xray: 'X',
		yankee: 'Y',
		zulu: 'Z',
		zero: '0',
		one: '1',
		two: '2',
		three: '3',
		four: '4',
		five: '5',
		six: '6',
		seven: '7',
		eight: '8',
		niner: '9'
	};

	// Create a regular expression pattern to match any of the phonetic alphabet words
	const pattern = new RegExp(Object.keys(phoneticAlphabetMapping).join('|'), 'gi');

	// Replace occurrences of phonetic alphabet words with their corresponding characters
	return str.replace(pattern, (match) => phoneticAlphabetMapping[match.toLowerCase()]).trim();
}

export function replaceWithPhoneticAlphabet(text: string) {
	const phoneticAlphabet = {
		A: 'Alpha',
		B: 'Bravo',
		C: 'Charlie',
		D: 'Delta',
		E: 'Echo',
		F: 'Foxtrot',
		G: 'Golf',
		H: 'Hotel',
		I: 'India',
		J: 'Juliet',
		K: 'Kilo',
		L: 'Lima',
		M: 'Mike',
		N: 'November',
		O: 'Oscar',
		P: 'Papa',
		Q: 'Quebec',
		R: 'Romeo',
		S: 'Sierra',
		T: 'Tango',
		U: 'Uniform',
		V: 'Victor',
		W: 'Whiskey',
		X: 'X-ray',
		Y: 'Yankee',
		Z: 'Zulu'
	};

	const phoneticNumbers = {
		'0': 'Zero',
		'1': 'One',
		'2': 'Two',
		'3': 'Three',
		'4': 'Four',
		'5': 'Five',
		'6': 'Six',
		'7': 'Seven',
		'8': 'Eight',
		'9': 'Niner'
	};

	const upperText = text.toUpperCase();

	let result = '';
	for (let i = 0; i < upperText.length; i++) {
		const char = upperText[i];

		if (/[A-Z]/.test(char)) {
			const natoWord = phoneticAlphabet[char];
			result += natoWord + ' ';
		} else if (/[0-9]/.test(char)) {
			const natoNumber = phoneticNumbers[char];
			result += natoNumber + ' ';
		} else if (char === '-') {
			// Ignore hyphens
			continue;
		} else if (char === '.') {
			result += 'Decimal ';
		} else {
			result += char + ' ';
		}
	}

	return result.trim();
}

export function generateRandomURLValidString(length: number) {
	const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let randomString = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length);
		randomString += charset.charAt(randomIndex);
	}

	return randomString;
}

/* Following four functions from https://www.trysmudford.com/blog/linear-interpolation-functions/ */
export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;
export const invlerp = (x: number, y: number, a: number) => clamp((a - x) / (y - x));
export const clamp = (a: number, min = 0, max = 1) => Math.min(max, Math.max(min, a));
export const range = (x1: number, y1: number, x2: number, y2: number, a: number) =>
	lerp(x2, y2, invlerp(x1, y1, a));

export const lerpLocation = (
	lat1: number,
	long1: number,
	lat2: number,
	long2: number,
	a: number
): { lat: number; long: number } => {
	return {
		lat: lerp(lat1, lat2, a),
		long: lerp(long1, long2, a)
	};
};

export function toRadians(degrees: number): number {
	let radians = degrees * (Math.PI / 180);
	if (radians < 0) {
		radians += 2 * Math.PI;
	}
	return radians;
}

export function toDegrees(radians: number): number {
	let degrees = radians * (180 / Math.PI);
	if (degrees < 0) {
		degrees += 360;
	}
	return degrees;
}

export function getHeadingBetween(
	lat1: number,
	long1: number,
	lat2: number,
	long2: number
): number {
	const dLon = toRadians(long2 - long1);

	const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
	const x =
		Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
		Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);

	const bearing = toDegrees(Math.atan2(y, x));

	// Normalize the bearing to be in the range [0, 360)
	return Math.round((bearing + 360) % 360);
}

export function getNewCoordsFromCoord(
	startLat: number,
	startLong: number,
	angle: number, // Angle in degrees (bearing from the starting point)
	distance: number // Distance in nautical miles
): Point {
	const earthRadius = 3440.065; // Earth's radius in nauical miles

	const startLatRad = toRadians(startLat);
	const startLongRad = toRadians(startLong);
	const angleRad = toRadians(angle);

	const newLatRad = Math.asin(
		Math.sin(startLatRad) * Math.cos(distance / earthRadius) +
			Math.cos(startLatRad) * Math.sin(distance / earthRadius) * Math.cos(angleRad)
	);

	const newLongRad =
		startLongRad +
		Math.atan2(
			Math.sin(angleRad) * Math.sin(distance / earthRadius) * Math.cos(startLatRad),
			Math.cos(distance / earthRadius) - Math.sin(startLatRad) * Math.sin(newLatRad)
		);

	const newLat = toDegrees(newLatRad);
	const newLong = toDegrees(newLongRad);

	return [newLat, newLong];
}

export function getCompassDirectionFromHeading(heading: number) {
	const compassDirections = [
		'North',
		'North East',
		'East',
		'South East',
		'South',
		'South West',
		'West',
		'North West'
	];

	const index = Math.round(heading / 45) % 8;

	return compassDirections[index];
}

export function stringDecimalLatitudeToNumber(str: string): number | null {
	const regex = /^(\d+\.?\d*)[NS]$/;

	const match = str.match(regex);

	if (match) {
		const decimalPointAdded = match[1].slice(0, 2) + '.' + match[1].slice(2, match[1].length);
		const latitudeValue = parseFloat(decimalPointAdded);

		if (!isNaN(latitudeValue)) {
			return str.endsWith('N') ? latitudeValue : -latitudeValue;
		}
	}

	return null; // Return null if the input string doesn't match the expected format
}

export function stringDecimalLongitudeToNumber(str: string): number | null {
	const regex = /^(\d+\.?\d*)[EW]$/;

	const match = str.slice(2, str.length).match(regex);

	if (match) {
		const decimalPointAdded = match[1].slice(0, 1) + '.' + match[1].slice(2, match[1].length);
		const latitudeValue = parseFloat(decimalPointAdded);

		if (!isNaN(latitudeValue)) {
			return str.endsWith('E') ? latitudeValue : -latitudeValue;
		}
	}

	return null; // Return null if the input string doesn't match the expected format
}

export function convertMinutesToTimeString(minutes: number): string {
	if (typeof minutes !== 'number' || minutes < 0 || minutes >= 24 * 60) {
		throw new Error('Invalid input. Please provide a valid number representing time in minutes.');
	}

	const hours = Math.floor(minutes / 60);
	const remainderMinutes = minutes % 60;

	const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
	const formattedMinutes = remainderMinutes < 10 ? `0${remainderMinutes}` : `${remainderMinutes}`;

	const timeString = `${formattedHours}:${formattedMinutes}`;
	return timeString;
}

export function getRandomSqwuakCode(seed: number): number {
	let code: number = 0;
	for (let i = 0; i < 4; i++) {
		// Swap this out for a big prime
		code += ((seed * 49823748933 * i) % 8) * (10 ^ i);
	}
	return code;
}

type Point = [number, number];

export function pointInPolygon(point: Point, polygon: Point[]): boolean {
	const x = point[0];
	const y = point[1];
	let inside = false;

	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i][0];
		const yi = polygon[i][1];
		const xj = polygon[j][0];
		const yj = polygon[j][1];

		const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

		if (intersect) {
			inside = !inside;
		}
	}

	return inside;
}

export function anyPointsInPolygon(points: Point[], polygon: Point[]): boolean {
	for (const p of points) {
		if (pointInPolygon(p, polygon)) {
			return true;
		}
	}

	return false;
}

export function lineIntersectsPolygon(point1: Point, point2: Point, polygon: Point[]): boolean {
	// Check if any of the line's end points are inside the polygon
	if (pointInPolygon(point1, polygon) || pointInPolygon(point2, polygon)) {
		return true;
	}

	// Check for intersection by iterating through each edge of the polygon
	for (let i = 0; i < polygon.length; i++) {
		const j = (i + 1) % polygon.length;
		const edgeStart = polygon[i];
		const edgeEnd = polygon[j];

		// Check if the line segment defined by point1 and point2 intersects the current edge
		if (doSegmentsIntersect(point1, point2, edgeStart, edgeEnd)) {
			return true;
		}
	}

	return false;
}

export function doSegmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
	const ccw = (p1: Point, p2: Point, p3: Point) => {
		return (p3[1] - p1[1]) * (p2[0] - p1[0]) > (p2[1] - p1[1]) * (p3[0] - p1[0]);
	};

	return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

export function polygonIntersectsOrWithinPolygon(
	innerPolygon: Point[],
	outerPolygon: Point[]
): boolean {
	// Check if any vertex of the inner polygon is inside the outer polygon
	for (const vertex of innerPolygon) {
		if (pointInPolygon(vertex, outerPolygon)) {
			return true;
		}
	}

	// Check for intersection by iterating through each edge of both polygons
	for (let i = 0; i < outerPolygon.length; i++) {
		const j = (i + 1) % outerPolygon.length;
		const edgeStartOuter = outerPolygon[i];
		const edgeEndOuter = outerPolygon[j];

		for (let k = 0; k < innerPolygon.length; k++) {
			const l = (k + 1) % innerPolygon.length;
			const edgeStartInner = innerPolygon[k];
			const edgeEndInner = innerPolygon[l];

			// Check if the edges of both polygons intersect
			if (doSegmentsIntersect(edgeStartOuter, edgeEndOuter, edgeStartInner, edgeEndInner)) {
				return true;
			}
		}
	}

	return false;
}

export function getPolygonCenter(polygon: Point[]): Point {
	if (polygon.length === 0) {
		throw new Error('Empty polygon');
	}

	// Calculate the average of x-coordinates
	const centerX = polygon.reduce((sum, point) => sum + point[0], 0) / polygon.length;

	// Calculate the average of y-coordinates
	const centerY = polygon.reduce((sum, point) => sum + point[1], 0) / polygon.length;

	return [centerX, centerY];
}

export function getClosestPointFromCollection(
	targetPoint: [number, number],
	pointsList: [number, number][]
): [number, number] | null {
	if (pointsList.length === 0) {
		return null; // No points in the list
	}

	let closestPoint = pointsList[0];
	let minDistance = haversineDistance(
		targetPoint[0],
		targetPoint[1],
		closestPoint[0],
		closestPoint[1]
	);

	for (let i = 1; i < pointsList.length; i++) {
		const currentPoint = pointsList[i];
		const distance = haversineDistance(
			targetPoint[0],
			targetPoint[1],
			currentPoint[0],
			currentPoint[1]
		);

		if (distance < minDistance) {
			minDistance = distance;
			closestPoint = currentPoint;
		}
	}

	return closestPoint;
}

// Return the two corners with the smallest and largest x and y coordinates
export function getBounds(waypoints: Waypoint[]): [number, number][] {
	let minLat = Infinity;
	let maxLat = -Infinity;
	let minLong = Infinity;
	let maxLong = -Infinity;

	for (const waypoint of waypoints) {
		if (waypoint.lat < minLat) {
			minLat = waypoint.lat;
		}
		if (waypoint.lat > maxLat) {
			maxLat = waypoint.lat;
		}
		if (waypoint.long < minLong) {
			minLong = waypoint.long;
		}
		if (waypoint.long > maxLong) {
			maxLong = waypoint.long;
		}
	}

	return [
		[minLat, minLong],
		[maxLat, maxLong]
	];
}

export function getBoundsWith10PercentMargins(waypoints: Waypoint[]) {
	const bounds = getBounds(waypoints);
	const latMargin = (bounds[1][0] - bounds[0][0]) * 0.1;
	const longMargin = (bounds[1][1] - bounds[0][1]) * 0.1;

	if (latMargin === 0 || longMargin === 0) {
		return bounds;
	}

	if (
		Number.isNaN(bounds[0][0]) ||
		Number.isNaN(bounds[0][1]) ||
		Number.isNaN(bounds[1][0]) ||
		Number.isNaN(bounds[1][1])
	)
		return [
			[0, 0],
			[0, 0]
		];

	const newBounds = [
		[bounds[0][0] - latMargin, bounds[0][1] - longMargin],
		[bounds[1][0] + latMargin, bounds[1][1] + longMargin]
	];

	return newBounds;
}

function isPointInsidePolygon(point: Point, polygon: Point[]): boolean {
	const x = point[0];
	const y = point[1];

	let isInside = false;

	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i][0];
		const yi = polygon[i][1];
		const xj = polygon[j][0];
		const yj = polygon[j][1];

		const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

		if (intersect) {
			isInside = !isInside;
		}
	}

	return isInside;
}

export function findAirspaceChangePoints(
	route: Point[],
	airspaces: Airspace[]
): { airspace: Airspace; coordinates: Point }[] {
	const intersections: { airspace: Airspace; coordinates: Point }[] = [];

	// Iterate through consecutive pairs of route points
	for (let i = 0; i < route.length - 1; i++) {
		const startPoint = route[i];
		const endPoint = route[i + 1];

		// Check for intersection with each polygon
		for (const airspace of airspaces) {
			// Check if start and end points are on opposite sides of the polygon
			const isStartInside = isPointInsidePolygon(startPoint, airspace.getCoords());
			const isEndInside = isPointInsidePolygon(endPoint, airspace.getCoords());

			// If there is a change from inside to outside or vice versa, consider it an intersection
			if (isStartInside !== isEndInside) {
				// Find the intersection point

				// Calculate the intersection point
				const x1 = startPoint[0];
				const y1 = startPoint[1];
				const x2 = endPoint[0];
				const y2 = endPoint[1];
				const x3 = airspace.getCoords()[0][0];
				const y3 = airspace.getCoords()[0][1];
				const x4 = airspace.getCoords()[1][0];
				const y4 = airspace.getCoords()[1][1];

				let ua = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
				let ub = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
				const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

				if (denominator === 0) {
					continue;
				}

				ua = ua / denominator;
				ub = ub / denominator;

				const intersectionX = x1 + ua * (x2 - x1);
				const intersectionY = y1 + ua * (y2 - y1);

				const intersectionPoint: Point = [intersectionX, intersectionY];

				intersections.push({ airspace, coordinates: intersectionPoint });
			}
		}
	}

	return intersections;
}
