import Route from './Route';
import type { RoutePoint } from './RouteStates';
import type Seed from './Seed';
import type { Mistake } from './ServerClientTypes';
import type {
	Aerodrome,
	AerodromeStartPoint,
	METORDataSample,
	RadioFrequency,
	Runway
} from './SimulatorTypes';
import { getAbbreviatedCallsign, processString } from './utils';

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
		return processString(this.radioCall.trim().toLowerCase());
	}

	public getSeed(): Seed {
		return this.seed;
	}

	public getRoutePoint(): RoutePoint {
		return this.routePoint;
	}

	public getPrefix(): string {
		return this.prefix.toLowerCase();
	}

	public getUserCallsign(): string {
		return this.getPrefix() + ' ' + this.userCallsign.toLowerCase();
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
		return this.aircraftType.toLowerCase();
	}

	public getUnmodifiedRadioCall(): string {
		return this.radioCall;
	}

	private getIsRadioCallEmpty() {
		return this.getRadioCall() == '' || this.getRadioCall().length == 0;
	}

	private getRadioCallWords(): string[] {
		return this.getRadioCall().split(' ');
	}

	private getRadioCallWordCount(): number {
		return this.getRadioCallWords().length;
	}

	private getRadioCallWord(index: number): string {
		return this.getRadioCallWords()[index];
	}

	private getRadioFrequencyIndex(): number {
		return this.getRadioCallWords().findIndex((x) => x.includes('.'));
	}

	private radioFrequencyIsStated(): boolean {
		return this.getRadioFrequencyIndex() != -1;
	}

	private getRadioFrequencyStated(): number {
		const freq = +this.getRadioCallWord(this.getRadioFrequencyIndex());
		if (isNaN(freq)) return -1;
		return freq;
	}

	private radioFrequencyStatedEqualsCurrent(): boolean {
		return this.getRadioFrequencyStated() == this.currentRadioFrequency;
	}

	public assertCallContainsCurrentRadioFrequency(): Mistake | undefined {
		if (!this.radioFrequencyStatedEqualsCurrent()) {
			return {
				details: 'Make sure your call contains the current radio frequency.',
				severe: true
			};
		}
		return;
	}

	private getUserCallsignWords(): string[] {
		return this.getUserCallsign().split(' ');
	}

	private getUserCallsignStartIndexInRadioCall(): number {
		return this.getRadioCallWords().findIndex((x) => x == this.getUserCallsign().split(' ')[0]);
	}

	private callContainsWord(word: string): boolean {
		return this.getRadioCallWords().find((x) => x == word.toLowerCase()) != undefined;
	}

	public assertCallContainsWord(word: string): Mistake | undefined {
		if (!this.callContainsWord(word)) {
			return {
				details: 'Make sure your call contains the word: ' + word,
				severe: true
			};
		}
		return;
	}

	private callContainsWords(words: string[]): boolean {
		for (let i = 0; i < words.length; i++) {
			if (this.getRadioCallWords().find((x) => x == words[i].toLowerCase()) == undefined)
				return false;
		}
		return true;
	}

	public assertCallContainsWords(words: string[]): Mistake | undefined {
		if (!this.callContainsWords(words)) {
			return {
				details: 'Make sure your call contains the words: ' + words.join(' '),
				severe: true
			};
		}
		return;
	}

	private callStartsWithWord(word: string): boolean {
		return this.getRadioCallWords()[0] == word.toLowerCase();
	}

	private callStartsWithConsecutiveWords(words: string[]): boolean {
		for (let i = 0; i < words.length; i++) {
			if (this.getRadioCallWord(i) != words[i].toLowerCase()) return false;
		}
		return true;
	}

	private callEndsWithWord(word: string): boolean {
		return this.getRadioCallWords()[this.getRadioCallWordCount() - 1] == word.toLowerCase();
	}

	private callEndsWithConsecutiveWords(words: string[]): boolean {
		for (let i = 0; i < words.length; i++) {
			if (this.getRadioCallWord(this.getRadioCallWordCount() - i - 1) != words[i].toLowerCase())
				return false;
		}
		return true;
	}

	private callContainsConsecutiveWords(words: string[]): boolean {
		const startIndex = this.getRadioCallWords().findIndex((x) => x == words[0].toLowerCase());
		if (startIndex == -1) return false;
		for (let i = 0; i < words.length; i++) {
			if (this.getRadioCallWord(startIndex + i) != words[i].toLowerCase()) return false;
		}
		return true;
	}

	public assertCallContainsConsecutiveWords(words: string[]): Mistake | undefined {
		if (!this.callContainsConsecutiveWords(words)) {
			return {
				details: 'Make sure your call contains the phrase: ' + words.join(' '),
				severe: true
			};
		}
		return;
	}

	private callContainsUserCallsign(): boolean {
		const validUserCallsigns = this.getValidUserCallsigns();
		return (
			this.callContainsConsecutiveWords(validUserCallsigns[0].split(' ')) ||
			(validUserCallsigns.length > 1 &&
				this.callContainsConsecutiveWords(validUserCallsigns[1].split(' ')))
		);
	}

	public assertCallContainsUserCallsign(): Mistake | undefined {
		if (!this.callContainsUserCallsign()) {
			return {
				details: 'Make sure your call contains your callsign.',
				severe: true
			};
		}
		return;
	}

	private callStartsWithUserCallsign(): boolean {
		const validUserCallsigns = this.getValidUserCallsigns();
		const startIndex = this.getUserCallsignStartIndexInRadioCall();
		if (startIndex == -1) return false;
		for (let i = 0; i < validUserCallsigns.length; i++) {
			if (this.callStartsWithConsecutiveWords(validUserCallsigns[i].split(' '))) return true;
		}
		return false;
	}

	public assertCallStartsWithUserCallsign(): Mistake | undefined {
		if (!this.callStartsWithUserCallsign()) {
			return {
				details: 'Make sure your call starts with your callsign.',
				severe: true
			};
		}
		return;
	}

	private callEndsWithUserCallsign(): boolean {
		const validUserCallsigns = this.getValidUserCallsigns();
		for (let i = 0; i < validUserCallsigns.length; i++) {
			if (this.callEndsWithConsecutiveWords(validUserCallsigns[i].split(' '))) return true;
		}
		return false;
	}

	public assertCallEndsWithUserCallsign(): Mistake | undefined {
		if (!this.callEndsWithUserCallsign()) {
			return {
				details: 'Make sure your call ends with your callsign.',
				severe: true
			};
		}
		return;
	}

	public getTargetCallsignWords(): string[] {
		return this.currentTarget.callsign.split(' ');
	}

	public callContainsTargetCallsign(): boolean {
		return this.callContainsConsecutiveWords(this.getTargetCallsignWords());
	}

	public assertCallStartsWithTargetCallsign(): Mistake | undefined {
		if (!this.callStartsWithConsecutiveWords(this.getTargetCallsignWords())) {
			return {
				details: 'Make sure your call starts with the callsign of the target.',
				severe: true
			};
		}
		return;
	}

	/* Returns the callsign of the user as it is to be stated in radio calls from ATC. */
	public getTargetAllocatedCallsign(): string {
		if (this.userCallsignModified) {
			return (
				this.getPrefix() +
				' ' +
				getAbbreviatedCallsign(
					this.seed.scenarioSeed,
					this.getAircraftType(),
					this.getUserCallsign()
				)
			);
		}
		return this.getUserCallsign();
	}

	/* Returns the callsign of the user as they would state it in a radio call.
	Given that abbreviated callsigns are optional once established both 
	full and abbreviated versions returned if abbreviation established. */
	private getValidUserCallsigns(): string[] {
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

	public getStartAerodromeStartingPoint(): AerodromeStartPoint {
		return this.getStartAerodrome().startPoints[
			this.seed.scenarioSeed % this.getStartAerodrome().startPoints.length
		];
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

	public assertCallContainsTakeOffRunwayName(): Mistake | undefined {
		if (
			!this.callContainsConsecutiveWords(['runway', this.getStartAerodromeTakeoffRunway().name])
		) {
			return {
				details: 'Make sure your call contains the name of the runway you are taking off from.',
				severe: true
			};
		}
		return;
	}

	public assertCallContainsAircraftType(): Mistake | undefined {
		if (!this.callContainsConsecutiveWords([this.getAircraftType()])) {
			return {
				details: 'Make sure your call contains the type of aircraft you are flying.',
				severe: true
			};
		}
		return;
	}

	public assertCallContainsScenarioStartPoint(): Mistake | undefined {
		if (!this.callContainsConsecutiveWords([this.getStartAerodromeStartingPoint().name])) {
			return {
				details: 'Make sure your call contains the name of the starting point.',
				severe: true
			};
		}
		return;
	}

	public assertCallContainsStartAerodromeName(): Mistake | undefined {
		if (!this.callContainsConsecutiveWords([this.getStartAerodrome().name])) {
			return {
				details: 'Make sure your call contains the name of the starting aerodrome.',
				severe: true
			};
		}
		return;
	}

	public assertCallContainsEndAerodromeName(): Mistake | undefined {
		if (!this.callContainsConsecutiveWords([this.getEndAerodrome().name])) {
			return {
				details: 'Make sure your call contains the name of the ending aerodrome.',
				severe: true
			};
		}
		return;
	}
}
