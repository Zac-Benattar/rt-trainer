import type { RadioFrequency, Location } from './SimulatorTypes';

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
export class Aerodrome {
	public name: string;
	public icao: string;
	public radioFrequencies: RadioFrequency[];
	public runways: Runway[];
	public location: Location;
	public altitude: number;
	public startPoints: AerodromeStartPoint[];
	public metorData: METORData;

	constructor(
		name: string,
		icao: string,
		radioFrequencies: RadioFrequency[],
		runways: Runway[],
		location: Location,
		altitude: number,
		startPoints: AerodromeStartPoint[],
		metorData: METORData
	) {
		this.name = name;
		this.icao = icao;
		this.radioFrequencies = radioFrequencies;
		this.runways = runways;
		this.location = location;
		this.altitude = altitude;
		this.startPoints = startPoints;
		this.metorData = metorData;
	}
}

export class ControlledAerodrome extends Aerodrome {  
    public getGroundFrequency(): number {
        return this.radioFrequencies.find((frequency) => frequency.frequencyType === 'GND')!.frequency;
    }
}

export class UncontrolledAerodrome extends Aerodrome {

}
