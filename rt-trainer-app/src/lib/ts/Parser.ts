import { ServerResponse, type Mistake } from './ServerClientTypes';
import type { METORDataSample } from './SimulatorTypes';
import { RoutePointType, type AirbornePoint, type RoutePoint, ParkedPoint } from './RouteStates';
import type CallParsingContext from './CallParsingContext';
import { ParkedStage } from './FlightStages';

export default class Parser {
	public static parseCall(parseContext: CallParsingContext): ServerResponse {
		switch (parseContext.getRoutePoint().pointType) {
			case RoutePointType.Parked: {
				const parkedPoint: ParkedPoint = parseContext.getRoutePoint() as ParkedPoint;
				switch (parkedPoint.stage) {
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
					default:
						throw new Error('Unknown parked stage');
				}
			}
			case RoutePointType.Taxiing:
				return this.parseTaxiing(parseContext);
			case RoutePointType.HoldingPoint:
				return this.parseHoldingPoint(parseContext);
			case RoutePointType.TakeOff:
				return this.parseTakeOff(parseContext);
			case RoutePointType.Airborne:
				return this.parseAirborne(parseContext);
			case RoutePointType.InboundForJoin:
				return this.parseApproach(parseContext);
			case RoutePointType.JoinCircuit:
				return this.parseLanding(parseContext);
			case RoutePointType.CircuitAndLanding:
				return this.parseLandedTaxiing(parseContext);
			case RoutePointType.LandingToParked:
				return this.parseLandedParked(parseContext);
			default:
				throw new Error('Unknown route point type');
		}
	}

	private static checkForMistakes(potentialMistakes: (Mistake | undefined)[]): Mistake[] {
		const mistakes: Mistake[] = [];
		potentialMistakes.forEach((mistake) => {
			if (mistake != undefined) mistakes.push(mistake);
		});
		return mistakes;
	}

	// Example: Wellesbourne information, student g-ofly, radio check 180.030
	public static parseRadioCheck(parseContext: CallParsingContext): ServerResponse {
		const expectedRadioCall: string = `${
			parseContext.getCurrentTarget().callsign
		}, ${parseContext.getUserCallsign()}, radio check ${parseContext.getCurrentRadioFrequency()}`;

		const mistakes: Mistake[] = Parser.checkForMistakes([
			parseContext.assertCallContainsCurrentRadioFrequency(),
			parseContext.assertCallStartsWithTargetCallsign(),
			parseContext.assertCallContainsUserCallsign(),
			parseContext.assertCallContainsConsecutiveWords(['radio', 'check'])
		]);

		// Return ATC response
		const atcResponse = `${parseContext.getUserCallsign().toUpperCase()}, ${
			parseContext.getCurrentTarget().callsign
		}, reading you 5`;

		return new ServerResponse(mistakes, atcResponse, expectedRadioCall);
	}

	// Example: Student G-OFLY, request departure information
	public static parseDepartureInformationRequest(parseContext: CallParsingContext): ServerResponse {
		const expectedRadiocall = `${parseContext
			.getUserCallsign()
			.toLowerCase()} request departure information`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallStartsWithUserCallsign(),
			parseContext.assertCallContainsConsecutiveWords(['request', 'departure', 'information'])
		]);

		// Return ATC response
		const metorSample: METORDataSample = parseContext.getStartAerodromeMETORSample();
		const atcResponse = `${parseContext.getTargetAllocatedCallsign().toUpperCase()}, runway ${
			parseContext.getStartAerodromeTakeoffRunway().name
		}, wind ${metorSample.windDirection.toFixed(0)} degrees ${metorSample.windSpeed.toFixed(
			0
		)} knots, QNH ${metorSample.pressure.toFixed(0)}, temperature ${metorSample.temperature.toFixed(
			0
		)} dewpoint ${metorSample.dewpoint.toFixed(0)}`;

		return new ServerResponse(mistakes, atcResponse, expectedRadiocall);
	}

	// Example: Runway 24, QNH 1013, student G-OFLY
	public static parseDepartureInformationReadback(
		parseContext: CallParsingContext
	): ServerResponse {
		const runwayName: string = parseContext.getStartAerodromeTakeoffRunway().name;
		const pressure: number = parseContext.getStartAerodromeMETORSample().pressure;
		let expectedRadioCall: string = `${parseContext.getUserCallsign()} runway ${runwayName} qnh ${pressure} ${parseContext.getUserCallsign()}`;
		if (pressure < 1000) expectedRadioCall += ' millibars';

		const mistakes: Mistake[] = Parser.checkForMistakes([
			parseContext.assertCallStartsWithUserCallsign(),
			parseContext.assertCallContainsTakeOffRunwayName(),
			parseContext.assertCallContainsPressure(),
			parseContext.assertCallEndsWithUserCallsign()
		]);

		// ATC does not respond to this message
		return new ServerResponse(mistakes, '', expectedRadioCall);
	}

	// Example: student G-OFLY, by the south side hangers, request taxi for vfr flight to birmingham
	public static parseTaxiRequest(parseContext: CallParsingContext): ServerResponse {
		const expectedradiocall: string = `${parseContext.getTargetAllocatedCallsign()} ${parseContext.getAircraftType()} at ${parseContext.getStartAerodrome()} request taxi VFR to ${parseContext.getEndAerodrome()}`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallStartsWithTargetCallsign(),
			parseContext.assertCallContainsAircraftType(),
			parseContext.assertCallContainsScenarioStartPoint(),
			parseContext.assertCallContainsStartAerodromeName(),
			parseContext.assertCallContainsEndAerodromeName(),
			parseContext.assertCallContainsConsecutiveWords(['request', 'taxi'])
		]);

		// Return ATC response
		const pressure = parseContext.getStartAerodromeMETORSample().pressure;
		let atcResponse = `${parseContext
			.getTargetAllocatedCallsign()
			.toUpperCase()}, taxi to holding point ${
			parseContext.getTakeoffRunwayHoldingPoint().name
		} via taxiway charlie. Hold short of runway ${parseContext.getStartAerodromeTakeoffRunway().name}, QNH ${
			parseContext.getStartAerodromeMETORSample().pressure
		}`;
		if (pressure < 1000) atcResponse += ' millibars';

		return new ServerResponse(mistakes, atcResponse, expectedradiocall);
	}

	// Example: Taxi holding point alpha via taxiway charlie. Hold short of runway 24, qnh 1013, student G-OFLY
	public static parseTaxiReadback(parseContext: CallParsingContext): ServerResponse {
		const expectedradiocall: string = `${parseContext.getTargetAllocatedCallsign()} taxi holding point ${
			parseContext.getTakeoffRunwayHoldingPoint().name
		} runway ${parseContext.getStartAerodromeTakeoffRunway().name} qnh ${
			parseContext.getStartAerodromeMETORSample().pressure
		} ${parseContext.getTargetAllocatedCallsign()}`;

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

	/* Parse initial contact with new ATC unit.
Should consist of ATC callsign and aircraft callsign */
	public static parseNewAirspaceInitialContact(
		currentPoint: RoutePoint,
		parseContext: CallParsingContext
	): ServerResponse {
		const expectedradiocall: string = `${parseContext
			.getCurrentTarget()
			.callsign.toLowerCase()}, ${parseContext.getUserCallsign()}`;

		const mistakes = Parser.checkForMistakes([
			parseContext.assertCallStartsWithTargetCallsign(),
			parseContext.assertCallContainsUserCallsign()
		]);

		// Return ATC response
		const atcResponse = `${parseContext.getTargetAllocatedCallsign().toUpperCase()}, ${
			parseContext.getCurrentTarget().callsign
		}.`;

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

		const expectedRadioCall: string = `${parseContext.getTargetAllocatedCallsign()}, ${parseContext.getAircraftType()} ${currentPoint.flightRules.toString()} from ${
			parseContext.getStartAerodrome().name
		} to ${
			parseContext.getEndAerodrome().name
		}, ${distancefromnearestwaypoint} miles ${directiontonearestwaypoint} of ${nearestwaypoint}, ${
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
