import type { Location } from './SimulatorTypes';
import uncontrolledAerodromes from '../../data/uncontrolled_aerodromes.json';
import controlledAerodromes from '../../data/controlled_aerodromes.json';
import type Seed from './Seed';
import { seededNormalDistribution } from './utils';

export type RunwayHoldingPoint = {
	name: string;
	location: Location;
};

export type Taxiway = {
	name: string;
	holdingPoints: RunwayHoldingPoint[];
};

export type Runway = {
	name: string;
	taxiways: Taxiway[];
};

/* METORlogical data. */
export type METORData = {
	avgWindDirection: number;
	meanWindSpeed: number;
	stdWindSpeed: number;
	meanPressure: number;
	stdPressure: number;
	meanTemperature: number;
	stdTemperature: number;
	meanDewpoint: number;
	stdDewpoint: number;
};

/* METOR data sample. Obtained from taking a random sample of the METOR data model. */
export type METORDataSample = {
	windDirection: number;
	windSpeed: number;
	pressure: number;
	temperature: number;
	dewpoint: number;
};

/* Represents a starting point for an aerodrome. 
Used to specify the location and heading of the aircraft at the start of a scenario. */
export type AerodromeStartPoint = {
	name: string;
	location: Location;
	heading: number;
};

/* Aerodrome data. */
abstract class Aerodrome {
	protected name: string;
	protected icao: string;
	protected runways: Runway[];
	protected location: Location;
	protected altitude: number;
	protected startPoints: AerodromeStartPoint[];
	protected metorData: METORData;

	constructor(
		name: string,
		icao: string,
		runways: Runway[],
		location: Location,
		altitude: number,
		startPoints: AerodromeStartPoint[],
		metorData: METORData
	) {
		this.name = name;
		this.icao = icao;
		this.runways = runways;
		this.location = location;
		this.altitude = altitude;
		this.startPoints = startPoints;
		this.metorData = metorData;
	}

	public getName(): string {
		return this.name;
	}

	public getShortName(): string {
		return this.name.split(' ')[0];
	}

	public getICAO(): string {
		return this.icao;
	}

	public getRunways(): Runway[] {
		return this.runways;
	}

	public getLocation(): Location {
		return this.location;
	}

	public getAltitude(): number {
		return this.altitude;
	}

	public getStartPoints(): AerodromeStartPoint[] {
		return this.startPoints;
	}

	public getMETORData(): METORData {
		return this.metorData;
	}

	public abstract getGroundFrequency(): number;

	public abstract getTakeoffFrequency(): number;

	public abstract getLandingFrequency(): number;

	public abstract getAirspaceFrequency(): number;

	public getMETORSample(seed: Seed): METORDataSample {
		// let season: Season = Season.Spring;
		let meanTemperature: number = 0.0;

		switch (seed.weatherSeed % 4) {
			case 0:
				// season = Season.Spring;
				meanTemperature = this.metorData.meanTemperature * 1.3;
				break;
			case 1:
				// season = Season.Summer;
				meanTemperature = this.metorData.meanTemperature * 1.7;
				break;
			case 2:
				// season = Season.Autumn;
				meanTemperature = this.metorData.meanTemperature * 1.1;
				break;
			case 3:
				// season = Season.Winter;
				meanTemperature = this.metorData.meanTemperature * 0.4;
				break;
		}

		// Simulate temperature, wind direction, wind speed and pressure with a normal distribution
		const windDirection =
			seededNormalDistribution(seed.weatherSeed.toString(), this.metorData.avgWindDirection, 10.0) %
			360.0;

		const temperature = seededNormalDistribution(
			seed.weatherSeed.toString(),
			meanTemperature,
			this.metorData.stdTemperature
		);

		const windSpeed = seededNormalDistribution(
			seed.weatherSeed.toString(),
			this.metorData.meanWindSpeed,
			this.metorData.stdWindSpeed
		);

		const pressure = seededNormalDistribution(
			seed.weatherSeed.toString(),
			this.metorData.meanPressure,
			this.metorData.stdTemperature
		);

		return {
			windDirection: windDirection,
			windSpeed: windSpeed,
			pressure: pressure,
			temperature: temperature,
			dewpoint: temperature * 0.95 - 1.2 // Basic dewpoint aproximation - not based on any actual formula
		};
	}
}

export class ControlledAerodrome extends Aerodrome {
	protected groundFrequency: number;
	protected towerFrequency: number;
	protected radarFrequency: number;

	constructor(
		name: string,
		icao: string,
		groundFrequency: number,
		towerFrequency: number,
		radarFrequency: number,
		runways: Runway[],
		location: Location,
		altitude: number,
		startPoints: AerodromeStartPoint[],
		metorData: METORData
	) {
		super(name, icao, runways, location, altitude, startPoints, metorData);

		this.groundFrequency = groundFrequency;
		this.towerFrequency = towerFrequency;
		this.radarFrequency = radarFrequency;
	}

	public getGroundFrequency(): number {
		return this.groundFrequency;
	}

	public getTowerFrequency(): number {
		return this.towerFrequency;
	}

	public getRadarFrequency(): number {
		return this.radarFrequency;
	}

	public getTakeoffFrequency(): number {
		return this.towerFrequency;
	}

	public getLandingFrequency(): number {
		return this.towerFrequency;
	}

	public getAirspaceFrequency(): number {
		return this.radarFrequency;
	}

	public static getAerodromesFromJSON(): ControlledAerodrome[] {
		const aerodromes: ControlledAerodrome[] = [];

		controlledAerodromes.forEach((aerodrome) => {
			aerodromes.push(
				new ControlledAerodrome(
					aerodrome.name,
					aerodrome.icao,
					aerodrome.groundFrequency,
					aerodrome.towerFrequency,
					aerodrome.radarFrequency,
					aerodrome.runways,
					aerodrome.location,
					aerodrome.altitude,
					aerodrome.startPoints,
					aerodrome.metorData
				)
			);
		});

		return aerodromes;
	}
}

export class UncontrolledAerodrome extends Aerodrome {
	protected informationFrequency: number;

	constructor(
		name: string,
		icao: string,
		informationFrequency: number,
		runways: Runway[],
		location: Location,
		altitude: number,
		startPoints: AerodromeStartPoint[],
		metorData: METORData
	) {
		super(name, icao, runways, location, altitude, startPoints, metorData);

		this.informationFrequency = informationFrequency;
	}

	public getInformationFrequency(): number {
		return this.informationFrequency;
	}

	public getGroundFrequency(): number {
		return this.informationFrequency;
	}

	public getTakeoffFrequency(): number {
		return this.informationFrequency;
	}

	public getLandingFrequency(): number {
		return this.informationFrequency;
	}

	public getAirspaceFrequency(): number {
		return this.informationFrequency;
	}

	public static getAerodromesFromJSON(): UncontrolledAerodrome[] {
		const aerodromes: UncontrolledAerodrome[] = [];

		uncontrolledAerodromes.forEach((aerodrome) => {
			aerodromes.push(
				new UncontrolledAerodrome(
					aerodrome.name,
					aerodrome.icao,
					aerodrome.informationFrequency,
					aerodrome.runways,
					aerodrome.location,
					aerodrome.altitude,
					aerodrome.startPoints,
					aerodrome.metorData
				)
			);
		});

		return aerodromes;
	}
}
