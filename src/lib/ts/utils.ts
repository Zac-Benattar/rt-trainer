import type { Position } from '@turf/turf';
import type Airspace from './AeronauticalClasses/Airspace';
import * as turf from '@turf/turf';

export const wellesbourneMountfordCoords: [number, number] = [52.192, -1.614];

export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

// Simple hash function: hash * 31 + char
export function simpleHash(str: string): number {
	let hash = 0;

	if (str === undefined || str.length === 0) {
		return hash;
	}

	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
	}

	return Math.abs(hash >>> 0);
}

export function getSeededTimeInMinutes(seed: number, min: number, max: number): number {
	return min + (seed % (max - min)) - max;
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
	// Generate two pseudo-random numbers from seed for the Box-Muller transform
	const [v1, v2] = splitAndPadNumber(simpleHash(seedString));
	const u1: number = 1 / v1;
	const u2: number = 1 / v2;

	// Box-Muller transform
	const z0: number = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

	// Scale and shift to get the desired mean and standard deviation
	const result: number = z0 * standardDeviation + mean;

	return result;
}

/* Returns a lower copy of the string with single length spaces and no punctuation. */
export function processString(str: string): string {
	return trimSpaces(removePunctuationExceptDeciamlPointAndHyphen(str.toLowerCase()));
}

/* Removes most punctionation from a string */
export function removePunctuationExceptDeciamlPointAndHyphen(str: string): string {
	return str.replace(/(?<=\d),(?=\d)|[^\d\w\s.-]/g, ' ');
}

/* Removes all punctuation from a string */
export function removePunctuation(str: string): string {
	return str.replace(/[^\d\w\s]/g, ' ');
}

/* Adds spaces between each character */
export function addSpacesBetweenCharacters(str: string): string {
	return str.split('').join(' ');
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

export function swapDigitsWithWords(inputString: string): string {
	const digitWords: Record<string, string> = {
		'0': 'Zero ',
		'1': 'One ',
		'2': 'Two ',
		'3': 'Three ',
		'4': 'Four ',
		'5': 'Five ',
		'6': 'Six ',
		'7': 'Seven ',
		'8': 'Eight ',
		'9': 'Nine '
	};

	const result: string = inputString
		.split('')
		.map((char) => {
			if (/\d/.test(char)) {
				return digitWords[char];
			} else {
				return char;
			}
		})
		.join('');

	return result;
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
		'9': 'Niner'
	};

	const stringNumber: string = number.toFixed(precision);
	let result: string = '';

	for (let i = 0; i < stringNumber.length; i++) {
		const char: string = stringNumber[i];

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
		gulf: 'G',
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
		fiver: '5',
		five: '5',
		six: '6',
		seven: '7',
		eight: '8',
		niner: '9',
		nine: '9'
	};

	// Create a regular expression pattern to match any of the phonetic alphabet words
	const pattern = new RegExp(Object.keys(phoneticAlphabetMapping).join('|'), 'gi');

	// Replace occurrences of phonetic alphabet words with their corresponding characters
	return str.replace(pattern, (match) => phoneticAlphabetMapping[match.toLowerCase()]).trim();
}

export function getNthPhoneticAlphabetLetter(n: number): string {
	// The phonetic alphabet is 26 letters long
	const index: number = (n - 1) % 26;

	return replaceWithPhoneticAlphabet(String.fromCharCode(65 + index));
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
		const char: string = upperText[i];

		if (/[A-Z]/.test(char)) {
			const natoWord: string = phoneticAlphabet[char];
			result += natoWord + ' ';
		} else if (/[0-9]/.test(char)) {
			const natoNumber: string = phoneticNumbers[char];
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
	const charset: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let randomString: string = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length);
		randomString += charset.charAt(randomIndex);
	}

	return randomString;
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

	const index: number = Math.round(heading / 45) % 8;

	return compassDirections[index];
}

/***
 * Converts a number of minutes to a time string in the format HH:MM
 * @param minutes - number of minutes
 * @returns - time string in the format HH:MM
 * @throws - Error if the input is not a valid number representing time in minutes
 */
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

/***
 * Gets a pseudo-random squawk code deterministically based on a seed and an airspace ID
 * @param seed - seed for the random number generator
 * @param airspaceId - ID of the airspace
 * @returns pseudo-random squawk code
 */
export function getRandomSqwuakCode(seed: number, airspaceId: string): string {
	const idHash = simpleHash(airspaceId);
	let code: number = 0;
	for (let i = 0; i < 4; i++) {
		// Swap this out for a big prime
		code += ((seed * 5310545957 * i * idHash) % 8) * (10 ^ i);
	}
	return code.toString();
}

/***
 * Gets a pseudo-random frequency in the format XXX.XXX deterministically based on a seed and an object ID
 * @remarks Frequency range 118.000 -> 137.000
 * @param seed - seed for the random number generator
 * @param objectId - ID of the object
 * @returns pseudo-random frequency
 */
export function getRandomFrequency(seed: number, objectId: string): string {
	const idHash = simpleHash(objectId);
	const prePointFrequency = (118 + ((7759 * seed * idHash) % 20)).toString();
	let afterPointFreq = (((7757 * seed * idHash) % 30) * 30).toString();
	if (afterPointFreq.length < 3) {
		afterPointFreq = afterPointFreq.padEnd(3, '0');
	}

	return `${prePointFrequency}.${afterPointFreq}`;
}

/**
 * Calculates the distance along a route a given target point is in meters
 * @param route - route defined as array of Positions
 * @param targetPoint - target point on route
 * @returns - distance along the route in meters
 */
export function calculateDistanceAlongRoute(route: Position[], targetPoint: Position): number {
	let totalDistanceAlongRoute = 0;

	for (let i = 0; i < route.length - 1; i++) {
		const segmentLength = turf.distance(route[i], route[i + 1], { units: 'meters' });

		// Check if the target point is between the current segment
		const distanceToTarget = turf.distance(route[i], targetPoint, { units: 'meters' });
		const distanceToNext = turf.distance(route[i + 1], targetPoint, { units: 'meters' });

		// If the target point is within 5m of the segment, we consider it to be on the segment
		if (distanceToTarget + distanceToNext - segmentLength < 5) {
			// Target point lies on the current segment
			totalDistanceAlongRoute += distanceToTarget;
			break;
		}

		// Add the distance of the current segment to the total distance
		totalDistanceAlongRoute += segmentLength;
	}

	return totalDistanceAlongRoute;
}

export interface Intersection {
	position: Position;
	airspaceId: string;
	enteringAirspace: boolean; // True if the intersection is the entering of an airspace, false if it is the exiting
	distanceAlongRoute: number;
}

/**
 * Finds the intersections between a route and a list of airspaces, returning the intersections sorted by distance along the route
 * @param route - route defined as array of Positions
 * @param airspaces - list of airspaces
 * @returns - list of intersections sorted by distance along the route
 */
export function findIntersections(route: Position[], airspaces: Airspace[]): Intersection[] {
	const routeLine = turf.lineString(route);

	const intersections: Intersection[] = [];

	airspaces.forEach((airspace) => {
		if (airspace.lowerLimit > 30) return;

		const airspacePolygon = turf.polygon(airspace.coordinates);
		if (turf.booleanIntersects(routeLine, airspacePolygon)) {
			route.forEach((point, pointIndex) => {
				if (pointIndex < route.length - 1) {
					const lineSegment = turf.lineString([point, route[pointIndex + 1]]);

					if (turf.booleanIntersects(lineSegment, airspacePolygon)) {
						const intersection = turf.lineIntersect(lineSegment, airspacePolygon);
						intersection.features.forEach((feature) => {
							const intersectionPoint: Position = feature.geometry.coordinates;

							const distanceAlongRoute = calculateDistanceAlongRoute(route, intersectionPoint);

							const heading = turf.bearing(turf.point(point), intersectionPoint);

							// Determine whether the intersection is the entering of an airspace by defining a point 50m
							// in the direction of the heading and checking if it is inside the airspace
							const enteringAirspace = turf.booleanPointInPolygon(
								turf.destination(intersectionPoint, 0.005, heading, { units: 'kilometers' }),
								airspacePolygon
							);

							intersections.push({
								position: intersectionPoint,
								airspaceId: airspace.id,
								enteringAirspace,
								distanceAlongRoute
							});
						});
					}
				}
			});
		}
	});

	intersections.sort((a, b) => a.distanceAlongRoute - b.distanceAlongRoute);

	return intersections;
}

/***
 * Checks if a point is inside an airspace using the Turf library
 * @remarks The function first checks if the airspace's lower limit is greater than the max flight level, if so it returns false
 * @param point - point to check
 * @param airspace - airspace to check against
 * @returns - true if the point is inside the airspace, false otherwise
 */
export function isInAirspace(
	point: Position,
	airspace: Airspace,
	maxFlightLevel: number = 30
): boolean {
	if (airspace.lowerLimit > maxFlightLevel) return false;

	return turf.booleanPointInPolygon(point, turf.polygon(airspace.coordinates));
}

/***
 * Checks if an airspace is included in a route using the Turf library
 * @remarks The function first checks if the route has more than one point, if so it checks if the route intersects the airspace
 * @remarks If the airspace's lower limit is greater than the max flight level, it returns false
 * @param route - route defined as array of Positions
 * @param airspace - airspace to check against
 * @param maxFlightLevel - maximum flight level
 * @returns - true if the airspace is included in the route, false otherwise
 */
export function isAirspaceIncludedInRoute(
	route: Position[],
	airspace: Airspace,
	maxFlightLevel: number = 30
): boolean {
	if (route.length > 1) {
		const routeLine = turf.lineString(route);
		if (turf.booleanIntersects(routeLine, turf.polygon(airspace.coordinates))) return true;
	}

	if (airspace.lowerLimit > maxFlightLevel) return false;

	for (let i = 0; i < route.length; i++) {
		if (turf.booleanContains(turf.polygon(airspace.coordinates), turf.point(route[i]))) return true;
	}

	return false;
}