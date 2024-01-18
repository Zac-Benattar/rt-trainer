import * as RandomSeed from 'random-seed';
import type { Location } from './SimulatorTypes';

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

/* Returns a abbreviated callsign. */
export function getAbbreviatedCallsign(
	scenarioSeed: number,
	aircraftType: string,
	callsign: string
): string {
	let abbreviatedCallsign: string = '';
	if (callsign.length == 6) {
		let standardRegStyle: boolean = true;

		if (standardRegStyle) {
			if (callsign.charAt(1) != '-') {
				standardRegStyle = false;
			}
		}

		if (standardRegStyle) {
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
		juliet: 'J'
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
