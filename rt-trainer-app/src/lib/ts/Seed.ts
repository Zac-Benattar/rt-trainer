import { simpleHash, splitAndPadNumber } from './utils';

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
	}
}
