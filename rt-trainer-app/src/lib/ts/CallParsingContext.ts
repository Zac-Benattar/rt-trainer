import Route from './Route';
import type { RoutePoint } from './RouteStates';
import type Seed from './Seed';
import type { Aerodrome, METORDataSample, RadioFrequency, Runway } from './SimulatorTypes';
import { getAbbreviatedCallsign } from './utils';

export default class CallParsingContext {
	private radioCall: string;
	private seed: Seed;
	private routePoint: RoutePoint;
	private prefix: string;
	private userCallsign: string;
	private userCallsignModified: boolean;
	private squark: boolean;
	private currentTarget: RadioFrequency;
	private currentRadioFrequency: number;
	private currentTransponderFrequency: number;
	private aircraftType: string;

	constructor(
		radioCall: string,
		seed: Seed,
		routePoint: RoutePoint,
		prefix: string,
		userCallsign: string,
		userCallsignModified: boolean,
		squark: boolean,
		currentTarget: RadioFrequency,
		currentRadioFrequency: number,
		currentTransponderFrequency: number,
		aircraftType: string
	) {
		this.radioCall = radioCall;
		this.seed = seed;
		this.routePoint = routePoint;
		this.prefix = prefix;
		this.userCallsign = userCallsign;
		this.userCallsignModified = userCallsignModified;
		this.squark = squark;
		this.currentTarget = currentTarget;
		this.currentRadioFrequency = currentRadioFrequency;
		this.currentTransponderFrequency = currentTransponderFrequency;
		this.aircraftType = aircraftType;
	}

	public getRadioCall(): string {
		return this.radioCall.trim().toLowerCase();
	}

	public getSeed(): Seed {
		return this.seed;
	}

	public getRoutePoint(): RoutePoint {
		return this.routePoint;
	}

	public getPrefix(): string {
		return this.prefix;
	}

	public getUserCallsign(): string {
		return this.prefix + ' ' + this.userCallsign;
	}

	public getUserCallsignModified(): boolean {
		return this.userCallsignModified;
	}

	public getSquark(): boolean {
		return this.squark;
	}

	public getCurrentTarget(): RadioFrequency {
		return this.currentTarget;
	}

	public getCurrentRadioFrequency(): number {
		return this.currentRadioFrequency;
	}

	public getCurrentTransponderFrequency(): number {
		return this.currentTransponderFrequency;
	}

	public getAircraftType(): string {
		return this.aircraftType;
	}

	public getUnmodifiedRadioCall(): string {
		return this.radioCall;
	}

	public getRadioCallWords(): string[] {
		return this.getRadioCall().split(' ');
	}

	public getRadioCallWordCount(): number {
		return this.getRadioCallWords().length;
	}

	public getRadioCallWord(index: number): string {
		return this.getRadioCallWords()[index];
	}

	public getRadioFrequencyIndex(): number {
		return this.getRadioCallWords().findIndex((x) => x.includes('.'));
	}

	public radioFrequencyIsStated(): boolean {
		return this.getRadioFrequencyIndex() != -1;
	}

	public getRadioFrequencyStated(): number {
		return +this.getRadioCallWord(this.getRadioFrequencyIndex());
	}

	public radioFrequencyStatedEqualsCurrent(): boolean {
		return this.getRadioFrequencyStated() == this.currentRadioFrequency;
	}

	public getUserCallsignWords(): string[] {
		return this.getUserCallsign().split(' ');
	}

	public getUserCallsignStartIndexInRadioCall(): number {
		return this.getRadioCallWords().findIndex(
			(x) => x == this.getUserCallsign().toLowerCase().split(' ')[0]
		);
	}

	public callContainsWord(word: string): boolean {
		return this.getRadioCallWords().find((x) => x == word) != undefined;
	}

	public callContainsWords(words: string[]): boolean {
		for (let i = 0; i < words.length; i++) {
			if (this.getRadioCallWords().find((x) => x == words[i]) == undefined) return false;
		}
		return true;
	}

	public callStartsWithWord(word: string): boolean {
		return this.getRadioCallWords()[0] == word;
	}

	public callStartsWithConsecutiveWords(words: string[]): boolean {
		for (let i = 0; i < words.length; i++) {
			if (this.getRadioCallWord(i) != words[i]) return false;
		}
		return true;
	}

	public callEndsWithWord(word: string): boolean {
		return this.getRadioCallWords()[this.getRadioCallWordCount() - 1] == word;
	}

	public callEndsWithConsecutiveWords(words: string[]): boolean {
		for (let i = 0; i < words.length; i++) {
			if (this.getRadioCallWord(this.getRadioCallWordCount() - i - 1) != words[i]) return false;
		}
		return true;
	}

	public callContainsConsecutiveWords(words: string[]): boolean {
		const startIndex = this.getRadioCallWords().findIndex((x) => x == words[0]);
		if (startIndex == -1) return false;
		for (let i = 1; i < words.length; i++) {
			if (this.getRadioCallWord(startIndex + i) != words[i]) return false;
		}
		return true;
	}

	public callContainsUserCallsign(): boolean {
		const validUserCallsigns = this.getValidUserCallsigns();
		return (
			this.callContainsConsecutiveWords(validUserCallsigns[0].split(' ')) ||
			(validUserCallsigns.length > 1 &&
				this.callContainsConsecutiveWords(validUserCallsigns[1].split(' ')))
		);
	}

	public callStartsWithUserCallsign(): boolean {
		const validUserCallsigns = this.getValidUserCallsigns();
		const startIndex = this.getUserCallsignStartIndexInRadioCall();
		if (startIndex == -1) return false;
		for (let i = 0; i < validUserCallsigns.length; i++) {
			if (this.callStartsWithConsecutiveWords(validUserCallsigns[i].split(' '))) return true;
		}
		return false;
	}

	public callEndsWithUserCallsign(): boolean {
		const validUserCallsigns = this.getValidUserCallsigns();
		for (let i = 0; i < validUserCallsigns.length; i++) {
			if (this.callEndsWithConsecutiveWords(validUserCallsigns[i].split(' '))) return true;
		}
		return false;
	}

	public getTargetCallsignWords(): string[] {
		return this.currentTarget.callsign.split(' ');
	}

	public callContainsTargetCallsign(): boolean {
		return this.callContainsConsecutiveWords(this.getTargetCallsignWords());
	}

	/* Returns the callsign of the user as it is to be stated in radio calls from ATC. */
	public getTargetAllocatedCallsign(): string {
		if (this.userCallsignModified) {
			return (
				this.prefix +
				getAbbreviatedCallsign(this.seed.scenarioSeed, this.aircraftType, this.userCallsign)
			);
		}
		return this.prefix + this.userCallsign;
	}

	/* Returns the callsign of the user as they would state it in a radio call.
	Given that abbreviated callsigns are optional once established both 
	full and abbreviated versions returned if abbreviation established. */
	public getValidUserCallsigns(): string[] {
		const callsigns = [this.getUserCallsign(), this.getTargetAllocatedCallsign()];
		if (callsigns[0] != callsigns[1]) return callsigns;
		return [callsigns[0]];
	}

	public getStartAerodrome(): Aerodrome {
		return Route.getStartAerodrome(this.seed);
	}

	public getEndAerodrome(): Aerodrome {
		return Route.getEndAerodrome(this.seed);
	}

	public getStartAerodromeMETORSample(): METORDataSample {
		return Route.getMETORSample(this.seed, this.getStartAerodrome().metorData);
	}

	public getEndAerodromeMETORSample(): METORDataSample {
		return Route.getMETORSample(this.seed, this.getEndAerodrome().metorData);
	}

	public getStartAerodromeTakeoffRunway(): Runway {
		return this.getStartAerodrome().runways[
			this.seed.scenarioSeed % this.getStartAerodrome().runways.length
		];
	}
}
