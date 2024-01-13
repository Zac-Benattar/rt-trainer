import { type CallParsingData, Mistake, type Seed } from './ServerClientTypes';
import Route from './Route';
import { getAbbreviatedCallsign } from './utils';
import type { Aerodrome, FlightRules, METORDataSample, Runway } from './SimulatorTypes';
import type { AirbornePoint, RoutePoint } from './RouteStates';

export function parseRadioCheck(
	seed: Seed,
	radioCheck: string,
	parsingData: CallParsingData
): Mistake | string {
	const expectedRadioCall: string = `${parsingData.currentTarget.callsign}, ${parsingData.callsign}, radio check ${parsingData.currentRadioFrequency}`;
	const messageWords: string[] = radioCheck.split(' ');
	let radioFreqIndex: number = -1;

	// Check if the radio frequency is included in the message
	for (let i = 0; i < messageWords.length; i++) {
		if (messageWords[i].includes('.')) {
			radioFreqIndex = i;
		}
	}

	// If radio frequency not found return an error
	if (radioFreqIndex == -1) {
		return new Mistake(expectedRadioCall, radioCheck, 'Frequency missing');
	}

	// Convert frequency string to float and check it is a valid frequency and equal to the correct frequency
	const radioFreqStated: number = +messageWords[radioFreqIndex];
	if (isNaN(radioFreqStated)) {
		return new Mistake(expectedRadioCall, radioCheck, 'Frequency not recognised');
	} else if (radioFreqStated != parsingData.currentRadioFrequency) {
		return new Mistake(expectedRadioCall, radioCheck, 'Frequency incorrect');
	}

	// Split the callsign into its words and do something else not sure what
	const callsignExpected: string = parsingData.currentTarget.callsign.toLowerCase();
	const callsignWords: string[] = callsignExpected.split(' ');
	for (let i = 0; i < callsignWords.length; i++) {
		if (messageWords[i] != callsignWords[i]) {
			return new Mistake(expectedRadioCall, radioCheck, 'Callsign not recognised');
		}
	}

	// Not sure what this does
	if (messageWords[callsignWords.length] != parsingData.callsign.toLowerCase()) {
		return new Mistake(
			expectedRadioCall,
			radioCheck,
			`Callsign not recognised: ${messageWords.slice(callsignWords.length).join(' ')}`
		);
	}

	// Check the message contains "radio check"
	if (messageWords[radioFreqIndex - 2] != 'radio' || messageWords[radioFreqIndex - 1] != 'check') {
		return new Mistake(expectedRadioCall, radioCheck, "Expected 'radio check' in message");
	}

	// Trailing 0s lost when frequency string parsed to float, hence comparison of floats rather than strings
	if (radioFreqStated != parsingData.currentRadioFrequency) {
		return new Mistake(
			expectedRadioCall,
			radioCheck,
			`Frequency incorrect: ${radioFreqStated} \n Expected: ${parsingData.currentRadioFrequency}`
		);
	}

	// Return ATC response
	return `${parsingData.callsign}, ${parsingData.currentTarget.callsign}, reading you 5`;
}

export function parseDepartureInformationRequest(
	seed: Seed,
	departureInformationRequest: string,
	parsingData: CallParsingData
): Mistake | string {
	const expectedRadiocall = `${parsingData.callsign.toLowerCase()} request departure information`;

	const messageWords: string[] = departureInformationRequest.split(' ');
	const callsignExpected: string = parsingData.callsign.toLowerCase();
	const callsignWords: string[] = callsignExpected.split(' ');
	for (let i = 0; i < callsignWords.length; i++) {
		if (messageWords[i] != callsignWords[i]) {
			return new Mistake(
				expectedRadiocall,
				departureInformationRequest,
				'Remeber to include your whole callsign in your message'
			);
		}
	}

	const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);

	const metorSample: METORDataSample = Route.getMETORSample(seed, startAerodrome.metorData);
	const runwayIndex: number = seed.scenarioSeed % startAerodrome.runways.length;
	const runway: Runway = startAerodrome.runways[runwayIndex];

	if (!departureInformationRequest.search('request departure information')) {
		return new Mistake(
			expectedRadiocall,
			departureInformationRequest,
			'Make sure to include the departure information request in your message.'
		);
	}

	// Figure out airport runway, come up with some wind, pressure, temp and dewpoint numbers
	// Return ATC response
	return `${getAbbreviatedCallsign(
		seed.scenarioSeed,
		parsingData.aircraftType,
		parsingData.targetAllocatedCallsign
	)}, runway ${runway.name}, wind ${metorSample.windDirection} degrees ${
		metorSample.windSpeed
	} knots, QNH ${metorSample.pressure}, temperature ${metorSample.temperature} dewpoint ${
		metorSample.dewpoint
	}`;
}

export function parseDepartureInformationReadback(
	seed: Seed,
	departureInformationReadback: string,
	parsingData: CallParsingData
): Mistake | string {
	const startAerodrome = Route.getStartAerodrome(seed);

	const metorSample: METORDataSample = Route.getMETORSample(seed, startAerodrome.metorData);
	const runwayindex: number = seed.scenarioSeed % startAerodrome.runways.length;
	const runway: Runway = startAerodrome.runways[runwayindex];

	const runwaystring: string = `runway ${runway.name}`;
	const pressurestring: string = `qnh ${metorSample.pressure}`;

	const expectedradiocall: string = `${parsingData.callsign.toLowerCase()} runway ${runway.name.toLowerCase()} qnh ${
		metorSample.pressure
	} ${parsingData.callsign.toLowerCase()}`;

	const messagewords: string[] = departureInformationReadback.split(' ');

	if (
		!departureInformationReadback.search(runwaystring) ||
		!departureInformationReadback.search(pressurestring) ||
		messagewords[messagewords.length - 1] != parsingData.targetAllocatedCallsign.toLowerCase()
	) {
		return new Mistake(
			expectedradiocall,
			departureInformationReadback,
			'Make sure to include the runway and air pressure in your readback.'
		);
	}

	// ATC does not respond to this message
	return '';
}

export function parseTaxiRequest(
	seed: Seed,
	taxiRequest: string,
	parsingData: CallParsingData
): Mistake | string {
	const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);
	const endAerodrome: Aerodrome = Route.getEndAerodrome(seed);
	const metorSample: METORDataSample = Route.getMETORSample(seed, startAerodrome.metorData);

	const runwayindex: number = seed.scenarioSeed % startAerodrome.runways.length;
	const runway: Runway = startAerodrome.runways[runwayindex];
	const expectedradiocall: string = `${parsingData.targetAllocatedCallsign.toLowerCase()} ${parsingData.aircraftType.toLowerCase()} at ${startAerodrome.startPoint.toLowerCase()} request taxi VFR to ${endAerodrome.name.toLowerCase()}`;

	const messagewords: string[] = taxiRequest.split(' ');

	if (
		messagewords[0] != parsingData.targetAllocatedCallsign.toLowerCase() ||
		messagewords[1] != parsingData.aircraftType.toLowerCase() ||
		messagewords.find((x) => x == startAerodrome.startPoint.toLowerCase()) ||
		messagewords.find((x) => x == endAerodrome.name.toLowerCase())
	) {
		return new Mistake(
			expectedradiocall,
			taxiRequest,
			'Make sure to include the aircraft type, start point and destination in your request.'
		);
	}

	// Return ATC response
	return `${parsingData.targetAllocatedCallsign}, taxi to holding point ${runway.holdingPoints[0].name}, runway ${runway.name}, QNH ${metorSample.pressure}`;
}

export function parseTaxiReadback(
	seed: Seed,
	taxiRequest: string,
	parsingData: CallParsingData
): Mistake | string {
	const messageWords: string[] = taxiRequest.split(' ');

	const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);

	const metorsample: METORDataSample = Route.getMETORSample(seed, startAerodrome.metorData);

	const runwayIndex: number = seed.scenarioSeed % startAerodrome.runways.length;
	const runway: Runway = startAerodrome.runways[runwayIndex];

	const expectedradiocall: string = `${parsingData.targetAllocatedCallsign.toLowerCase()} taxi holding point ${runway.holdingPoints[0].name.toLowerCase()} runway ${runway.name.toLowerCase()} qnh ${
		metorsample.pressure
	} ${parsingData.targetAllocatedCallsign.toLowerCase()}`;

	if (
		!(taxiRequest.search('taxi holding point') || taxiRequest.search('taxi to holding point')) ||
		!messageWords.find((x) => x == runway.holdingPoints[0].name.toLowerCase()) ||
		messageWords[messageWords.length - 1] != parsingData.targetAllocatedCallsign.toLowerCase()
	) {
		return new Mistake(
			expectedradiocall,
			taxiRequest,
			'Make sure to include the holding point and runway in your readback.'
		);
	}

	// ATC does not respond to this message
	return '';
}

/* Parse initial contact with ATC unit.
Should consist of ATC callsign and aircraft callsign */
export function parseNewAirspaceInitialContact(
	scenarioSeed: number,
	weatherSeed: number,
	radioCall: string,
	flightRules: FlightRules,
	altitude: number,
	heading: number,
	speed: number,
	currentPoint: RoutePoint,
	parsingData: CallParsingData
): Mistake | string {
	const expectedradiocall: string = `${parsingData.currentTarget.callsign.toLowerCase()}, ${parsingData.callsign.toLowerCase()}`;

	if (!radioCall.search(parsingData.currentTarget.callsign.toLowerCase())) {
		return new Mistake(
			expectedradiocall,
			radioCall,
			'Remember to include the target callsign at the start of your initial message.'
		);
	}

	if (!radioCall.search(parsingData.callsign.toLowerCase())) {
		return new Mistake(
			expectedradiocall,
			radioCall,
			'Remember to include your own callsign in your initial message.'
		);
	}

	const messagewords: string[] = radioCall.split(' ');
	const callsignexpected: string = parsingData.callsign.toLowerCase();
	const callsignwords: string[] = callsignexpected.split(' ');
	const targetcallsignexpected: string = parsingData.currentTarget.callsign.toLowerCase();
	const targetcallsignwords: string[] = targetcallsignexpected.split(' ');

	if (messagewords.length > callsignwords.length + targetcallsignwords.length) {
		return new Mistake(expectedradiocall, radioCall, 'Keep your calls brief.');
	}

	// Return ATC response
	return `${parsingData.callsign}, ${parsingData.currentTarget.callsign}.`;
}

/* Parse response to ATC unit acknowledging initial contact
call. Should consist of aircraft callsign and type, flight
rules, departure and destination aerodromes, position,
flight level/altitude including passing/cleared level if (not
in level flight, and additional details such as next waypoint(s)
accompanied with the planned times to reach them */
export function parseNewAirspaceGiveFlightInformationToATC(
	seed: Seed,
	radioCall: string,
	flightRules: FlightRules,
	altitude: number,
	heading: number,
	speed: number,
	currentPoint: AirbornePoint,
	parsingData: CallParsingData
): Mistake | string {
	const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);
	const endAerodrome: Aerodrome = Route.getEndAerodrome(seed);

	const nearestwaypoint: string = 'Test Waypoint';
	const distancefromnearestwaypoint: number = 0.0;
	const directiontonearestwaypoint: string = 'Direction';

	const nextwaypoint: string = 'Next Waypoint';

	const expectedRadioCall: string = `${parsingData.prefix.toLowerCase()} ${parsingData.callsign.toLowerCase()}, ${parsingData.aircraftType.toLowerCase()} ${flightRules.toString()} from ${startAerodrome.name.toLowerCase()} to ${endAerodrome.name.toLowerCase()}, ${distancefromnearestwaypoint} miles ${directiontonearestwaypoint} of ${nearestwaypoint}, ${altitude}, ${nextwaypoint}`;

	if (!radioCall.search(parsingData.currentTarget.callsign.toLowerCase())) {
		return new Mistake(
			expectedRadioCall,
			radioCall,
			'Remember to include the target callsign at the start of your initial message.'
		);
	}

	if (!radioCall.search(parsingData.callsign.toLowerCase())) {
		return new Mistake(
			expectedRadioCall,
			radioCall,
			'Remember to include your own callsign in your initial message.'
		);
	}

	// TODO
	return '';
}

/* Parse response to ATC unit requesting squark.
Should consist of aircraft callsign and squark code */
export function parseMewAirspaceSquark(
	seed: Seed,
	radioCall: string,
	sqwarkFrequency: number,
	flightRules: FlightRules,
	altitude: number,
	heading: number,
	speed: number,
	currentPoint: RoutePoint,
	parsingData: CallParsingData
): Mistake | string {
	const expectedRadioCall: string = `Squawk ${sqwarkFrequency}, ${parsingData.prefix.toLowerCase()} ${parsingData.targetAllocatedCallsign.toLowerCase()}`;

	if (!radioCall.search(sqwarkFrequency.toString())) {
		return new Mistake(
			expectedRadioCall,
			radioCall,
			'Remember to include the sqwark code at the start of your initial message.'
		);
	}

	if (!radioCall.search(parsingData.callsign.toLowerCase())) {
		return new Mistake(
			expectedRadioCall,
			radioCall,
			'Remember to include your own callsign in your initial message.'
		);
	}

	const nearestWaypoint: string = 'Test Waypoint';
	const distanceFromNearestWaypoint: number = 0.0;
	const directionToNearestWaypoint: string = 'Direction';
	const nextWayPoint: string = 'Next Waypoint';

	// Return ATC response
	return `${parsingData.prefix} ${parsingData.targetAllocatedCallsign}, identified ${nearestWaypoint} miles ${distanceFromNearestWaypoint} of ${directionToNearestWaypoint}. Next report at ${nextWayPoint}`;
}

/* Parse Wilco in response to an instruction from ATC unit.
Should consist of Wilco followed by aircraft callsign */
export function parsewilco(
	seed: Seed,
	radioCall: string,
	flightRules: FlightRules,
	altitude: number,
	heading: number,
	speed: number,
	currentPoint: RoutePoint,
	parsingData: CallParsingData
): Mistake | string {
	const expectedRadioCall: string = `Wilco, ${parsingData.prefix.toLowerCase()} ${parsingData.targetAllocatedCallsign.toLowerCase()}`;

	if (!radioCall.search('wilco') || !radioCall.search('will comply')) {
		return new Mistake(
			expectedRadioCall,
			radioCall,
			'Remember to include wilco at the start of your initial message.'
		);
	}

	if (!radioCall.search(parsingData.callsign.toLowerCase())) {
		return new Mistake(
			expectedRadioCall,
			radioCall,
			'Remember to include your own callsign in your initial message.'
		);
	}

	// ATC does not respond to this message
	return '';
}

/* Parse VFR position report.
Should contain the aircraft callsign, location relative to a waypoint,
and the flight level/altitude including passing level and cleared level
if (not in level flight. */
/* Parse Wilco in response to an instruction from ATC unit.
Should consist of Wilco followed by aircraft callsign */
export function parsevfrpositionreport(
	seed: Seed,
	radioCall: string,
	flightRules: FlightRules,
	altitude: number,
	heading: number,
	speed: number,
	currentPoint: AirbornePoint,
	currentState: CallParsingData
): Mistake | string {
	// May need more details to be accurate to specific situation
	const expectedRadioCall: string = `
        "${currentState.prefix.toLowerCase()} ${currentState.targetAllocatedCallsign.toLowerCase()}, overhead ${currentPoint.waypoint.name.toLowerCase()}, ${altitude} feet`;

	if (!radioCall.search(currentState.callsign.toLowerCase())) {
		return new Mistake(
			expectedRadioCall,
			radioCall,
			'Remember to include your own callsign at the start of your radio call.'
		);
	}

	if (!radioCall.search(currentPoint.waypoint.name.toLowerCase())) {
		return new Mistake(
			expectedRadioCall,
			radioCall,
			'Remember to include your current location in your radio call.'
		);
	}

	if (!radioCall.search(altitude.toString().toLowerCase())) {
		return new Mistake(
			expectedRadioCall,
			radioCall,
			'Remember to include your altitude in your radio call.'
		);
	}

	// TODO
	return '';
}
