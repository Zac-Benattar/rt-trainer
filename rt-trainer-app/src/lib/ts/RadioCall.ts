import type Scenario from './Scenario';
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
import Feedback from './Feedback';
import type ScenarioPoint from './ScenarioPoints';
import type Waypoint from './AeronauticalClasses/Waypoint';
import type Runway from './AeronauticalClasses/Runway';
import type { METORDataSample } from './AeronauticalClasses/METORData';
import type Airport from './AeronauticalClasses/Airport';

export default class RadioCall {
	private message: string;
	private seed: number;
	private scenario: Scenario;
	private currentPointIndex: number;
	private prefix: string;
	private userCallsign: string;
	private userCallsignModified: boolean;
	private squark: boolean;
	private currentTarget: string;
	private currentTargetFrequency: string;
	private currentRadioFrequency: string;
	private currentTransponderFrequency: string;
	private aircraftType: string;
	private feedback: Feedback;
	private closestVRP: Waypoint | undefined;

	constructor(
		message: string,
		seed: number,
		scenario: Scenario,
		currentRoutePoint: number,
		prefix: string,
		userCallsign: string,
		userCallsignModified: boolean,
		squark: boolean,
		currentTarget: string,
		currentTargetFrequency: string,
		currentRadioFrequency: string,
		currentTransponderFrequency: string,
		aircraftType: string
	) {
		this.message = message;
		this.seed = seed;
		this.scenario = scenario;
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

	public getStartAirport(): Airport {
		return this.scenario.getStartAirport();
	}

	public getEndAirport(): Airport {
		return this.scenario.getEndAirport();
	}

	public getRadioCall(): string {
		return processString(this.message.trim().toLowerCase());
	}

	public getSeed(): number {
		return this.seed;
	}

	public getCurrentRoutePoint(): ScenarioPoint {
		return this.scenario.getCurrentPoint();
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

	public getCurrentTargetFrequency(): string {
		return this.currentTargetFrequency;
	}

	public getCurrentTargetFrequencyPhonetics(): string {
		return replaceWithPhoneticAlphabet(this.currentTargetFrequency);
	}

	public getCurrentRadioFrequency(): string {
		return this.currentRadioFrequency;
	}

	public getCurrentRadioFrequencyPhonetics(): string {
		return replaceWithPhoneticAlphabet(this.currentRadioFrequency);
	}

	public getCurrentTransponderFrequency(): string {
		return this.currentTransponderFrequency;
	}

	public getCurrentTransponderFrequencyPhonetics(): string {
		return replaceWithPhoneticAlphabet(this.currentTransponderFrequency);
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

	public setFeedback(feedback: Feedback): void {
		this.feedback = feedback;
	}

	public isTakeoffAerodromeControlled(): boolean {
		return this.getStartAirport().isControlled();
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

	private getRadioFrequencyStated(): string | undefined {
		const radioCallWords = this.getRadioCallWords();
		const decimalIndex = this.getRadioFrequencyDecimalIndex();
		if (decimalIndex <= 2) return undefined; // Not enough words before decimal to be a frequency
		if (decimalIndex >= radioCallWords.length - 1) return undefined; // Not enough words after decimal to be a frequency

		const beforeDecimal = radioCallWords.slice(decimalIndex - 3, decimalIndex);
		const convertedBeforeDecimal = beforeDecimal.map((x) => replacePhoneticAlphabetWithChars(x));
		const beforeDecimalDigits = convertedBeforeDecimal.join('');

		const afterDecimal = radioCallWords.slice(decimalIndex + 1, decimalIndex + 4);
		const convertedAfterDecimal = afterDecimal.map((x) => replacePhoneticAlphabetWithChars(x));
		const afterDecimalDigits = convertedAfterDecimal.join('');

		const freq = beforeDecimalDigits + '.' + afterDecimalDigits;

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
					getAbbreviatedCallsign(this.seed, this.getAircraftType(), this.userCallsign)
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

	public getStartAerodromeMETORSample(): METORDataSample {
		return this.getStartAirport().getMETORSample(this.seed);
	}

	public getEndAerodromeMETORSample(): METORDataSample {
		return this.getEndAirport().getMETORSample(this.seed);
	}

	public getTakeoffRunway(): Runway {
		return this.getStartAirport().getTakeoffRunway(this.seed);
	}

	public getTakeoffRunwayName(): string {
		return this.getStartAirport().getTakeoffRunway(this.seed).designator;
	}

	public getLandingRunway(): Runway {
		return this.getEndAirport().getLandingRunway(this.seed);
	}

	public getLandingRunwayName(): string {
		return this.getEndAirport().getLandingRunway(this.seed).designator;
	}

	public assertCallContainsTakeOffRunwayName(): boolean {
		if (!this.callContainsConsecutiveWords([this.getTakeoffRunway().designator])) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the name of the runway you are taking off from."
			);
			return false;
		} else if (!this.callContainsConsecutiveWords(['runway', this.getTakeoffRunway().designator])) {
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
		throw new Error('Unimplemented function');
	}

	public assertCallContainsStartAerodromeName(): boolean {
		if (!this.callContainsConsecutiveWords([this.getStartAirport().getShortName()])) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the name of the starting aerodrome."
			);
			return false;
		}
		return true;
	}

	public assertCallContainsEndAerodromeName(): boolean {
		if (!this.callContainsConsecutiveWords([this.getEndAirport().getShortName()])) {
			this.feedback.pushSevereMistake("Your call didn't contain the name of the ending aerodrome.");
			return false;
		}
		return true;
	}

	public getSquarkCode(): number {
		return 2434 + (this.seed % 5) - 2;
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
		if (!this.callContainsWord(this.getTakeoffRunwayTaxiwayHoldingPoint())) {
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

	public getTakeoffRunwayTaxiway(): string {
		throw new Error('Unimplemented function');
	}

	public getTakeoffRunwayTaxiwayHoldingPoint(): string {
		throw new Error('Unimplemented function');
	}

	public getTakeoffTurnoutHeading(): number {
		const headingToFirstWaypoint = getHeadingBetween(
			this.scenario.waypoints[0].lat,
			this.scenario.waypoints[0].long,
			this.scenario.waypoints[1].lat,
			this.scenario.waypoints[1].long
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
		return this.getStartAirport().getTakeoffTransitionAltitude();
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
		if (this.seed % 2 == 0) return 'traffic is Cessna 152 reported final';
		else return 'no reported traffic';
	}

	public getLandingTraffic(): string {
		if (this.getEndAirport().isControlled()) {
			if (this.seed % 5 == 0) return 'Vehicle crossing';
			else return '';
		} else {
			if (this.seed % 3 == 0) return 'traffic is a PA 28 lined up to depart';
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
		if (!this.callContainsConsecutiveWords([this.getLandingRunway().designator])) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the name of the runway you are landing on."
			);
			return false;
		} else if (!this.callContainsConsecutiveWords(['runway', this.getLandingRunway().designator])) {
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
		return this.scenario.waypoints[this.getCurrentRoutePoint().nextWaypointIndex];
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
		throw new Error('Unimplemented function');
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
		throw new Error('Unimplemented function');
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
		return this.scenario.waypoints[this.getCurrentRoutePoint().nextWaypointIndex];
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
		if (this.getEndAirport().isControlled()) {
			return this.getEndAirport().getATISLetter(this.seed);
		} else {
			throw new Error('No ATIS letter for uncontrolled aerodrome.');
		}
	}

	public getNextFixName(): string {
		throw new Error('Unimplemented method');
	}

	public getPositionRelativeToNearestFix(): string {
		throw new Error('Unimplemented method');
	}

	public getCurrentAltimeterSetting(): string {
		throw new Error('Unimplemented method');
	}

	public getMATZPenetrationHeight(): string {
		return '1500 feet';
	}

	public assertCallContainsMATZPenetrationHeight(): boolean {
		if (!this.callContainsWords(this.getMATZPenetrationHeight().split(' '))) {
			this.feedback.pushSevereMistake(
				"Your call didn't contain the correct height for transiting the MATZ."
			);
			return false;
		}
		return true;
	}
}
