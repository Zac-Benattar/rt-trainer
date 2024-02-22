import { Type } from 'class-transformer';
import { Frequency } from '../Frequency';
import Runway from './Runway';
import { METORData, METORDataSample } from './METORData';
import 'reflect-metadata';
import { getNewCoordsFromCoord } from '../utils';
import type { AirportReportingPointDBData } from '../OpenAIPHandler';

/* Airport data. */
export default class Airport {
	name: string;
	icaoCode: string;
	iataCode: string;
	altIdentifier: string;
	type: number;
	country: string;
	coordinates: [number, number];
	reportingPoints: AirportReportingPointDBData[]
	elevation: number;
	trafficType: number[];
	ppr: boolean;
	private: boolean;
	skydiveActivity: boolean;
	winchOnly: boolean;

	@Type(() => Runway)
	runways: Runway[];

	@Type(() => Frequency)
	frequencies: Frequency[];

	@Type(() => METORData)
	metorData: METORData = new METORData(0, 0, 0, 0, 0, 0, 0, 0, 0);

	constructor(
		name: string,
		icaoCode: string,
		iataCode: string,
		altIdentifier: string,
		type: number,
		country: string,
		coordinates: [number, number],
		airportReportingPoints: AirportReportingPointDBData[],
		elevation: number,
		trafficType: number[],
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
		this.reportingPoints = airportReportingPoints;
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

	public getMETORSample(seed: number): METORDataSample {
		return this.metorData.getSample(seed);
	}

	public getTakeoffRunway(seed: number): Runway {
		let index = seed % this.runways.length;
		while (this.runways[index].landingOnly) {
			index = (index + 1) % this.runways.length;
		}

		return this.runways[index];
	}

	// Needs to be implemented for each aerodrome depending on when pilots move to next frequency from takeoff
	public getTakeoffTransitionAltitude(): number {
		throw new Error('Not implemented');
	}

	public getLandingRunway(seed: number): Runway {
		let index = seed % this.runways.length;
		while (this.runways[index].takeOffOnly) {
			index = (index + 1) % this.runways.length;
		}

		return this.runways[index];
	}

	public getPointAlongTakeoffRunwayVector(seed: number, distance: number): [number, number] {
		const runway = this.getTakeoffRunway(seed);
		return getNewCoordsFromCoord(
			this.coordinates[0],
			this.coordinates[1],
			runway.trueHeading,
			distance
		);
	}

	public getPointAlongLandingRunwayVector(seed: number, distance: number): [number, number] {
		const runway = this.getLandingRunway(seed);
		return getNewCoordsFromCoord(
			this.coordinates[0],
			this.coordinates[1],
			runway.trueHeading,
			distance
		);
	}

	public getStartTime(seed: number): number {
		// (In minutes)
		// 1pm + (0-4hours) - 2 hours -> 11am - 3pm
		return 780 + (seed % 240) - 120;
	}

	public getTakeoffTime(seed: number): number {
		return this.getStartTime(seed) + 10;
	}

	public isControlled(): boolean {
		return this.type == 3 || this.type == 9;
	}

	public getParkedFrequencyValue(): string {
		let groundOrInformationFrequency = this.getGroundFrequencyValue();
		if (groundOrInformationFrequency == undefined) {
			groundOrInformationFrequency = this.getTowerFrequencyValue();
		}
		if (groundOrInformationFrequency == undefined) {
			groundOrInformationFrequency = this.getInformationFrequencyValue();
		}
		if (groundOrInformationFrequency == undefined) {
			groundOrInformationFrequency = this.getAGFrequencyValue();
		}
		if (groundOrInformationFrequency == undefined) {
			groundOrInformationFrequency = '000.000';
		}
		return groundOrInformationFrequency;
	}

	public getGroundFrequencyValue(): string | undefined {
		for (let i = 0; i < this.frequencies.length; i++) {
			if (this.frequencies[i].type == 9) {
				return this.frequencies[i].value;
			}
		}
		return undefined;
	}

	public getInformationFrequencyValue(): string | undefined {
		for (let i = 0; i < this.frequencies.length; i++) {
			if (this.frequencies[i].type == 15 || this.frequencies[i].type == 10) {
				return this.frequencies[i].value;
			}
		}
		return undefined;
	}

	public getAGFrequencyValue(): string | undefined {
		for (let i = 0; i < this.frequencies.length; i++) {
			if (this.frequencies[i].type == 17) {
				return this.frequencies[i].value;
			}
		}
		return undefined;
	}

	public getTowerFrequencyValue(): string | undefined {
		for (let i = 0; i < this.frequencies.length; i++) {
			if (this.frequencies[i].type == 14) {
				return this.frequencies[i].value;
			}
		}
		return undefined;
	}

	public getApproachFrequencyValue(): string | undefined {
		for (let i = 0; i < this.frequencies.length; i++) {
			if (this.frequencies[i].type == 0) {
				return this.frequencies[i].value;
			}
		}
		return undefined;
	}

	public getATISLetter(seed: number): string {
		return String.fromCharCode(65 + (seed % 26));
	}
}
