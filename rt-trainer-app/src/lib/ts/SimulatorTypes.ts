import type { RoutePoint } from "./RouteStates";
import type { Mistake } from "./ServerClientTypes";

export enum FrequencyType {
	Information = 'Information',
	Tower = 'Tower',
	Ground = 'Ground',
	Radar = 'Radar',
	None = 'None'
}

export enum FlightRules {
	IFR = 'IFR', // Instrument Flight Rules
	VFR = 'VFR' // Visual Flight Rules
}

export type Location = {
	lat: number;
	long: number;
};

/* Represents location, heading altitude and airSpeed of the aircraft. Term borrowed from robotics */
export type Pose = {
	location: Location;
	heading: number;
	altitude: number;
	airSpeed: number;
};

export enum WaypointType {
	Aerodrome, // For use when not in the air
	NDB, // Non-directional beacon - helps with positioning
	VOR, // VHF Omnidirectional Range station - helps with positioning
	Fix, // Arbitrary well know easy to spot visual point e.g. a road junction or reservoir
	DME, // Distance Measuring Equipment - helps with positioning by measuring distance from a VOR
	GPS, // GPS waypoint - arbitrary point defined in terms of lat/long
	Intersection, // Intersection of two or more airways
	NewAirspace // Entering new airspace - changing frequency
}

/* Point in space. */
export type Waypoint = {
	waypointType: WaypointType;
	location: Location;
	name: string;
};

export type TransponderDialMode = 'OFF' | 'SBY' | 'GND' | 'STBY' | 'ON' | 'ALT' | 'TEST';

export type RadioMode = 'OFF' | 'COM' | 'NAV';

export type RadioDialMode = 'OFF' | 'SBY';

/* The state of the radio. */
export type RadioState = {
	mode: RadioMode;
	dialMode: RadioDialMode;
	activeFrequency: number;
	standbyFrequency: number;
	tertiaryFrequency: number;
};

/* The state of the transponder. */
export type TransponderState = {
	dialMode: TransponderDialMode;
	frequency: number;
	identEnabled: boolean;
	vfrHasExecuted: boolean;
};

/* The details of a aircraft selected by the user. */
export type AircraftDetails = {
	callsign: string;
	prefix: string;
	aircraftType: string;
};

export enum EmergencyType {
	None = 'None',
	Mayday = 'Mayday',
	Pan = 'Pan'
}

export class Feedback {
	private radioCall: string;
	private routePoint: RoutePoint;
	private mistakes: Mistake[];

	constructor(radioCall: string, routePoint: RoutePoint, mistakes: Mistake[]) {
		this.radioCall = radioCall;
		this.routePoint = routePoint;
		this.mistakes = mistakes;
	}

	public getRadioCall(): string {
		return this.radioCall;
	}

	public getRoutePoint(): RoutePoint {
		return this.routePoint;
	}

	public getMistakes(): Mistake[] {
		return this.mistakes;
	}

	public getSevereMistakes(): Mistake[] {
		return this.mistakes.filter((mistake) => mistake.severe);
	}

	public getMinorMistakes(): Mistake[] {
		return this.mistakes.filter((mistake) => !mistake.severe);
	}

	public getFlawless(): boolean {
		return this.mistakes.length == 0;
	}

	public getDisplayString(): string {
		if (this.mistakes.length == 0) {
			return 'Flawless';
		} else {
			let displayString = '';
			if (this.mistakes.length > 0) {
				displayString += ' - ';
				for (let i = 0; i < this.mistakes.length; i++) {
					if (i > 0) {
						displayString += ', ';
					}
					displayString += this.mistakes[i].details;
				}
			}

			return displayString;
		}
	}
}

export class ScenarioFeedback {
	private feedback: Feedback[];

	constructor(feedback: Feedback[]) {
		this.feedback = feedback;
	}

	public getFeedback(): Feedback[] {
		return this.feedback;
	}

	public getSevereMistakes(): Feedback[] {
		const severeMistakes: Feedback[] = [];
		for (let i = 0; i < this.feedback.length; i++) {
			const localSevereMistakes = this.feedback[i].getSevereMistakes()
			severeMistakes.push(new Feedback(this.feedback[i].getRadioCall(), this.feedback[i].getRoutePoint(), localSevereMistakes))
		}
		return severeMistakes;
	}

	public getMinorMistakes(): Feedback[] {
		const minorMistakes: Feedback[] = [];
		for (let i = 0; i < this.feedback.length; i++) {
			const localMinorMistakes = this.feedback[i].getMinorMistakes()
			minorMistakes.push(new Feedback(this.feedback[i].getRadioCall(), this.feedback[i].getRoutePoint(), localMinorMistakes))
		}
		return minorMistakes;
	}

	public getFlawless(): Feedback[] {
		const flawless: Feedback[] = [];
		for (let i = 0; i < this.feedback.length; i++) {
			if (this.feedback[i].getFlawless()) {
				flawless.push(this.feedback[i]);
			}
		}
		return flawless;
	}

	public getSevereMistakesCount(): number {
		return this.getSevereMistakes().length;
	}

	public getMinorMistakesCount(): number {
		return this.getMinorMistakes().length;
	}

	public getFlawlessCount(): number {
		return this.feedback.length - this.getSevereMistakesCount() - this.getMinorMistakesCount();
	}

	public getFeedbackCount(): number {
		return this.feedback.length;
	}
}
