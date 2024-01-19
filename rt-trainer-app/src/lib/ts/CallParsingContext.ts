import Route from './Route';
import type { RoutePoint } from './RouteStates';
import type Seed from './Seed';
import type { Mistake } from './ServerClientTypes';
import {
	getAbbreviatedCallsign,
	isCallsignStandardRegistration,
	processString,
	replaceWithPhoneticAlphabet
} from './utils';
import {
	ControlledAerodrome,
	type AerodromeStartPoint,
	type METORDataSample,
	type Runway,
	type RunwayHoldingPoint,
	type Taxiway,
	UncontrolledAerodrome
} from './Aerodrome';

export default class CallParsingContext {
	private radioCall: string;
	private seed: Seed;
	private routePoint: RoutePoint;
	private prefix: string;
	private userCallsign: string;
	private userCallsignModified: boolean;
	private squark: boolean;
	private currentTarget: string;
	private currentTargetFrequency: number;
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
		currentTarget: string,
		currentTargetFrequency: number,
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
		this.currentTargetFrequency = currentTargetFrequency;
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

	public getUserCallsignPhonetics(): string {
		if (isCallsignStandardRegistration(this.userCallsign)) {
			return this.getPrefix() + ' ' + replaceWithPhoneticAlphabet(this.userCallsign.toLowerCase());
		} else {
			return this.getUserCallsign();
		}
	}

	public getUserCallsignModified(): boolean {
		return this.userCallsignModified;
	}

	public getSquark(): boolean {
		return this.squark;
	}

	public getCurrentTarget(): string {
		return this.currentTarget;
	}

	public getCurrentTargetFrequency(): number {
		return this.currentTargetFrequency;
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

	public isTakeoffAerodromeControlled(): boolean {
		console.log(this.getStartAerodrome());
		return this.getStartAerodrome() instanceof ControlledAerodrome;
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
			if (this.prefix != '') {
				return {
					details: 'Make sure your call contains your callsign.',
					severe: true
				};
			}

			return {
				details: 'Make sure your call contains your callsign, including prefix.',
				severe: true
			};
		}
		return;
	}

	private callStartsWithUserCallsign(): boolean {
		const validUserCallsigns = this.getValidUserCallsigns();
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
		return this.currentTarget.split(' ');
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
				replaceWithPhoneticAlphabet(
					getAbbreviatedCallsign(this.seed.scenarioSeed, this.getAircraftType(), this.userCallsign)
				)
			);
		}
		return this.getUserCallsignPhonetics();
	}

	/* Returns the callsign of the user as they would state it in a radio call.
	Given that abbreviated callsigns are optional once established both 
	full and abbreviated versions returned if abbreviation established. */
	private getValidUserCallsigns(): string[] {
		const callsigns = [this.getUserCallsignPhonetics(), this.getTargetAllocatedCallsign()];
		if (callsigns[0] != callsigns[1]) return callsigns;
		return [callsigns[0]];
	}

	public getStartAerodrome(): ControlledAerodrome | UncontrolledAerodrome {
		return Route.getStartAerodrome(this.seed);
	}

	public getEndAerodrome(): ControlledAerodrome | UncontrolledAerodrome {
		return Route.getEndAerodrome(this.seed);
	}

	public getStartAerodromeStartingPoint(): AerodromeStartPoint {
		const startPoints = this.getStartAerodrome().getStartPoints();
		return startPoints[this.seed.scenarioSeed % startPoints.length];
	}

	public getStartAerodromeMETORSample(): METORDataSample {
		return this.getStartAerodrome().getMETORData().getSample(this.seed);
	}

	public getEndAerodromeMETORSample(): METORDataSample {
		return this.getEndAerodrome().getMETORData().getSample(this.seed);
	}

	public getStartAerodromeTakeoffRunway(): Runway {
		const runways = this.getStartAerodrome().getRunways();
		return runways[this.seed.scenarioSeed % runways.length];
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
		if (!this.callContainsConsecutiveWords([this.getStartAerodrome().getShortName()])) {
			return {
				details: 'Make sure your call contains the name of the starting aerodrome.',
				severe: true
			};
		}
		return;
	}

	public assertCallContainsEndAerodromeName(): Mistake | undefined {
		if (!this.callContainsConsecutiveWords([this.getEndAerodrome().getShortName()])) {
			return {
				details: 'Make sure your call contains the name of the ending aerodrome.',
				severe: true
			};
		}
		return;
	}

	public assertCallContainsSqwarkCode(): Mistake | undefined {
		if (!this.callContainsConsecutiveWords(['squawk', this.currentTransponderFrequency + ''])) {
			return {
				details: 'Make sure your call contains the squawk code.',
				severe: true
			};
		}
		return;
	}

	public assertWILCOCallCorrect(): Mistake | undefined {
		if (!this.callStartsWithWord('wilco')) {
			return {
				details: 'Make sure your call starts with WILCO (will comply).',
				severe: true
			};
		}
		return;
	}

	public assertRogerCallCorrect(): Mistake | undefined {
		if (
			!this.callContainsConsecutiveWords(['roger', this.getTargetAllocatedCallsign()]) ||
			!(this.callStartsWithUserCallsign() && this.getRadioCallWordCount() == 1)
		) {
			return {
				details: 'Make sure your call starts with ROGER (message received).',
				severe: true
			};
		}
		return;
	}

	public assertCallContainsCurrentLocation(): Mistake | undefined {
		if (!this.callContainsConsecutiveWords(this.getRoutePoint().waypoint.name.split(' '))) {
			return {
				details: 'Make sure your call contains the current location.',
				severe: true
			};
		}
		return;
	}

	public assertCallContainsAltitude(): Mistake | undefined {
		if (
			!this.callContainsWord('altitude') &&
			!this.callContainsWord(this.routePoint.pose.altitude.toString())
		) {
			return {
				details: 'Make sure your call contains your altitude.',
				severe: true
			};
		}
		return;
	}

	public assertCallContainsTakeOffRunwayHoldingPoint(): Mistake | undefined {
		if (!this.getTakeoffRunwayTaxiway().holdingPoints[0].name.split(' ')) {
			return {
				details: 'Make sure your call contains the current holding point.',
				severe: true
			};
		}
		return;
	}

	public assertCallContainsStartAerodromePressure(): Mistake | undefined {
		const pressureSample = this.getStartAerodromeMETORSample().getPressureString().split(' ');
		if (!this.callContainsWord(pressureSample[0])) {
			return {
				details: 'Make sure your call contains the air pressure.',
				severe: true
			};
		} else if (pressureSample.length > 1 && !this.callContainsWord(pressureSample[1])) {
			return {
				details:
					'Make sure to append millibars to your pressure readback when pressure is below 1000 millibars.',
				severe: false
			};
		}
		return;
	}

	public assertCallContainsStartAerodromeTemperature(): Mistake | undefined {
		const temperatureSample = this.getStartAerodromeMETORSample().getTemperatureString().split(' ');
		if (!this.callContainsWord(temperatureSample[0])) {
			return {
				details: 'Make sure your call contains the temperature.',
				severe: true
			};
		} else if (!this.callContainsWord(temperatureSample[1])) {
			return {
				details: 'Make sure your call contains the temperature units.',
				severe: false
			};
		}
		return;
	}

	public assertCallContainsStartAerodromeDewpoint(): Mistake | undefined {
		const dewpointSample = this.getStartAerodromeMETORSample().getDewpointString().split(' ');
		if (!this.callContainsWord(dewpointSample[0])) {
			return {
				details: 'Make sure your call contains the dewpoint.',
				severe: true
			};
		} else if (!this.callContainsWord(dewpointSample[1])) {
			return {
				details: 'Make sure your call contains the dewpoint units.',
				severe: false
			};
		}
		return;
	}

	public assertCallContainsStartAerodromeWindSpeed(): Mistake | undefined {
		const windSpeedSample = this.getStartAerodromeMETORSample().getWindSpeedString().split(' ');
		if (!this.callContainsWord(windSpeedSample[0])) {
			return {
				details: 'Make sure your call contains the wind speed.',
				severe: true
			};
		} else if (!this.callContainsWord(windSpeedSample[1])) {
			return {
				details: 'Make sure your call contains the wind speed units.',
				severe: false
			};
		}
		return;
	}

	public assertCallContainsStartAerodromeWindDirection(): Mistake | undefined {
		const windDirectionSample = this.getStartAerodromeMETORSample()
			.getWindDirectionString()
			.split(' ');
		if (!this.callContainsConsecutiveWords(windDirectionSample)) {
			return {
				details: 'Make sure your call contains the wind direction.',
				severe: true
			};
		}
		return;
	}

	// Currently only checks for VFR
	public assertCallContainsFlightRules(): Mistake | undefined {
		if (!this.callContainsWord('VFR')) {
			return {
				details: 'Make sure your call contains your flight rules (VFR).',
				severe: true
			};
		}
		return;
	}

	public getTakeoffRunwayTaxiway(): Taxiway {
		return this.getStartAerodromeTakeoffRunway().taxiways[
			this.seed.scenarioSeed % this.getStartAerodromeTakeoffRunway().taxiways.length
		];
	}

	public getTakeoffRunwayHoldingPoint(): RunwayHoldingPoint {
		return this.getTakeoffRunwayTaxiway().holdingPoints[
			this.seed.scenarioSeed % this.getTakeoffRunwayTaxiway().holdingPoints.length
		];
	}
}
