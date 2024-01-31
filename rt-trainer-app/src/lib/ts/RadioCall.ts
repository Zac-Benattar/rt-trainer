import Route, { getWaypointsFromVRPsJSON } from './Route';
import type Seed from './Seed';
import {
	getAbbreviatedCallsign,
	getCompassDirectionFromHeading,
	getHeadingBetween,
	haversineDistance,
	isCallsignStandardRegistration,
	processString,
	replacePhoneticAlphabetWithChars,
	replaceWithPhoneticAlphabet
} from './utils';
import type {
	ControlledAerodrome,
	AerodromeStartPoint,
	METORDataSample,
	Runway,
	RunwayHoldingPoint,
	Taxiway,
	UncontrolledAerodrome
} from './Aerodrome';
import { Feedback } from './Feedback';
import type { Waypoint } from './RouteTypes';
import type RoutePoint from './RoutePoints';

export default class RadioCall {
	private message: string;
	private seed: Seed;
	private numAirborneWaypoints: number;
	private route: RoutePoint[];
	private currentPointIndex: number;
	private prefix: string;
	private userCallsign: string;
	private userCallsignModified: boolean;
	private squark: boolean;
	private currentTarget: string;
	private currentTargetFrequency: number;
	private currentRadioFrequency: number;
	private currentTransponderFrequency: number;
	private aircraftType: string;
	private feedback: Feedback;
	private closestVRP: Waypoint | undefined;

	constructor(
		message: string,
		seed: Seed,
		numAirborneWaypoints: number,
		route: RoutePoint[],
		currentRoutePoint: number,
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
		this.message = message;
		this.seed = seed;
		this.numAirborneWaypoints = numAirborneWaypoints;
		this.route = route;
		this.currentPointIndex = currentRoutePoint;
		this.prefix = prefix;
		this.userCallsign = userCallsign;
		this.userCallsignModified = userCallsignModified;
		this.squark = squark;
		this.currentTarget = currentTarget;
		this.currentTargetFrequency = currentTargetFrequency;
		this.currentRadioFrequency = currentRadioFrequency;
		this.currentTransponderFrequency = currentTransponderFrequency;
		this.aircraftType = aircraftType;
		this.feedback = new Feedback();
	}

	public getRadioCall(): string {
		return processString(this.message.trim().toLowerCase());
	}

	public getSeed(): Seed {
		return this.seed;
	}

	public getCurrentRoutePoint(): RoutePoint {
		return this.route[this.currentPointIndex];
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

	public getCurrentTargetFrequencyPhonetics(): string {
		return replaceWithPhoneticAlphabet(this.currentTargetFrequency.toString());
	}

	public getCurrentRadioFrequency(): number {
		return this.currentRadioFrequency;
	}

	public getCurrentRadioFrequencyPhonetics(): string {
		return replaceWithPhoneticAlphabet(this.currentRadioFrequency.toString());
	}

	public getCurrentTransponderFrequency(): number {
		return this.currentTransponderFrequency;
	}

	public getCurrentTransponderFrequencyPhonetics(): string {
		return replaceWithPhoneticAlphabet(this.currentTransponderFrequency.toString());
	}

	public getAircraftType(): string {
		return this.aircraftType.toLowerCase();
	}

	public getAircraftTypePhonetics(): string {
		return replaceWithPhoneticAlphabet(this.aircraftType.toLowerCase());
	}

	public getFeedback(): Feedback {
		return this.feedback;
	}

	public isFlawless(): boolean {
		return this.feedback.isFlawless();
	}

	public getJSONData(): string {
		return JSON.stringify({
			message: this.message,
			seed: this.seed,
			route: this.route,
			currentPointIndex: this.currentPointIndex,
			prefix: this.prefix,
			userCallsign: this.userCallsign,
			userCallsignModified: this.userCallsignModified,
			squark: this.squark,
			currentTarget: this.currentTarget,
			currentTargetFrequency: this.currentTargetFrequency,
			currentRadioFrequency: this.currentRadioFrequency,
			currentTransponderFrequency: this.currentTransponderFrequency,
			aircraftType: this.aircraftType,
			feedback: this.feedback
		});
	}

	public setFeedback(feedback: Feedback): void {
		this.feedback = feedback;
	}

	public isTakeoffAerodromeControlled(): boolean {
		return this.getStartAerodrome().isControlled();
	}

	public getUnmodifiedRadioCall(): string {
		return this.message;
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

	private getRadioFrequencyDecimalIndex(): number {
		return this.getRadioCallWords().findIndex((x) => x.includes('decimal'));
	}

	private getRadioFrequencyStated(): number {
		const radioCallWords = this.getRadioCallWords();
		const decimalIndex = this.getRadioFrequencyDecimalIndex();
		if (decimalIndex <= 2) return -1; // Not enough words before decimal to be a frequency
		if (decimalIndex >= radioCallWords.length - 1) return -1; // Not enough words after decimal to be a frequency

		const beforeDecimal = radioCallWords.slice(decimalIndex - 3, decimalIndex);
		const convertedBeforeDecimal = beforeDecimal.map((x) => replacePhoneticAlphabetWithChars(x));
		const beforeDecimalDigits = convertedBeforeDecimal.join('');

		const afterDecimal = radioCallWords.slice(decimalIndex + 1, decimalIndex + 4);
		const convertedAfterDecimal = afterDecimal.map((x) => replacePhoneticAlphabetWithChars(x));
		const afterDecimalDigits = '.' + convertedAfterDecimal.join('');

		const freq = parseFloat(beforeDecimalDigits + afterDecimalDigits);

		return freq;
	}

	private radioFrequencyStatedEqualsCurrent(): boolean {
		return this.getRadioFrequencyStated() == this.currentRadioFrequency;
	}

	public assertCallContainsCurrentRadioFrequency(): boolean {
		if (!this.radioFrequencyStatedEqualsCurrent()) {
			this.feedback.pushSevereMistake("Your call didn't contain the current radio frequency.");

			return false;
		}
		return true;
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

	public assertCallContainsCriticalWord(word: string): boolean {
		if (!this.callContainsWord(word)) {
			this.feedback.pushSevereMistake("Your call didn't contain the word: " + word);

			return false;
		}
		return true;
	}

	public assertCallContainsNonCriticalWord(word: string): boolean {
		if (!this.callContainsWord(word)) {
			this.feedback.pushMinorMistake("Your call didn't contain the word: " + word);

			return false;
		}
		return true;
	}

	private callContainsWords(words: string[]): boolean {
		for (let i = 0; i < words.length; i++) {
			if (this.getRadioCallWords().find((x) => x == words[i].toLowerCase()) == undefined)
				return false;
		}
		return true;
	}

	public assertCallContainsCriticalWords(words: string[]): boolean {
		if (!this.callContainsWords(words)) {
			this.feedback.pushSevereMistake("Your call didn't contain the words: " + words.join(' '));
			return false;
		}
		return true;
	}

	public assertCallContainsNonCriticalWords(words: string[]): boolean {
		if (!this.callContainsWords(words)) {
			this.feedback.pushMinorMistake("Your call didn't contain the words: " + words.join(' '));
			return false;
		}
		return true;
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
			if (
				this.getRadioCallWord(this.getRadioCallWordCount() - i - 1) !=
				words[words.length - i - 1].toLowerCase()
			)
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

	public assertCallContainsConsecutiveCriticalWords(words: string[]): boolean {
		if (!this.callContainsConsecutiveWords(words)) {
			this.feedback.pushSevereMistake("Your call didn't contain the words: " + words.join(' '));
			return false;
		}
		return true;
	}

	public assertCallContainsConsecutiveNonCriticalWords(words: string[]): boolean {
		if (!this.callContainsConsecutiveWords(words)) {
			this.feedback.pushMinorMistake("Your call didn't contain the words: " + words.join(' '));
			return false;
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

	public assertCallContainsUserCallsign(): boolean {
		if (!this.callContainsUserCallsign()) {
			if (this.prefix != '') {
				this.feedback.pushSevereMistake("Your call didn't contain your callsign.");
				return false;
			}

			this.feedback.pushSevereMistake("Your call didn't contain your callsign, including prefix.");
			return false;
		}
		return true;
	}

	private callStartsWithUserCallsign(): boolean {
		const validUserCallsigns = this.getValidUserCallsigns();
		for (let i = 0; i < validUserCallsigns.length; i++) {
			if (this.callStartsWithConsecutiveWords(validUserCallsigns[i].split(' '))) return true;
		}
		return false;
	}

	public assertCallStartsWithUserCallsign(): boolean {
		if (!this.callStartsWithUserCallsign()) {
			this.feedback.pushSevereMistake("Your call didn't start with your callsign.");
			return false;
		}
		return true;
	}

	private callEndsWithUserCallsign(): boolean {
		const validUserCallsigns = this.getValidUserCallsigns();
		for (let i = 0; i < validUserCallsigns.length; i++) {
			if (this.callEndsWithConsecutiveWords(validUserCallsigns[i].split(' '))) return true;
		}
		return false;
	}

	public assertCallEndsWithUserCallsign(): boolean {
		if (!this.callEndsWithUserCallsign()) {
			this.feedback.pushSevereMistake("Your call didn't end with your callsign.");
			return false;
		}
		return true;
	}

	public getTargetCallsignWords(): string[] {
		return this.currentTarget.split(' ');
	}

	public callContainsTargetCallsign(): boolean {
		return this.callContainsConsecutiveWords(this.getTargetCallsignWords());
	}

	public assertCallStartsWithTargetCallsign(): boolean {
		if (!this.callStartsWithConsecutiveWords(this.getTargetCallsignWords())) {
			this.feedback.pushSevereMistake("Your call didn't start with the callsign of the target.");
			return false;
		}
		return true;
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
		return this.getStartAerodrome().getMETORSample();
	}

	public getEndAerodromeMETORSample(): METORDataSample {
		return this.getEndAerodrome().getMETORSample();
	}

	public getTakeoffRunway(): Runway {
		return this.getStartAerodrome().getTakeoffRunway();
	}

	public getTakeoffRunwayName(): string {
		return this.getStartAerodrome().getTakeoffRunway().name;
	}

	public getLandingRunway(): Runway {
		return this.getEndAerodrome().getLandingRunway();
	}

	public getLandingRunwayName(): string {
		return this.getEndAerodrome().getLandingRunway().name;
	}

	public assertCallContainsTakeOffRunwayName(): boolean {
		if (!this.callContainsConsecutiveWords([this.getTakeoffRunway().name])) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the name of the runway you are taking off from."
			);
			return false;
		} else if (!this.callContainsConsecutiveWords(['runway', this.getTakeoffRunway().name])) {
			this.feedback.pushMinorMistake(
				'Your call didn\'t contain the word "runway" with the runway name.'
			);
			return true;
		}
		return true;
	}

	public assertCallContainsAircraftType(): boolean {
		if (!this.callContainsConsecutiveWords([this.getAircraftType()])) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the type of aircraft you are flying: " + this.getAircraftType()
			);
			return false;
		}
		return true;
	}

	public assertCallContainsScenarioStartPoint(): boolean {
		if (
			!this.callContainsConsecutiveWords(
				this.getStartAerodromeStartingPoint().name.toLowerCase().split(' ')
			)
		) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain your location: " + this.getStartAerodromeStartingPoint().name
			);
			return false;
		}
		return true;
	}

	public assertCallContainsStartAerodromeName(): boolean {
		if (!this.callContainsConsecutiveWords([this.getStartAerodrome().getShortName()])) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the name of the starting aerodrome."
			);
			return false;
		}
		return true;
	}

	public assertCallContainsEndAerodromeName(): boolean {
		if (!this.callContainsConsecutiveWords([this.getEndAerodrome().getShortName()])) {
			this.feedback.pushSevereMistake("Your call didn't contain the name of the ending aerodrome.");
			return false;
		}
		return true;
	}

	public getSquarkCode(): number {
		return 2434 + (this.seed.scenarioSeed % 5) - 2;
	}

	public assertCallContainsSqwarkCode(): boolean {
		if (!this.callContainsWord(this.currentTransponderFrequency.toString())) {
			this.feedback.pushSevereMistake("Your call didn't contain the squawk code.");
			return false;
		} else if (
			!this.assertCallContainsConsecutiveCriticalWords([
				'squark',
				this.currentTransponderFrequency.toString()
			])
		) {
			this.feedback.pushMinorMistake(
				'Your squawk code readback didn\'t include the word "squark" with the squark code.'
			);
			return true;
		}
		return true;
	}

	public assertWILCOCallCorrect(): boolean {
		if (!this.callStartsWithWord('wilco')) {
			this.feedback.pushSevereMistake("Your call didn't start with WILCO (will comply).");
			return false;
		}
		return true;
	}

	public assertCallContainsWilco(): boolean {
		if (!this.callContainsWord('wilco')) {
			this.feedback.pushSevereMistake("Your call didn't contain WILCO (will comply).");
			return false;
		}
		return true;
	}

	public assertRogerCallCorrect(): boolean {
		if (
			!this.callContainsConsecutiveWords(['roger', this.getTargetAllocatedCallsign()]) ||
			!(this.callStartsWithUserCallsign() && this.getRadioCallWordCount() == 1)
		) {
			this.feedback.pushSevereMistake("Your call didn't start with ROGER (message received).");
			return false;
		}
		return true;
	}

	public assertCallContainsAltitude(): boolean {
		if (
			!this.callContainsWord('altitude') &&
			!this.callContainsWord(this.getCurrentRoutePoint().pose.altitude.toString())
		) {
			this.feedback.pushSevereMistake("Your call didn't contain your altitude.");
			return false;
		}
		return true;
	}

	public assertCallContainsTakeOffRunwayHoldingPoint(): boolean {
		if (!this.getTakeoffRunwayTaxiway().holdingPoints[0].name.split(' ')) {
			this.feedback.pushSevereMistake("Your call didn't contain your holding point.");
			return false;
		}
		return true;
	}

	public assertCallContainsTakeoffPressure(): boolean {
		const pressureSample = this.getStartAerodromeMETORSample().getPressureString().split(' ');
		if (!this.callContainsWord(pressureSample[0])) {
			this.feedback.pushSevereMistake("Your call didn't contain the air pressure.");
			return false;
		} else if (pressureSample.length > 1 && !this.callContainsWord(pressureSample[1])) {
			this.feedback.pushMinorMistake(
				'Your air pressure call didn\'t include "millibars" when the pressure was below 1000 millibars. \n' +
					'Numbers must have units when confusion is possible.'
			);
			return true;
		}
		return true;
	}

	public assertCallContainsTakeoffTemperature(): boolean {
		let temperatureSample = this.getStartAerodromeMETORSample().getTemperatureString();
		let sign = '';

		if (temperatureSample[0] == '-' || temperatureSample[0] == '+') {
			temperatureSample = temperatureSample.substring(1);
			sign = temperatureSample[0];
		}

		if (!this.callContainsWord(temperatureSample)) {
			this.feedback.pushSevereMistake("Your call didn't contain the temperature.");
			return false;
		} else if (!this.callContainsWord(sign + temperatureSample)) {
			this.feedback.pushMinorMistake(
				"Your temperature readback didn't include the sign " +
					sign +
					'. \n' +
					'Temperatures must have a sign when confusion is possible.'
			);

			return true;
		}
		return true;
	}

	public assertCallContainsTakeoffDewpoint(): boolean {
		let dewpointSample = this.getStartAerodromeMETORSample().getDewpointString();
		let sign = '';

		if (dewpointSample[0] == '-' || dewpointSample[0] == '+') {
			dewpointSample = dewpointSample.substring(1);
			sign = dewpointSample[0];
		}

		if (!this.callContainsWord(dewpointSample)) {
			this.feedback.pushSevereMistake("Your call didn't contain the dewpoint.");
			return false;
		} else if (!this.callContainsWord(sign + dewpointSample)) {
			this.feedback.pushMinorMistake(
				"Your dewpoint readback didn't include the sign " +
					sign +
					'. \n' +
					'Dewpoints must have a sign when confusion is possible.'
			);

			return true;
		}
		return true;
	}

	public assertCallContainsTakeoffWindSpeed(): boolean {
		// Wind speed followed by 'knots'
		const windSpeedSample = this.getStartAerodromeMETORSample().getWindSpeedString().split(' ');
		if (!this.callContainsWord(windSpeedSample[0])) {
			this.feedback.pushSevereMistake("Your call didn't contain the wind speed.");
			return false;
		} else if (!this.callContainsWord(windSpeedSample[1])) {
			this.feedback.pushMinorMistake("Your call didn't contain the wind speed units.");
			return true;
		}
		return true;
	}

	public assertCallContainsTakeoffWindDirection(): boolean {
		const windDirectionSample = this.getStartAerodromeMETORSample()
			.getWindDirectionString()
			.split(' ');
		if (!this.callContainsConsecutiveWords(windDirectionSample)) {
			this.feedback.pushSevereMistake("Your call didn't contain the wind direction.");
			return false;
		}
		return true;
	}

	// Currently only checks for VFR
	public assertCallContainsFlightRules(): boolean {
		if (!this.callContainsWord('VFR')) {
			this.feedback.pushSevereMistake("Your call didn't contain your flight rules (VFR).");
			return false;
		}
		return true;
	}

	public getTakeoffRunwayTaxiway(): Taxiway {
		return this.getStartAerodrome().getTakeoffRunwayTaxiway();
	}

	public getTakeoffRunwayTaxiwayHoldingPoint(): RunwayHoldingPoint {
		return this.getStartAerodrome().getTakeoffRunwayTaxiwayHoldingPoint();
	}

	public getTakeoffTurnoutHeading(): number {
		const routeWaypoints = Route.getRouteWaypoints(this.seed, this.numAirborneWaypoints);

		const headingToFirstWaypoint = getHeadingBetween(
			routeWaypoints[0].lat,
			routeWaypoints[0].long,
			routeWaypoints[1].lat,
			routeWaypoints[1].long
		);

		// If turnout heading doesnt exist then most likely something has gone very wrong as
		// there should have already been an error, issue will be with getHeadingTo method
		if (headingToFirstWaypoint == undefined)
			throw new Error('No heading in getTakeoffTurnoutHeading.');

		return headingToFirstWaypoint;
	}

	public assertCallContainsTakeoffTurnoutHeading(): boolean {
		if (!this.callContainsWord(this.getTakeoffTurnoutHeading().toString())) {
			this.feedback.pushSevereMistake("Your call didn't contain your takeoff turnout heading.");
			return false;
		}
		return true;
	}

	public getTakeoffTransitionAltitude(): number {
		return this.getStartAerodrome().getTakeoffTransitionAltitude();
	}

	public assertCallContainsNotAboveTransitionAltitude(): boolean {
		if (!this.callContainsWord('not') || !this.callContainsWord('above')) {
			this.feedback.pushSevereMistake("Your call didn't contain 'not above'.");
			return false;
		}
		if (!this.callContainsWord(this.getTakeoffTransitionAltitude().toString())) {
			this.feedback.pushSevereMistake("Your call didn't contain the takeoff transition altitude.");
			return false;
		}
		return true;
	}

	public getTakeoffTraffic(): string {
		if (this.seed.scenarioSeed % 2 == 0) return 'traffic is Cessna 152 reported final';
		else return 'no reported traffic';
	}

	public getLandingTraffic(): string {
		if (this.getEndAerodrome().isControlled()) {
			if (this.seed.scenarioSeed % 5 == 0) return 'Vehicle crossing';
			else return '';
		} else {
			if (this.seed.scenarioSeed % 3 == 0) return 'traffic is a PA 28 lined up to depart';
			else return 'no reported traffic';
		}
	}

	public getTakeoffWindString(): string {
		return this.getStartAerodromeMETORSample().getWindString();
	}

	public getCurrentAltitude(): number {
		return this.getCurrentRoutePoint().pose.altitude;
	}

	public getCurrentAltitudeString(): string {
		return this.getCurrentAltitude() + ' feet';
	}

	public assertCallContainsCurrentAltitude(): boolean {
		if (!this.callContainsWord(this.getCurrentAltitude().toString())) {
			this.feedback.pushSevereMistake("Your call didn't contain your current altitude.");
			return false;
		}
		return true;
	}

	public assertCallContainsLandingRunwayName(): boolean {
		if (!this.callContainsConsecutiveWords([this.getLandingRunway().name])) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the name of the runway you are landing on."
			);
			return false;
		} else if (!this.callContainsConsecutiveWords(['runway', this.getLandingRunway().name])) {
			this.feedback.pushMinorMistake(
				'Your call didn\'t contain the word "runway" with the runway name.'
			);
			return true;
		}
		return true;
	}

	public assertCallContainsLandingPressure(): boolean {
		const pressureSample = this.getEndAerodromeMETORSample().getPressureString().split(' ');
		if (!this.callContainsWord(pressureSample[0])) {
			this.feedback.pushSevereMistake("Your call didn't contain the air pressure.");
			return false;
		} else if (pressureSample.length > 1 && !this.callContainsWord(pressureSample[1])) {
			this.feedback.pushMinorMistake(
				'Your air pressure call didn\'t include "millibars" when the pressure was below 1000 millibars. \n' +
					'Numbers must have units when confusion is possible.'
			);
			return true;
		}
		return true;
	}

	public getPreviousWaypoint(): Waypoint {
		return Route.getRouteWaypoints(this.seed, this.numAirborneWaypoints)[
			this.getCurrentRoutePoint().nextWaypointIndex
		];
	}

	public getPreviousWaypointName(): string {
		return this.getPreviousWaypoint().name;
	}

	public assertCallContainsPreviousWaypointName(): boolean {
		if (!this.callContainsConsecutiveWords([this.getPreviousWaypointName()])) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the name of the previous waypoint."
			);
			return false;
		}
		return true;
	}

	public getDistanceToPreviousWaypointInMeters(): number {
		const prev = this.getPreviousWaypoint();
		const currentPose = this.getCurrentRoutePoint().pose;
		return haversineDistance(prev.lat, prev.long, currentPose.lat, currentPose.long);
	}

	public getDistanceToPreviousWaypointNearestMile(): number {
		// round to nearest mile
		return Math.round(this.getDistanceToPreviousWaypointInMeters() / 1609.344);
	}

	public getPositionRelativeToLastWaypoint(): string {
		const prev = this.getPreviousWaypoint();
		const currentPose = this.getCurrentRoutePoint().pose;
		const heading = getHeadingBetween(prev.lat, prev.long, currentPose.lat, currentPose.long);
		const compassDirection = getCompassDirectionFromHeading(heading);
		const distance = this.getDistanceToPreviousWaypointNearestMile();
		return distance + ' miles ' + compassDirection;
	}

	public assertCallContainsPositionRelativeToLastWaypoint(): boolean {
		if (!this.callContainsConsecutiveWords(this.getPositionRelativeToLastWaypoint().split(' '))) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain your position relative to the previous waypoint."
			);
			return false;
		}
		return true;
	}

	public getLandingParkingSpot(): string {
		return this.getEndAerodrome().getLandingParkingSpot();
	}

	public assertCallContainsLandingParkingSpot(): boolean {
		if (!this.callContainsConsecutiveWords([this.getLandingParkingSpot()])) {
			this.feedback.pushSevereMistake("Your call didn't contain your parking spot.");
			return false;
		}
		return true;
	}

	public getOverheadJoinAltitude(): number {
		return 2000;
	}

	public assertCallContainsOverheadJoinAltitude(): boolean {
		if (!this.callContainsWord(this.getOverheadJoinAltitude().toString())) {
			this.feedback.pushSevereMistake("Your call didn't contain the overhead join altitude.");
			return false;
		}
		return true;
	}

	private getClosestVRP(): Waypoint {
		// If already calculated then return known value
		if (this.closestVRP != undefined) return this.closestVRP;

		const currentLat = this.getCurrentRoutePoint().pose.lat;
		const currentLong = this.getCurrentRoutePoint().pose.long;

		const vRPs = getWaypointsFromVRPsJSON();
		let closestVRP = vRPs[0];
		let closestVRPDistance = haversineDistance(
			currentLat,
			currentLong,
			closestVRP.lat,
			closestVRP.long
		);

		for (let i = 1; i < vRPs.length; i++) {
			const distance = haversineDistance(currentLat, currentLong, vRPs[i].lat, vRPs[i].long);
			if (distance < closestVRPDistance) {
				closestVRP = vRPs[i];
				closestVRPDistance = distance;
			}
		}

		this.closestVRP = closestVRP;

		return this.closestVRP;
	}

	public getClosestVRPName(): string {
		return this.getClosestVRP().name;
	}

	public assertCallContainsClosestVRPName(): boolean {
		if (!this.callContainsConsecutiveWords([this.getClosestVRPName()])) {
			this.feedback.pushSevereMistake("Your call didn't contain the closest VRP.");
			return false;
		}
		return true;
	}

	public getNextWaypoint(): Waypoint {
		return Route.getRouteWaypoints(this.seed, this.numAirborneWaypoints)[
			this.getCurrentRoutePoint().nextWaypointIndex
		];
	}

	public getNextWaypointName(): string {
		return this.getNextWaypoint().name;
	}

	public getNextWaypointDistance(): number {
		const next = this.getNextWaypoint();
		const currentPose = this.getCurrentRoutePoint().pose;
		return haversineDistance(next.lat, next.long, currentPose.lat, currentPose.long);
	}

	public getNextWaypointDistanceNearestMile(): number {
		// round to nearest mile
		return Math.round(this.getNextWaypointDistance() / 1609.344);
	}

	public assertCallContainsNextWaypointName(): boolean {
		if (!this.callContainsConsecutiveWords([this.getNextWaypointName()])) {
			this.feedback.pushSevereMistake("Your call didn't contain the name of the next waypoint.");
			return false;
		}
		return true;
	}

	public assertCallContainsNextWaypointDistance(): boolean {
		if (!this.callContainsWord(this.getNextWaypointDistanceNearestMile().toString())) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the distance to the next waypoint."
			);
			return false;
		}
		return true;
	}

	public getCurrentTime(): number {
		return this.getCurrentRoutePoint().timeAtPoint;
	}

	public assertCallContainsCurrentTime(): boolean {
		if (!this.callContainsWord(this.getCurrentTime().toString())) {
			this.feedback.pushSevereMistake("Your call didn't contain the current time.");
			return false;
		}
		return true;
	}

	public getNextWaypointArrivalTime(): number {
		return this.getNextWaypoint().arrivalTime;
	}

	public assertCallContainsNextWaypointArrivalTime(): boolean {
		if (!this.callContainsWord(this.getNextWaypoint().arrivalTime.toString())) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the arrival time at the next waypoint."
			);
			return false;
		}
		return true;
	}

	public getCurrentATISLetter(): string {
		if (this.getEndAerodrome().isControlled()) {
			return (this.getEndAerodrome() as ControlledAerodrome).getATISLetter();
		} else {
			throw new Error('No ATIS letter for uncontrolled aerodrome.');
		}
	}
}
