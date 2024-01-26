import uncontrolledAerodromes from '../../data/uncontrolled_aerodromes.json';
import controlledAerodromes from '../../data/controlled_aerodromes.json';
import type Seed from './Seed';
import { numberToPhoneticString, seededNormalDistribution } from './utils';

export type RunwayHoldingPoint = {
	name: string;
	lat: number;
	long: number;
};

export type Taxiway = {
	name: string;
	holdingPoints: RunwayHoldingPoint[];
};

export type Runway = {
	name: string;
	taxiways: Taxiway[];
};

/* Represents a starting point for an aerodrome. 
Used to specify the location and heading of the aircraft at the start of a scenario. */
export type AerodromeStartPoint = {
	name: string;
	lat: number;
	long: number;
	heading: number;
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
		return numberToPhoneticString(this.windDirection, 0) + ' degrees';
	}

	public getWindSpeedString(): string {
		return numberToPhoneticString(this.windSpeed, 0) + ' knots';
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

/* Aerodrome data. */
abstract class Aerodrome {
	protected name: string;
	protected icao: string;
	protected runways: Runway[];
	protected lat: number;
	protected long: number;
	protected altitude: number;
	protected startPoints: AerodromeStartPoint[];
	protected metorData: METORData;

	constructor(
		name: string,
		icao: string,
		runways: Runway[],
		lat: number,
		long: number,
		altitude: number,
		startPoints: AerodromeStartPoint[],
		metorData: METORData
	) {
		this.name = name;
		this.icao = icao;
		this.runways = runways;
		this.lat = lat;
		this.long = long;
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

	public getLat(): number {
		return this.lat;
	}

	public getLong(): number {
		return this.long;
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

	public abstract isControlled(): boolean;

	public getTakeoffRunway(seed: Seed): Runway {
		const index = seed.scenarioSeed % this.runways.length;
		return this.runways[index];
	}

	public getTakeoffRunwayTaxiway(seed: Seed): Taxiway {
		const runway = this.getTakeoffRunway(seed);
		const index = seed.scenarioSeed % runway.taxiways.length;
		return runway.taxiways[index];
	}

	public getTakeoffRunwayTaxiwayHoldingPoint(seed: Seed): RunwayHoldingPoint {
		const taxiway = this.getTakeoffRunwayTaxiway(seed);
		const index = seed.scenarioSeed % taxiway.holdingPoints.length;
		return taxiway.holdingPoints[index];
	}

	// Needs to be implemented for each aerodrome depending on when pilots move to next frequency from takeoff
	public getTakeoffTransitionAltitude(): number {
		return 1500;
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
		lat: number,
		long: number,
		altitude: number,
		startPoints: AerodromeStartPoint[],
		metorData: METORData
	) {
		super(name, icao, runways, lat, long, altitude, startPoints, metorData);

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

	public isControlled(): boolean {
		return true;
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
					aerodrome.lat,
					aerodrome.long,
					aerodrome.altitude,
					aerodrome.startPoints,
					new METORData(
						aerodrome.metorData.avgWindDirection,
						aerodrome.metorData.meanWindSpeed,
						aerodrome.metorData.stdWindSpeed,
						aerodrome.metorData.meanPressure,
						aerodrome.metorData.stdPressure,
						aerodrome.metorData.meanTemperature,
						aerodrome.metorData.stdTemperature,
						aerodrome.metorData.meanDewpoint,
						aerodrome.metorData.stdDewpoint
					)
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
		lat: number,
		long: number,
		altitude: number,
		startPoints: AerodromeStartPoint[],
		metorData: METORData
	) {
		super(name, icao, runways, lat, long, altitude, startPoints, metorData);

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

	public isControlled(): boolean {
		return false;
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
					aerodrome.lat,
					aerodrome.long,
					aerodrome.altitude,
					aerodrome.startPoints,
					new METORData(
						aerodrome.metorData.avgWindDirection,
						aerodrome.metorData.meanWindSpeed,
						aerodrome.metorData.stdWindSpeed,
						aerodrome.metorData.meanPressure,
						aerodrome.metorData.stdPressure,
						aerodrome.metorData.meanTemperature,
						aerodrome.metorData.stdTemperature,
						aerodrome.metorData.meanDewpoint,
						aerodrome.metorData.stdDewpoint
					)
				)
			);
		});

		return aerodromes;
	}
}
