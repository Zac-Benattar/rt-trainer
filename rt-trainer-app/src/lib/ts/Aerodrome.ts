import uncontrolledAerodromes from '../../data/uncontrolled_aerodromes.json';
import controlledAerodromes from '../../data/controlled_aerodromes.json';
import type Seed from './Seed';
import { numberToPhoneticString, seededNormalDistribution, toRadians } from './utils';

export type RunwayHoldingPoint = {
	name: string;
	lat: number;
	long: number;
	heading: number;
};

export type Taxiway = {
	name: string;
	holdingPoints: RunwayHoldingPoint[];
};

/* Represents a physical runway, which has two directions, each considered their own runway. 
This representation takes the smaller heading runway as the primary and the other direction
 runway as the alt, encoding information about both. */
export class RunwayPair {
	number: string;
	altNumber: string;
	heading: number;
	use: string; // "Landing" or "Takeoff"
	startLat: number;
	startLong: number;
	endLat: number;
	endLong: number;
	taxiways: Taxiway[];

	constructor(
		number: string,
		altNumber: string,
		heading: number,
		use: string,
		startLat: number,
		startLong: number,
		endLat: number,
		endLong: number,
		taxiways: Taxiway[]
	) {
		this.number = number;
		this.altNumber = altNumber;
		this.heading = heading;
		this.use = use;
		this.startLat = startLat;
		this.startLong = startLong;
		this.endLat = endLat;
		this.endLong = endLong;
		this.taxiways = taxiways;
	}

	public getTakeoffRunway(): Runway {
		if (this.use == 'Takeoff') {
			return new Runway(
				this.number,
				this.heading,
				this.startLat,
				this.startLong,
				this.endLat,
				this.endLong,
				this.taxiways
			);
		} else {
			return new Runway(
				this.altNumber,
				this.heading + 180,
				this.endLat,
				this.endLong,
				this.startLat,
				this.startLong,
				this.taxiways
			);
		}
	}

	public getLandingRunway(): Runway {
		if (this.use == 'Landing') {
			return new Runway(
				this.number,
				this.heading,
				this.startLat,
				this.startLong,
				this.endLat,
				this.endLong,
				this.taxiways
			);
		} else {
			return new Runway(
				this.altNumber,
				this.heading + 180,
				this.endLat,
				this.endLong,
				this.startLat,
				this.startLong,
				this.taxiways
			);
		}
	}
}

export class Runway {
	name: string;
	heading: number;
	startLat: number; // Point at the start relative to direction of movement
	startLong: number;
	endLat: number; // Point at the end relative to direction of movement
	endLong: number;
	taxiways: Taxiway[];

	constructor(
		name: string,
		heading: number,
		startLat: number,
		startLong: number,
		endLat: number,
		endLong: number,
		taxiways: Taxiway[]
	) {
		this.name = name;
		this.heading = heading;
		this.startLat = startLat;
		this.startLong = startLong;
		this.endLat = endLat;
		this.endLong = endLong;
		this.taxiways = taxiways;
	}

	public getCenterPoint(): [number, number] {
		const lat = (this.startLat + this.endLat) / 2.0;
		const long = (this.startLong + this.endLong) / 2.0;

		return [lat, long];
	}

	public getPointAlongVector(distanceFromCenter: number): [number, number] {
		const centerPoint = this.getCenterPoint();
		const angle = toRadians(this.heading);
		const lat = centerPoint[0] + Math.sin(angle) * distanceFromCenter;
		const long = centerPoint[1] + Math.cos(angle) * distanceFromCenter;

		return [lat, long];
	}
}

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
	protected runwayPairs: RunwayPair[];
	protected altitude: number;
	protected startPoints: AerodromeStartPoint[];
	protected metorData: METORData;

	constructor(
		name: string,
		icao: string,
		runwayPairs: RunwayPair[],
		altitude: number,
		startPoints: AerodromeStartPoint[],
		metorData: METORData
	) {
		this.name = name;
		this.icao = icao;
		this.runwayPairs = runwayPairs;
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

	public getRunwayPairs(): RunwayPair[] {
		return this.runwayPairs;
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
		const index = seed.scenarioSeed % this.runwayPairs.length;
		return this.runwayPairs[index].getTakeoffRunway();
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

	public getLandingRunway(seed: Seed): Runway {
		const index = seed.scenarioSeed % this.runwayPairs.length;
		return this.runwayPairs[index].getLandingRunway();
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
		runwayPairs: RunwayPair[],
		altitude: number,
		startPoints: AerodromeStartPoint[],
		metorData: METORData
	) {
		super(name, icao, runwayPairs, altitude, startPoints, metorData);

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
			const runwayPairs = aerodrome.runwayPairs.map((runwayPair) => {
				return new RunwayPair(
					runwayPair.number,
					runwayPair.altNumber,
					runwayPair.heading,
					runwayPair.use,
					runwayPair.startLat,
					runwayPair.startLong,
					runwayPair.endLat,
					runwayPair.endLong,
					runwayPair.taxiways
				);
			});

			aerodromes.push(
				new ControlledAerodrome(
					aerodrome.name,
					aerodrome.icao,
					aerodrome.groundFrequency,
					aerodrome.towerFrequency,
					aerodrome.radarFrequency,
					runwayPairs,
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
		runwayPairs: RunwayPair[],
		altitude: number,
		startPoints: AerodromeStartPoint[],
		metorData: METORData
	) {
		super(name, icao, runwayPairs, altitude, startPoints, metorData);

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
			const runwayPairs = aerodrome.runwayPairs.map((runwayPair) => {
				return new RunwayPair(
					runwayPair.number,
					runwayPair.altNumber,
					runwayPair.heading,
					runwayPair.use,
					runwayPair.startLat,
					runwayPair.startLong,
					runwayPair.endLat,
					runwayPair.endLong,
					runwayPair.taxiways
				);
			});
			aerodromes.push(
				new UncontrolledAerodrome(
					aerodrome.name,
					aerodrome.icao,
					aerodrome.informationFrequency,
					runwayPairs,
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
