import { numberToPhoneticString, seededNormalDistribution } from '../utils';

/* METORlogical data. */
export class METORData {
	avgWindDirection: number;
	meanWindSpeed: number;
	stdWindSpeed: number;
	meanPressure: number;
	stdPressure: number;
	meanTemperature: number;
	stdTemperature: number;
	meanDewpoint: number;
	stdDewpoint: number;

	constructor(
		avgWindDirection: number,
		meanWindSpeed: number,
		stdWindSpeed: number,
		meanPressure: number,
		stdPressure: number,
		meanTemperature: number,
		stdTemperature: number,
		meanDewpoint: number,
		stdDewpoint: number
	) {
		this.avgWindDirection = avgWindDirection;
		this.meanWindSpeed = meanWindSpeed;
		this.stdWindSpeed = stdWindSpeed;
		this.meanPressure = meanPressure;
		this.stdPressure = stdPressure;
		this.meanTemperature = meanTemperature;
		this.stdTemperature = stdTemperature;
		this.meanDewpoint = meanDewpoint;
		this.stdDewpoint = stdDewpoint;
	}

	public getSample(seed: number): METORDataSample {
		// let season: Season = Season.Spring;
		let meanTemperature: number = 0.0;

		switch (seed % 4) {
			case 0:
				// season = Season.Spring;
				meanTemperature = this.meanTemperature * 1.3;
				break;
			case 1:
				// season = Season.Summer;
				meanTemperature = this.meanTemperature * 1.7;
				break;
			case 2:
				// season = Season.Autumn;
				meanTemperature = this.meanTemperature * 1.1;
				break;
			case 3:
				// season = Season.Winter;
				meanTemperature = this.meanTemperature * 0.4;
				break;
		}

		// Simulate temperature, wind direction, wind speed and pressure with a normal distribution
		const windDirection =
			seededNormalDistribution(seed.toString(), this.avgWindDirection, 10.0) % 360.0;

		const temperature = seededNormalDistribution(
			seed.toString(),
			meanTemperature,
			this.stdTemperature
		);

		const windSpeed = seededNormalDistribution(
			seed.toString(),
			this.meanWindSpeed,
			this.stdWindSpeed
		);

		const pressure = seededNormalDistribution(
			seed.toString(),
			this.meanPressure,
			this.stdTemperature
		);

		return new METORDataSample(
			windDirection,
			windSpeed,
			pressure,
			temperature,
			temperature * 0.95 - 1.2
		);
	}
}

/* METOR data sample. Obtained from taking a random sample of the METOR data model. */
export class METORDataSample {
	private windDirection: number;
	private windSpeed: number;
	private pressure: number;
	private temperature: number;
	private dewpoint: number;

	constructor(
		windDirection: number,
		windSpeed: number,
		pressure: number,
		temperature: number,
		dewpoint: number
	) {
		this.windDirection = windDirection;
		this.windSpeed = windSpeed;
		this.pressure = pressure;
		this.temperature = temperature;
		this.dewpoint = dewpoint;
	}

	public getWindDirectionString(): string {
		return 'wind ' + numberToPhoneticString(this.windDirection, 0) + ' degrees';
	}

	public getWindSpeedString(): string {
		return numberToPhoneticString(this.windSpeed, 0) + ' knots';
	}

	public getWindString(): string {
		return this.getWindDirectionString() + ' ' + this.getWindSpeedString();
	}

	public getPressureString(): string {
		if (this.pressure < 1000.0) {
			return numberToPhoneticString(this.pressure, 0) + ' hectopascals';
		}
		return numberToPhoneticString(this.pressure, 0);
	}

	public getTemperatureString(): string {
		if (this.temperature > 0) {
			return '+' + numberToPhoneticString(this.temperature, 0);
		} else if (this.temperature < 0) {
			return '-' + numberToPhoneticString(this.temperature, 0);
		}
		return '0';
	}

	public getDewpointString(): string {
		if (this.dewpoint > 0) {
			return '+' + numberToPhoneticString(this.dewpoint, 0);
		} else if (this.dewpoint < 0) {
			return '-' + numberToPhoneticString(this.dewpoint, 0);
		}
		return '0';
	}
}
