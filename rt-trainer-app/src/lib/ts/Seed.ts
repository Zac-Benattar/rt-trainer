export default class Seed {
	seedString: string;
	scenarioSeed: number;
	weatherSeed: number;

	constructor(seedString: string) {
		this.seedString = seedString;

		// Split the seed into two halves and pad them with zeros to make sure they are the same length
		const [tempScenarioSeed, tempWeatherSeed] = splitAndPadNumber(simpleHash(seedString));
		this.scenarioSeed = Math.abs(tempScenarioSeed);
		this.weatherSeed = Math.abs(tempWeatherSeed);

		// Splits a number into two halves and pads them with zeros to make sure they are the same length
		function splitAndPadNumber(input: number): [number, number] {
			const numberString = input.toString();
			const halfLength = Math.ceil(numberString.length / 2);
			const firstHalf = parseInt(numberString.padEnd(halfLength, '0').slice(0, halfLength));
			const secondHalf = parseInt(numberString.slice(halfLength).padEnd(halfLength, '0'));
			return [firstHalf, secondHalf];
		}

		// Simple hash function: hash * 31 + char
		function simpleHash(str: string): number {
			let hash = 0;

			if (str.length === 0) {
				return hash;
			}

			for (let i = 0; i < str.length; i++) {
				const char = str.charCodeAt(i);
				hash = (hash << 5) - hash + char;
			}

			return hash;
		}
	}
}
