import * as RandomSeed from 'random-seed';
import type { Location } from './States';

// Function to generate a seeded normal distribution
export function seededNormalDistribution(
	seed: string,
	mean: number,
	standardDeviation: number
): number {
	const rand = RandomSeed.create(seed);

	// Generate two random numbers using the Box-Muller transform
	const u1 = rand.random();
	const u2 = rand.random();

	// Box-Muller transform
	const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

	// Scale and shift to get the desired mean and standard deviation
	const result = z0 * standardDeviation + mean;

	return result;
}

/* Returns the distance between two locations on the earth in metres. */
export function haversineDistance(location1: Location, location2: Location): number {
	const R = 6371e3; // metres
	const φ1 = (location1.lat * Math.PI) / 180; // φ, λ in radians
	const φ2 = (location2.lat * Math.PI) / 180;
	const Δφ = ((location2.lat - location1.lat) * Math.PI) / 180;
	const Δλ = ((location2.long - location1.long) * Math.PI) / 180;

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
	return str.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '');
}

/* Shortens all spaces to a single space. */
export function trimSpaces(str: string): string {
	return str.replace(/\s+/g, ' ');
}

/* Removes all digits from a string. */
export function removeDigits(str: string): string {
	return str.replace(/[0-9]/g, '');
}

/* Returns a abbreviated callsign. */
export function getAbbreviatedCallsign(
	scenarioSeed: number,
	aircraftType: string,
	callsign: string
): string {
	let abbreviatedCallsign: string = '';
	if (callsign.length == 6) {
		let standardRegStyle: boolean = true;

		for (let i = 0; i < callsign.length; i++) {
			if (!(callsign.charAt(i) == callsign.charAt(i).toUpperCase()) && i != 1) {
				standardRegStyle = false;
			}
		}
		if (standardRegStyle) {
			if (callsign.charAt(1) != '-') {
				standardRegStyle = false;
			}
		}

		if (standardRegStyle) {
			if (scenarioSeed % 3 == 0) {
				// G-OFLY -> Cessna 172 LY
				abbreviatedCallsign += removeDigits(aircraftType);
				abbreviatedCallsign += ' ';
				abbreviatedCallsign += callsign.charAt(4);
				abbreviatedCallsign += callsign.charAt(5);
			} else {
				// G-OFLY -> GO-LY
				abbreviatedCallsign += callsign.charAt(0);
				abbreviatedCallsign += callsign.charAt(1);
				abbreviatedCallsign += '-';
				abbreviatedCallsign += callsign.charAt(4);
				abbreviatedCallsign += callsign.charAt(5);
			}
		} else {
			abbreviatedCallsign += callsign;
		}
	} else {
		const callsign_words: string[] = callsign.split(' ');
		abbreviatedCallsign += callsign_words[0];
	}

	return abbreviatedCallsign;
}
