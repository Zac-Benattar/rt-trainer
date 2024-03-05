import Scenario from './Scenario';
import {
	addSpacesBetweenCharacters,
	convertMinutesToTimeString,
	getAbbreviatedCallsign,
	getCompassDirectionFromHeading,
	isCallsignStandardRegistration,
	processString,
	removePunctuation,
	replacePhoneticAlphabetWithChars,
	replaceWithPhoneticAlphabet,
	simpleHash,
	trimSpaces
} from './utils';
import Feedback from './Feedback';
import type ScenarioPoint from './ScenarioPoints';
import type Waypoint from './AeronauticalClasses/Waypoint';
import type Runway from './AeronauticalClasses/Runway';
import type { METORDataSample } from './AeronauticalClasses/METORData';
import type Airport from './AeronauticalClasses/Airport';
import { Type } from 'class-transformer';
import * as turf from '@turf/turf';

export default class RadioCall {
	private message: string;
	private seed: number;

	@Type(() => Scenario)
	private scenario: Scenario;
	private prefix: string;
	private userCallsign: string;
	private userCallsignModified: boolean;
	private squark: boolean;
	private currentTarget: string;
	private currentTargetFrequency: string;
	private currentRadioFrequency: string;
	private currentTransponderFrequency: string;
	private aircraftType: string;

	@Type(() => Feedback)
	private feedback: Feedback;
	private closestVRP: Waypoint | undefined;

	constructor(
		message: string,
		seedString: string,
		scenario: Scenario,
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
		this.seed = simpleHash(seedString);
		this.scenario = scenario;
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

	public getCurrentScenarioPoint(): ScenarioPoint {
		return this.scenario.getCurrentPoint();
	}

	public getPrefix(): string {
		return this.prefix.toLowerCase();
	}

	public getUserCallsign(): string {
		return this.userCallsign.toLowerCase();
	}

	public getUserCallsignWithPrefix(): string {
		return this.getPrefix() + ' ' + this.userCallsign.toLowerCase();
	}

	public getUserCallsignPhonetics(): string {
		if (isCallsignStandardRegistration(this.userCallsign)) {
			return replaceWithPhoneticAlphabet(this.userCallsign.toLowerCase());
		}
		return this.userCallsign.toLowerCase(); // For callsigns such as Bombadier 123AB
	}

	public getUserCallsignPhoneticsWithPrefix(): string {
		if (isCallsignStandardRegistration(this.userCallsign)) {
			return this.getPrefix() + ' ' + replaceWithPhoneticAlphabet(this.userCallsign.toLowerCase());
		} else {
			return this.getUserCallsignWithPrefix();
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

	public assertCallContainsCurrentRadioFrequency(severe: boolean): boolean {
		if (!this.radioFrequencyStatedEqualsCurrent()) {
			this.feedback.pushMistake("Your call didn't contain the current radio frequency.", severe);

			return false;
		}
		return true;
	}

	private callContainsWord(word: string): boolean {
		return this.getRadioCallWords().find((x) => x == word.toLowerCase()) != undefined;
	}

	public assertCallContainsCriticalWord(word: string): boolean {
		if (!this.callContainsWord(word)) {
			this.feedback.pushMistake("Your call didn't contain the word: " + word, true);

			return false;
		}
		return true;
	}

	public assertCallContainsNonCriticalWord(word: string): boolean {
		if (!this.callContainsWord(word)) {
			this.feedback.pushMistake("Your call didn't contain the word: " + word, false);

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
			this.feedback.pushMistake("Your call didn't contain the words: " + words.join(' '), true);
			return false;
		}
		return true;
	}

	public assertCallContainsNonCriticalWords(words: string[]): boolean {
		if (!this.callContainsWords(words)) {
			this.feedback.pushMistake("Your call didn't contain the words: " + words.join(' '), false);
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
			this.feedback.pushMistake("Your call didn't contain the words: " + words.join(' '), true);
			return false;
		}
		return true;
	}

	public assertCallContainsConsecutiveNonCriticalWords(words: string[]): boolean {
		if (!this.callContainsConsecutiveWords(words)) {
			this.feedback.pushMistake("Your call didn't contain the words: " + words.join(' '), false);
			return false;
		}
		return true;
	}

	// Issue here is that it needs to check for student g o f l y, and its not doing that
	public callContainsUserCallsign(): boolean {
		const validUserCallsigns = this.getValidUserCallsigns();
		for (let i = 0; i < validUserCallsigns.length; i++) {
			if (this.callContainsConsecutiveWords(validUserCallsigns[i].split(' '))) return true;
		}
		return false;
	}

	public assertCallContainsUserCallsign(severe: boolean): boolean {
		if (!this.callContainsUserCallsign()) {
			if (this.prefix && this.prefix.trim() != '') {
				this.feedback.pushMistake("Your call didn't contain your callsign.", severe);
				return false;
			}

			this.feedback.pushMistake(
				"Your call didn't contain your callsign, including prefix.",
				severe
			);
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

	public assertCallStartsWithUserCallsign(severe: boolean): boolean {
		if (!this.callStartsWithUserCallsign()) {
			this.feedback.pushMistake("Your call didn't start with your callsign.", severe);
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

	public assertCallEndsWithUserCallsign(severe: boolean): boolean {
		if (!this.callEndsWithUserCallsign()) {
			this.feedback.pushMistake("Your call didn't end with your callsign.", severe);
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

	public assertCallStartsWithTargetCallsign(severe: boolean): boolean {
		if (!this.callStartsWithConsecutiveWords(this.getTargetCallsignWords())) {
			this.feedback.pushMistake("Your call didn't start with the callsign of the target.", severe);
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
		return this.getUserCallsignPhoneticsWithPrefix();
	}

	/* Returns the callsign of the user as they would state it in a radio call.
	Given that abbreviated callsigns are optional once established both 
	full and abbreviated versions returned if abbreviation established. */
	private getValidUserCallsigns(): string[] {
		const callsigns = [
			trimSpaces(
				this.prefix + ' ' + addSpacesBetweenCharacters(removePunctuation(this.userCallsign))
			).toLowerCase(), // Student G O F L Y
			this.getUserCallsignPhoneticsWithPrefix() // Student Golf Oscar Foxtrot Lima Yankee
		];

		if (this.userCallsignModified) {
			callsigns.push(this.getTargetAllocatedCallsign());
			callsigns.push(
				this.getPrefix() +
					' ' +
					trimSpaces(
						addSpacesBetweenCharacters(
							removePunctuation(
								getAbbreviatedCallsign(this.seed, this.getAircraftType(), this.userCallsign)
							)
						)
					)
			);
		}

		return callsigns;
	}

	public getStartAirportMETORSample(): METORDataSample {
		return this.getStartAirport().getMETORSample(this.seed);
	}

	public getEndAirportMETORSample(): METORDataSample {
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

	public getStartAirportStartingPoint(): string {
		return 'hangars';
	}

	public getTakeoffRunwayTaxiwayHoldingPoint(): string {
		return 'alpha';
	}

	public assertCallContainsTakeOffRunwayName(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getTakeoffRunway().designator])) {
			this.feedback.pushMistake(
				"Your call didn't contain the name of the runway you are taking off from.",
				severe
			);
			return false;
		}
		return true;
	}

	public assertCallContainsAircraftType(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getAircraftType()])) {
			this.feedback.pushMistake(
				"Your call didn't contain the type of aircraft you are flying: " + this.getAircraftType(),
				severe
			);
			return false;
		}
		return true;
	}

	public assertCallContainsScenarioStartPoint(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getStartAirportStartingPoint()])) {
			this.feedback.pushMistake(
				"Your call didn't contain the location you started your engine at.",
				severe
			);

			return false;
		}
		return true;
	}

	public assertCallContainsStartAirportName(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getStartAirport().getShortName()])) {
			this.feedback.pushMistake("Your call didn't contain the name of your start airport.", severe);
			return false;
		}
		return true;
	}

	public assertCallContainsEndAirportName(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getEndAirport().getShortName()])) {
			this.feedback.pushMistake(
				"Your call didn't contain the name of the ending aerodrome.",
				severe
			);
			return false;
		}
		return true;
	}

	public getSquarkCode(): number {
		return 2434 + (this.seed % 5) - 2;
	}

	public assertCallContainsSqwarkCode(severe: boolean): boolean {
		if (!this.callContainsWord(this.currentTransponderFrequency.toString())) {
			this.feedback.pushMistake("Your call didn't contain the squawk code.", severe);
			return false;
		}
		return true;
	}

	public assertCallContainsWilco(severe: boolean): boolean {
		if (!this.callContainsWord('wilco')) {
			this.feedback.pushMistake('Your call didn\'t contain "wilco" or "will comply".', severe);
			return false;
		}
		return true;
	}

	public assertCallContainsRoger(severe: boolean): boolean {
		if (!this.callContainsWord('roger')) {
			this.feedback.pushMistake('Your call didn\'t contain "roger" (message received).', severe);
			return false;
		}
		return true;
	}

	public assertCallContainsAltitude(severe: boolean): boolean {
		if (
			!this.callContainsWord('altitude') &&
			!this.callContainsWord(this.getCurrentScenarioPoint().pose.altitude.toString())
		) {
			this.feedback.pushMistake("Your call didn't contain your altitude.", severe);
			return false;
		}
		return true;
	}

	public assertCallContainsTakeOffRunwayHoldingPoint(severe: boolean): boolean {
		if (!this.callContainsWord(this.getTakeoffRunwayTaxiwayHoldingPoint())) {
			this.feedback.pushMistake("Your call didn't contain your holding point.", severe);
			return false;
		}
		return true;
	}

	public assertCallContainsTakeoffPressure(severe: boolean): boolean {
		const pressureSample = this.getStartAirportMETORSample().getPressureString().split(' ');
		if (!this.callContainsWord(pressureSample[0])) {
			this.feedback.pushMistake("Your call didn't contain the air pressure.", severe);
			return false;
		} else if (pressureSample.length > 1 && !this.callContainsWord(pressureSample[1])) {
			this.feedback.pushMistake(
				'Your air pressure call didn\'t include "millibars" when the pressure was below 1000 millibars. \n' +
					'Numbers must have units when confusion is possible.',
				false
			);
			return true;
		}
		return true;
	}

	public assertCallContainsTakeoffTemperature(severe: boolean): boolean {
		let temperatureSample = this.getStartAirportMETORSample().getTemperatureString();
		let sign = '';

		if (temperatureSample[0] == '-' || temperatureSample[0] == '+') {
			temperatureSample = temperatureSample.substring(1);
			sign = temperatureSample[0];
		}

		if (!this.callContainsWord(temperatureSample)) {
			this.feedback.pushMistake("Your call didn't contain the temperature.", severe);
			return false;
		} else if (!this.callContainsWord(sign + temperatureSample)) {
			this.feedback.pushMistake(
				"Your temperature readback didn't include the sign " +
					sign +
					'. \n' +
					'Temperatures must have a sign when confusion is possible.',
				false
			);

			return true;
		}
		return true;
	}

	public assertCallContainsTakeoffDewpoint(severe: boolean): boolean {
		let dewpointSample = this.getStartAirportMETORSample().getDewpointString();
		let sign = '';

		if (dewpointSample[0] == '-' || dewpointSample[0] == '+') {
			dewpointSample = dewpointSample.substring(1);
			sign = dewpointSample[0];
		}

		if (!this.callContainsWord(dewpointSample)) {
			this.feedback.pushMistake("Your call didn't contain the dewpoint.", severe);
			return false;
		} else if (!this.callContainsWord(sign + dewpointSample)) {
			this.feedback.pushMistake(
				"Your dewpoint readback didn't include the sign " +
					sign +
					'. \n' +
					'Dewpoints must have a sign when confusion is possible.',
				false
			);

			return true;
		}
		return true;
	}

	public assertCallContainsTakeoffWindSpeed(severe: boolean): boolean {
		// Wind speed followed by 'knots'
		const windSpeedSample = this.getStartAirportMETORSample().getWindSpeedString().split(' ');
		if (!this.callContainsWord(windSpeedSample[0])) {
			this.feedback.pushMistake("Your call didn't contain the wind speed.", severe);
			return false;
		} else if (!this.callContainsWord(windSpeedSample[1])) {
			this.feedback.pushMistake("Your call didn't contain the wind speed units.", false);
			return true;
		}
		return true;
	}

	public assertCallContainsTakeoffWindDirection(severe: boolean): boolean {
		const windDirectionSample = this.getStartAirportMETORSample()
			.getWindDirectionString()
			.split(' ');
		if (!this.callContainsConsecutiveWords(windDirectionSample)) {
			this.feedback.pushMistake("Your call didn't contain the wind direction.", severe);
			return false;
		}
		return true;
	}

	// Doesnt check for the specific flight rules of the scenario - but at time of writing scenario only supports VFR
	public assertCallContainsFlightRules(severe: boolean): boolean {
		if (!this.callContainsWord('VFR') || !this.callContainsWord('visual')) {
			this.feedback.pushMistake("Your call didn't contain your flight rules (VFR).", severe);
			return false;
		}
		return true;
	}

	public getTakeoffTurnoutHeading(): number {
		const headingToFirstWaypoint = turf.distance(
			this.scenario.waypoints[0].getCoords(),
			this.scenario.waypoints[1].getCoords()
		);

		// If turnout heading doesnt exist then most likely something has gone very wrong as
		// there should have already been an error, issue will be with getHeadingTo method
		if (headingToFirstWaypoint == undefined)
			throw new Error('No heading in getTakeoffTurnoutHeading.');

		return headingToFirstWaypoint;
	}

	public assertCallContainsTakeoffTurnoutHeading(severe: boolean): boolean {
		if (!this.callContainsWord(this.getTakeoffTurnoutHeading().toString())) {
			this.feedback.pushMistake("Your call didn't contain your takeoff turnout heading.", severe);
			return false;
		}
		return true;
	}

	public getTakeoffTransitionAltitude(): number {
		return this.getStartAirport().getTakeoffTransitionAltitude();
	}

	public assertCallContainsTransitionAltitude(severe: boolean): boolean {
		if (!this.callContainsWord(this.getTakeoffTransitionAltitude().toString())) {
			this.feedback.pushMistake(
				"Your call didn't contain the takeoff transition altitude.",
				severe
			);
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
		return this.getStartAirportMETORSample().getWindString();
	}

	public getCurrentAltitude(): number {
		return this.getCurrentScenarioPoint().pose.altitude;
	}

	public getCurrentAltitudeString(): string {
		return this.getCurrentAltitude() + ' feet';
	}

	public assertCallContainsCurrentAltitude(severe: boolean): boolean {
		if (!this.callContainsWord(this.getCurrentAltitude().toString())) {
			this.feedback.pushMistake("Your call didn't contain your current altitude.", severe);
			return false;
		}
		return true;
	}

	public assertCallContainsLandingRunwayName(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getLandingRunway().designator])) {
			this.feedback.pushMistake(
				"Your call didn't contain the name of the runway you are landing on.",
				severe
			);
			return false;
		}
		return true;
	}

	public assertCallContainsLandingPressure(severe: boolean): boolean {
		const pressureSample = this.getEndAirportMETORSample().getPressureString().split(' ');
		if (!this.callContainsWord(pressureSample[0])) {
			this.feedback.pushMistake("Your call didn't contain the air pressure.", severe);
			return false;
		} else if (pressureSample.length > 1 && !this.callContainsWord(pressureSample[1])) {
			this.feedback.pushMistake(
				'Your air pressure call didn\'t include "millibars" when the pressure was below 1000 millibars. \n' +
					'Numbers must have units when confusion is possible.',
				false
			);
			return true;
		}
		return true;
	}

	public getPreviousWaypoint(): Waypoint {
		return this.scenario.waypoints[this.getCurrentScenarioPoint().nextWaypointIndex];
	}

	public getPreviousWaypointName(): string {
		return this.getPreviousWaypoint().name;
	}

	public assertCallContainsPreviousWaypointName(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getPreviousWaypointName()])) {
			this.feedback.pushMistake(
				"Your call didn't contain the name of the previous waypoint.",
				severe
			);
			return false;
		}
		return true;
	}

	public getDistanceToPreviousWaypointInMeters(): number {
		return turf.distance(
			this.getPreviousWaypoint().location,
			this.getCurrentScenarioPoint().pose.position
		);
	}

	public getDistanceToPreviousWaypointInNauticalMiles(): number {
		return this.getDistanceToPreviousWaypointInMeters() / 1852;
	}

	public getPositionRelativeToLastWaypoint(): string {
		const heading = turf.bearing(
			this.getPreviousWaypoint().location,
			this.getCurrentScenarioPoint().pose.position
		);
		const compassDirection = getCompassDirectionFromHeading(heading);
		const distance = this.getDistanceToPreviousWaypointInNauticalMiles();
		return Math.ceil(distance) + ' miles ' + compassDirection;
	}

	public assertCallContainsPositionRelativeToLastWaypoint(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords(this.getPositionRelativeToLastWaypoint().split(' '))) {
			this.feedback.pushMistake(
				"Your call didn't contain your position relative to the previous waypoint.",
				severe
			);
			return false;
		}
		return true;
	}

	public getLandingParkingSpot(): string {
		throw new Error('Unimplemented function');
	}

	public assertCallContainsLandingParkingSpot(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getLandingParkingSpot()])) {
			this.feedback.pushMistake("Your call didn't contain your parking spot.", severe);
			return false;
		}
		return true;
	}

	public getOverheadJoinAltitude(): number {
		return 2000;
	}

	public assertCallContainsOverheadJoinAltitude(severe: boolean): boolean {
		if (!this.callContainsWord(this.getOverheadJoinAltitude().toString())) {
			this.feedback.pushMistake("Your call didn't contain the overhead join altitude.", severe);
			return false;
		}
		return true;
	}

	private getClosestVRP(): Waypoint {
		throw new Error('Unimplemented function');
	}

	public getClosestVRPName(): string {
		throw new Error('Unimplemented function');
	}

	public assertCallContainsClosestVRPName(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getClosestVRPName()])) {
			this.feedback.pushMistake("Your call didn't contain the closest VRP.", severe);
			return false;
		}
		return true;
	}

	public getNextWaypoint(): Waypoint {
		return this.scenario.waypoints[this.getCurrentScenarioPoint().nextWaypointIndex];
	}

	public getNextWaypointName(): string {
		return this.getNextWaypoint().name;
	}

	public getNextWaypointDistance(): number {
		return turf.distance(
			this.getNextWaypoint().location,
			this.getCurrentScenarioPoint().pose.position
		);
	}

	public getNextWaypointDistanceNearestMile(): number {
		// round to nearest mile
		return Math.round(this.getNextWaypointDistance() / 1609.344);
	}

	public assertCallContainsNextWaypointName(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getNextWaypointName()])) {
			this.feedback.pushMistake("Your call didn't contain the name of the next waypoint.", severe);
			return false;
		}
		return true;
	}

	public assertCallContainsNextWaypointDistance(severe: boolean): boolean {
		if (!this.callContainsWord(this.getNextWaypointDistanceNearestMile().toString())) {
			this.feedback.pushMistake(
				"Your call didn't contain the distance to the next waypoint.",
				severe
			);
			return false;
		}
		return true;
	}

	public getCurrentTime(): number {
		return this.getCurrentScenarioPoint().timeAtPoint;
	}

	public assertCallContainsCurrentTime(severe: boolean): boolean {
		if (!this.callContainsWord(this.getCurrentTime().toString())) {
			this.feedback.pushMistake("Your call didn't contain the current time.", severe);
			return false;
		}
		return true;
	}

	public getNextWaypointArrivalTime(): number {
		throw this.scenario.scenarioPoints.find(
			(point) => point.nextWaypointIndex == this.getCurrentScenarioPoint().nextWaypointIndex
		)?.timeAtPoint;
	}

	public assertCallContainsNextWaypointArrivalTime(severe: boolean): boolean {
		if (!this.callContainsWord(convertMinutesToTimeString(this.getNextWaypointArrivalTime()))) {
			this.feedback.pushMistake(
				"Your call didn't contain the arrival time at the next waypoint.",
				severe
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

	public assertCallContainsCurrentATISLetter(severe: boolean): boolean {
		if (!this.callContainsWord(this.getCurrentATISLetter())) {
			this.feedback.pushMistake("Your call didn't contain the current ATIS letter.", severe);
			return false;
		}
		return true;
	}

	public getCurrentFixName(): string {
		throw new Error('Unimplemented method');
	}

	public assertCallContainsCurrentFixName(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getCurrentFixName()])) {
			this.feedback.pushMistake("Your call didn't contain the current fix name.", severe);
			return false;
		}
		return true;
	}

	public getNextFixName(): string {
		throw new Error('Unimplemented method');
	}

	public assertCallContainsNextFixName(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords([this.getNextFixName()])) {
			this.feedback.pushMistake("Your call didn't contain the next fix name.", severe);
			return false;
		}
		return true;
	}

	public getNextFrequency(): string | undefined {
		return this.scenario.scenarioPoints.find(
			(x) => x.updateData.currentTargetFrequency != this.currentTargetFrequency
		)?.updateData.currentTargetFrequency;
	}

	public assertCallContainsNextFrequency(severe: boolean): boolean {
		if (this.getNextFrequency() == undefined) {
			throw new Error('No next frequency found.');
		}

		if (!this.callContainsWord(this.getNextFrequency() as string)) {
			this.feedback.pushMistake("Your call didn't contain the next frequency.", severe);
			return false;
		}
		return true;
	}

	public getNextFrequencyName(): string | undefined {
		return this.scenario.scenarioPoints.find(
			(x) => x.updateData.currentTargetFrequency != this.currentTargetFrequency
		)?.updateData.currentTarget;
	}

	public assertCallContainsNextFrequencyName(severe: boolean): boolean {
		if (this.getNextFrequencyName() == undefined) {
			throw new Error('No next frequency found.');
		}

		if (!this.callContainsConsecutiveWords([this.getNextFrequencyName() as string])) {
			this.feedback.pushMistake("Your call didn't contain the next frequency name.", severe);
			return false;
		}
		return true;
	}

	public getPositionRelativeToNearestFix(): string {
		throw new Error('Unimplemented method');
	}

	public assertCallContainsPositionRelativeToNearestFix(severe: boolean): boolean {
		if (!this.callContainsConsecutiveWords(this.getPositionRelativeToNearestFix().split(' '))) {
			this.feedback.pushMistake(
				"Your call didn't contain your position relative to the nearest fix.",
				severe
			);
			return false;
		}
		return true;
	}

	public getCurrentAltimeterSetting(): string {
		throw new Error('Unimplemented method');
	}

	public assertCallContainsCurrentAltimeterSetting(severe: boolean): boolean {
		if (!this.callContainsWord(this.getCurrentAltimeterSetting())) {
			this.feedback.pushMistake("Your call didn't contain the current altimeter setting.", severe);
			return false;
		}
		return true;
	}

	// Needs implementing properly
	public getMATZPenetrationHeight(): string {
		return '1500 feet';
	}

	public assertCallContainsMATZPenetrationHeight(severe: boolean): boolean {
		if (!this.callContainsWords(this.getMATZPenetrationHeight().split(' '))) {
			this.feedback.pushMistake(
				"Your call didn't contain the correct height for transiting the MATZ.",
				severe
			);
			return false;
		}
		return true;
	}
}
