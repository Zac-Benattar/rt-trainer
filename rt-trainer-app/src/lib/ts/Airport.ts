import type Seed from './Seed';
import { numberToPhoneticString, seededNormalDistribution } from './utils';

export type OperatingHours = {
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	sunrise: boolean;
	sunset: boolean;
	byNotam: boolean;
	publicHolidaysExcluded: boolean;
	remarks: string;
};

export type RunwayData = {
	_id: string;
	designator: string;
	trueHeading: number;
	alignedTrueNorth: boolean;
	operations: number;
	mainRunway: boolean;
	turnDirection: number;
	landingOnly: boolean;
	takeOffOnly: boolean;
	surface: {
		composition: number[];
		mainComposite: number;
		condition: number;
		mtow: {
			value: number;
			unit: number;
		};
		pcn: string;
	};
	dimension: {
		length: {
			value: number;
			unit: number;
		};
		width: {
			value: number;
			unit: number;
		};
	};
	declaredDistance: {
		tora: {
			value: number;
			unit: number;
		};
		toda: {
			value: number;
			unit: number;
		};
		asda: {
			value: number;
			unit: number;
		};
		lda: {
			value: number;
			unit: number;
		};
	};
	thresholdLocation: {
		geometry: {
			type: 'Point';
			coordinates: [number, number];
		};
		elevation: {
			value: number;
			unit: number;
			referenceDatum: number;
		};
	};
	exclusiveAircraftType: number[];
	pilotCtrlLighting: boolean;
	lightingSystem: number[];
	visualApproachAids: number[];
	instrumentApproachAids: {
		_id: string;
		identifier: string;
		frequency: {
			value: string;
			unit: number;
		};
		channel: string;
		alignedTrueNorth: boolean;
		type: number;
		hoursOfOperation: OperatingHours[];
	}[];
};

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

	public getSample(seed: Seed): METORDataSample {
		// let season: Season = Season.Spring;
		let meanTemperature: number = 0.0;

		switch (seed.weatherSeed % 4) {
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
			seededNormalDistribution(seed.weatherSeed.toString(), this.avgWindDirection, 10.0) % 360.0;

		const temperature = seededNormalDistribution(
			seed.weatherSeed.toString(),
			meanTemperature,
			this.stdTemperature
		);

		const windSpeed = seededNormalDistribution(
			seed.weatherSeed.toString(),
			this.meanWindSpeed,
			this.stdWindSpeed
		);

		const pressure = seededNormalDistribution(
			seed.weatherSeed.toString(),
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

export type AirportData = {
	_id: string;
	name: string;
	icaoCode: string;
	iataCode: string;
	altIdentifier: string;
	type: number;
	country: string;
	geometry: {
		type: 'Point';
		coordinates: [number, number];
	};
	elevation: {
		value: number;
		unit: string;
		referenceDatum: number;
	};
	elevationGeoid: {
		hae: number;
		geoidHeight: number;
	};
	trafficType: number[];
	magneticDeclination: 0;
	ppr: boolean;
	private: boolean;
	skydiveActivity: boolean;
	winchOnly: boolean;
	services: {
		fuelTypes: string[];
		gliderTowing: string[];
		handlingFacilities: string[];
		passengerFacilities: string[];
	};
	frequencies: {
		_id: string;
		value: string;
		unit: number;
		type: 0;
		name: string;
		primary: boolean;
		publicUse: boolean;
	}[];
	runways: RunwayData[];
	hoursOfOperation: OperatingHours[];
};

/* Aerodrome data. */
export class Airport {
	seed: Seed;
	data: AirportData;
	metorData: METORData = new METORData(0, 0, 0, 0, 0, 0, 0, 0, 0);

	constructor(seed: Seed, airportData: AirportData) {
		this.seed = seed;
		this.data = airportData;
	}

	public getName(): string {
		return this.data.name;
	}

	public getShortName(): string {
		return this.data.name.split(' ')[0];
	}

	public getICAO(): string {
		return this.data.icaoCode;
	}

	public getElevation(): number {
		return this.data.elevation.value;
	}

	public getMETORData(): METORData {
		return this.metorData;
	}

	public getMETORSample(): METORDataSample {
		return this.metorData.getSample(this.seed);
	}

	public getTakeoffRunway(): RunwayData {
		let index = this.seed.scenarioSeed % this.data.runways.length;
		while (this.data.runways[index].landingOnly) {
			index = (index + 1) % this.data.runways.length;
		}

		return this.data.runways[index];
	}

	// Needs to be implemented for each aerodrome depending on when pilots move to next frequency from takeoff
	public getTakeoffTransitionAltitude(): number {
		throw new Error('Not implemented');
	}

	public getLandingRunway(): RunwayData {
		let index = this.seed.scenarioSeed % this.data.runways.length;
		while (this.data.runways[index].takeOffOnly) {
			index = (index + 1) % this.data.runways.length;
		}

		return this.data.runways[index];
	}

	public getStartTime(): number {
		// (In minutes)
		// 1pm + (0-4hours) - 2 hours -> 11am - 3pm
		return 780 + (this.seed.scenarioSeed % 240) - 120;
	}

	public getTakeoffTime(): number {
		return this.getStartTime() + 10;
	}
}

export class ControlledAerodrome extends Airport {
	constructor(seed: Seed, data: AirportData) {
		super(seed, data);
	}

	public isControlled(): boolean {
		return true;
	}

	public getATISLetter(): string {
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		return alphabet.charAt(this.seed.scenarioSeed % alphabet.length);
	}
}

export class UncontrolledAerodrome extends Airport {
	constructor(seed: Seed, data: AirportData) {
		super(seed, data);
	}

	public isControlled(): boolean {
		return false;
	}
}
