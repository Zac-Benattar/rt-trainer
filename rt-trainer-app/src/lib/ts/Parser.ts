import { ServerResponse, type Mistake } from './ServerClientTypes';
import type { AirbornePoint, ParkedPoint, HoldingPointPoint } from './RouteStates';
import type CallParsingContext from './CallParsingContext';
import { ParkedStage } from './FlightStages';
import type { METORDataSample } from './Aerodrome';

export default class Parser {
	public static parseCall(parseContext: CallParsingContext): ServerResponse {
		switch (parseContext.getRoutePoint().stage) {
			case ParkedStage.RadioCheck:
				return this.parseRadioCheck(parseContext);
			case ParkedStage.DepartureInformationRequest:
				return this.parseDepartureInformationRequest(parseContext);
			case ParkedStage.ReadbackDepartureInformation:
				return this.parseDepartureInformationReadback(parseContext);
			case ParkedStage.TaxiRequest:
				return this.parseTaxiRequest(parseContext);
			case ParkedStage.TaxiClearanceReadback:
				return this.parseTaxiReadback(parseContext);
			case ParkedStage.RequestTaxiInformation:
				return this.parseTaxiInformationRequest(parseContext);
			case ParkedStage.AnnounceTaxiing:
				return this.parseAnnounceTaxiing(parseContext);
			default:
				throw new Error('Unimplemented route point type');
		}
	}

	private static checkForMistakes(potentialMistakes: (Mistake | undefined)[]): Mistake[] {
		const mistakes: Mistake[] = [];
		potentialMistakes.forEach((mistake) => {
			if (mistake != undefined) mistakes.push(mistake);
		});
		return mistakes;
	}

	// Example: Wellesbourne Information, Student Golf Oscar Foxtrot Lima Yankee, radio check 180.030
	public static parseRadioCheck(parseContext: CallParsingContext): ServerResponse {
		const expectedRadioCall: string = `${parseContext.getCurrentTarget()}, ${parseContext.getUserCallsignPhonetics()}, radio check ${parseContext.getCurrentRadioFrequency()}`;

		const mistakes: Mistake[] = Parser.checkForMistakes([
			parseContext.assertCallContainsCurrentRadioFrequency(),
			parseContext.assertCallStartsWithTargetCallsign(),
			parseContext.assertCallContainsUserCallsign(),
			parseContext.assertCallContainsConsecutiveWords(['radio', 'check'])
		]);

		// Return ATC response
		const atcResponse = `${parseContext
			.getUserCallsignPhonetics()
			.toUpperCase()}, ${parseContext.getCurrentTarget()}, reading you 5`;

		return new ServerResponse(mistakes, atcResponse, expectedRadioCall);
	}

	// Example: Student Golf Oscar Foxtrot Lima Yankee, request departure information
	public static parseDepartureInformationRequest(parseContext: CallParsingContext): ServerResponse {
		const expectedRadiocall = `${parseContext
			.getTargetAllocatedCallsign()
			.toLowerCase()} request departure information`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallStartsWithUserCallsign(),
			parseContext.assertCallContainsConsecutiveWords(['request', 'departure', 'information'])
		]);

		// Return ATC response
		const metorSample: METORDataSample = parseContext.getStartAerodromeMETORSample();
		const atcResponse = `${parseContext.getTargetAllocatedCallsign().toUpperCase()}, runway ${
			parseContext.getStartAerodromeTakeoffRunway().name
		}, surface wind ${metorSample.getWindDirectionString()} ${metorSample.getWindSpeedString()}, QNH ${metorSample.getPressureString()}, temperature ${metorSample.getTemperatureString()} dewpoint ${metorSample.getDewpointString()}`;

		return new ServerResponse(mistakes, atcResponse, expectedRadiocall);
	}

	// Example: Runway 24, QNH 1013, Student Golf Lima Yankee
	public static parseDepartureInformationReadback(
		parseContext: CallParsingContext
	): ServerResponse {
		const runwayName: string = parseContext.getStartAerodromeTakeoffRunway().name;
		const expectedRadioCall: string = `${parseContext.getTargetAllocatedCallsign()} runway ${runwayName} qnh ${parseContext
			.getStartAerodromeMETORSample()
			.getPressureString()} ${parseContext.getTargetAllocatedCallsign()}`;

		const mistakes: Mistake[] = Parser.checkForMistakes([
			parseContext.assertCallStartsWithUserCallsign(),
			parseContext.assertCallContainsTakeOffRunwayName(),
			parseContext.assertCallContainsStartAerodromePressure(),
			parseContext.assertCallEndsWithUserCallsign()
		]);

		// ATC does not respond to this message
		return new ServerResponse(mistakes, '', expectedRadioCall);
	}

	// Example: Student Golf Lima Yankee, by the south side hangers, request taxi for vfr flight to birmingham
	public static parseTaxiRequest(parseContext: CallParsingContext): ServerResponse {
		const expectedradiocall: string = `${parseContext.getTargetAllocatedCallsign()} ${parseContext.getAircraftType()} by the ${
			parseContext.getStartAerodromeStartingPoint().name
		} request taxi VFR to ${parseContext.getEndAerodrome().getShortName()}`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallStartsWithTargetCallsign(),
			parseContext.assertCallContainsAircraftType(),
			parseContext.assertCallContainsScenarioStartPoint(),
			parseContext.assertCallContainsStartAerodromeName(),
			parseContext.assertCallContainsEndAerodromeName(),
			parseContext.assertCallContainsConsecutiveWords(['request', 'taxi'])
		]);

		// Return ATC response
		const atcResponse = `${parseContext
			.getTargetAllocatedCallsign()
			.toUpperCase()}, taxi to holding point ${
			parseContext.getTakeoffRunwayHoldingPoint().name
		} via taxiway charlie. Hold short of runway ${
			parseContext.getStartAerodromeTakeoffRunway().name
		}, QNH ${parseContext.getStartAerodromeMETORSample().getPressureString()}`;

		return new ServerResponse(mistakes, atcResponse, expectedradiocall);
	}

	// Example: Taxi holding point alpha via taxiway charlie. Hold short of runway 24, qnh 1013, Student Golf Lima Yankee
	public static parseTaxiReadback(parseContext: CallParsingContext): ServerResponse {
		const expectedradiocall: string = `${parseContext.getTargetAllocatedCallsign()} taxi holding point ${
			parseContext.getTakeoffRunwayHoldingPoint().name
		} runway ${parseContext.getStartAerodromeTakeoffRunway().name} qnh ${parseContext
			.getStartAerodromeMETORSample()
			.getPressureString()} ${parseContext.getTargetAllocatedCallsign()}`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallStartsWithTargetCallsign(),
			parseContext.assertCallContainsWord('taxi'),
			parseContext.assertCallContainsConsecutiveWords(['holding', 'point']),
			parseContext.assertCallContainsTakeOffRunwayName(),
			parseContext.assertCallEndsWithUserCallsign(),
			parseContext.assertCallContainsTakeOffRunwayHoldingPoint()
		]);

		// ATC does not respond to this message
		return new ServerResponse(mistakes, '', expectedradiocall);
	}

	public static parseTaxiInformationRequest(parseContext: CallParsingContext): ServerResponse {
		const expectedradiocall: string = `${parseContext.getTargetAllocatedCallsign()}, by the ${
			parseContext.getStartAerodromeStartingPoint().name
		}, request taxi information, VFR to ${parseContext.getEndAerodrome().getShortName()}`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallStartsWithUserCallsign(),
			parseContext.assertCallContainsConsecutiveWords(['request', 'taxi', 'information']),
			parseContext.assertCallContainsFlightRules(),
			parseContext.assertCallContainsScenarioStartPoint(),
			parseContext.assertCallContainsEndAerodromeName()
		]);

		// Return ATC response
		const atcResponse = `${parseContext.getTargetAllocatedCallsign().toUpperCase()}, runway ${
			parseContext.getStartAerodromeTakeoffRunway().name
		}, QNH ${parseContext.getStartAerodromeMETORSample().getPressureString()}`;

		return new ServerResponse(mistakes, atcResponse, expectedradiocall);
	}

	public static parseAnnounceTaxiing(parseContext: CallParsingContext): ServerResponse {
		const expectedradiocall: string = `${parseContext.getTargetAllocatedCallsign()}, taxiing to runway ${
			parseContext.getStartAerodromeTakeoffRunway().name
		}, QNH ${parseContext.getStartAerodromeMETORSample().getPressureString()}`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallStartsWithUserCallsign(),
			parseContext.assertCallContainsWord('taxiing'),
			parseContext.assertCallContainsTakeOffRunwayName(),
			parseContext.assertCallContainsStartAerodromePressure()
		]);

		// ATC does not respond to this message
		return new ServerResponse(mistakes, '', expectedradiocall);
	}

	/* Parse initial contact with new ATC unit.
	Example Student Golf Oscar Foxtrot Lima Yankee, Birmingham Radar */
	public static parseNewAirspaceInitialContact(
		currentPoint: ParkedPoint | HoldingPointPoint | AirbornePoint,
		parseContext: CallParsingContext
	): ServerResponse {
		const expectedradiocall: string = `${parseContext
			.getCurrentTarget()
			.toLowerCase()}, ${parseContext.getTargetAllocatedCallsign()}`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallStartsWithTargetCallsign(),
			parseContext.assertCallContainsUserCallsign()
		]);

		// Return ATC response
		const atcResponse = `${parseContext
			.getTargetAllocatedCallsign()
			.toUpperCase()}, ${parseContext.getCurrentTarget()}.`;

		return new ServerResponse(mistakes, atcResponse, expectedradiocall);
	}

	/* Parse response to ATC unit acknowledging initial contact
call. Should consist of aircraft callsign and type, flight
rules, departure and destination aerodromes, position,
flight level/altitude including passing/cleared level if (not
in level flight, and additional details such as next waypoint(s)
accompanied with the planned times to reach them */
	public static parseNewAirspaceGiveFlightInformationToATC(
		currentPoint: AirbornePoint,
		parseContext: CallParsingContext
	): ServerResponse {
		const nearestwaypoint: string = 'Test Waypoint';
		const distancefromnearestwaypoint: number = 0.0;
		const directiontonearestwaypoint: string = 'Direction';

		const nextwaypoint: string = 'Next Waypoint';

		const expectedRadioCall: string = `${parseContext.getTargetAllocatedCallsign()}, ${parseContext.getAircraftType()} ${currentPoint.flightRules.toString()} from ${parseContext
			.getStartAerodrome()
			.getShortName()} to ${parseContext
			.getEndAerodrome()
			.getShortName()}, ${distancefromnearestwaypoint} miles ${directiontonearestwaypoint} of ${nearestwaypoint}, ${
			currentPoint.pose.altitude
		}, ${nextwaypoint}`;

		// TODO
		return '';
	}

	/* Parse response to ATC unit requesting squark.
Should consist of aircraft callsign and squark code */
	public static parseNewAirspaceSquark(
		sqwarkFrequency: number,
		parseContext: CallParsingContext
	): ServerResponse {
		const expectedRadioCall: string = `Squawk ${sqwarkFrequency}, ${parseContext.getTargetAllocatedCallsign()}`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallContainsSqwarkCode(),
			parseContext.assertCallContainsUserCallsign()
		]);

		const nearestWaypoint: string = 'Test Waypoint';
		const distanceFromNearestWaypoint: number = 0.0;
		const directionToNearestWaypoint: string = 'Direction';
		const nextWayPoint: string = 'Next Waypoint';

		// Return ATC response
		const atcResponse = `${parseContext
			.getTargetAllocatedCallsign()
			.toUpperCase()}, identified ${nearestWaypoint} miles ${distanceFromNearestWaypoint} of ${directionToNearestWaypoint}. Next report at ${nextWayPoint}`;

		return new ServerResponse(mistakes, atcResponse, expectedRadioCall);
	}

	/* Parse Wilco in response to an instruction from ATC unit.
Should consist of Wilco followed by aircraft callsign */
	public static parseWILCO(parseContext: CallParsingContext): ServerResponse {
		const expectedRadioCall: string = `Wilco, ${parseContext.getTargetAllocatedCallsign()}`;

		const mistakes = Parser.checkForMistakes([parseContext.assertWILCOCallCorrect()]);

		// ATC does not respond to this message
		return new ServerResponse(mistakes, '', expectedRadioCall);
	}

	/* Parse Roger in response to an instruction from ATC unit which
	requires no readback. Should consist of Roger followed by aircraft
	callsign or simply just the aircraft callsign alone. */
	public static parseRoger(parseContext: CallParsingContext): ServerResponse {
		const expectedRadioCall: string = `Roger, ${parseContext.getTargetAllocatedCallsign()}`;

		const mistakes = Parser.checkForMistakes([parseContext.assertRogerCallCorrect()]);

		// ATC does not respond to this message
		return new ServerResponse(mistakes, '', expectedRadioCall);
	}

	/* Parse VFR position report.
Should contain the aircraft callsign, location relative to a waypoint,
and the flight level/altitude including passing level and cleared level
if (not in level flight. */
	public static parseVFRPositionReport(parseContext: CallParsingContext): ServerResponse {
		if (parseContext.getRoutePoint().waypoint == null) {
			throw new Error('Waypoint not found');
		}

		// May need more details to be accurate to specific situation
		const expectedRadioCall: string = `
        "${parseContext.getTargetAllocatedCallsign()}, overhead ${
			parseContext.getRoutePoint().waypoint.name
		}, ${parseContext.getRoutePoint().pose.altitude} feet`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallStartsWithUserCallsign(),
			parseContext.assertCallContainsCurrentLocation(),
			parseContext.assertCallContainsAltitude()
		]);

		// TODO
	}
}
