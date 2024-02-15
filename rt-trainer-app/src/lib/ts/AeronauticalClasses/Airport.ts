import { Type } from 'class-transformer';
import { Frequency } from '../Frequency';
import type Seed from '../Seed';
import { Runway } from './Runway';
import { METORData, METORDataSample } from './METORData';

/* Aerodrome data. */
export class Airport {
	name: string;
	icaoCode: string;
	iataCode: string;
	altIdentifier: string;
	type: number;
	country: string;
	coordinates: [number, number];
	elevation: number;
	trafficType: string;
	ppr: boolean;
	private: boolean;
	skydiveActivity: boolean;
	winchOnly: boolean;

	@Type(() => Runway)
	runways: Runway[];

	@Type(() => Frequency)
	frequencies: Frequency[];
	metorData: METORData = new METORData(0, 0, 0, 0, 0, 0, 0, 0, 0);

	constructor(
		name: string,
		icaoCode: string,
		iataCode: string,
		altIdentifier: string,
		type: number,
		country: string,
		coordinates: [number, number],
		elevation: number,
		trafficType: string,
		ppr: boolean,
		privateAerodrome: boolean,
		skydiveActivity: boolean,
		winchOnly: boolean,
		runways: Runway[],
		frequencies: Frequency[]
	) {
		this.name = name;
		this.icaoCode = icaoCode;
		this.iataCode = iataCode;
		this.altIdentifier = altIdentifier;
		this.type = type;
		this.country = country;
		this.coordinates = coordinates;
		this.elevation = elevation;
		this.trafficType = trafficType;
		this.ppr = ppr;
		this.private = privateAerodrome;
		this.skydiveActivity = skydiveActivity;
		this.winchOnly = winchOnly;
		this.runways = runways;
		this.frequencies = frequencies;
	}

	public getName(): string {
		return this.name;
	}

	public getShortName(): string {
		return this.name.split(' ')[0];
	}

	public getICAO(): string {
		return this.icaoCode;
	}

	public getElevation(): number {
		return this.elevation;
	}

	public getMETORData(): METORData {
		return this.metorData;
	}

	public getMETORSample(seed: Seed): METORDataSample {
		return this.metorData.getSample(seed);
	}

	public getTakeoffRunway(seed: Seed): Runway {
		let index = seed.scenarioSeed % this.runways.length;
		while (this.runways[index].landingOnly) {
			index = (index + 1) % this.runways.length;
		}

		return this.runways[index];
	}

	// Needs to be implemented for each aerodrome depending on when pilots move to next frequency from takeoff
	public getTakeoffTransitionAltitude(): number {
		throw new Error('Not implemented');
	}

	public getLandingRunway(seed: Seed): Runway {
		let index = seed.scenarioSeed % this.runways.length;
		while (this.runways[index].takeOffOnly) {
			index = (index + 1) % this.runways.length;
		}

		return this.runways[index];
	}

	public getStartTime(seed: Seed): number {
		// (In minutes)
		// 1pm + (0-4hours) - 2 hours -> 11am - 3pm
		return 780 + (seed.scenarioSeed % 240) - 120;
	}

	public getTakeoffTime(seed: Seed): number {
		return this.getStartTime(seed) + 10;
	}

	public isControlled(): boolean {
		return this.type == 3 || this.type == 9;
	}
}
