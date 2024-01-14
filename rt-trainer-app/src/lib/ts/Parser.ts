import { Mistake } from './ServerClientTypes';
import type { METORDataSample } from './SimulatorTypes';
import { RoutePointType, type AirbornePoint, type RoutePoint, ParkedPoint } from './RouteStates';
import type CallParsingContext from './CallParsingContext';
import { ParkedStage } from './FlightStages';

export default class Parser {
	public static parseCall(parseContext: CallParsingContext): Mistake | string {
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

	public static parseRadioCheck(parseContext: CallParsingContext): Mistake | string {
		const expectedRadioCall: string = `${
			parseContext.getCurrentTarget().callsign
		}, ${parseContext.getUserCallsign()}, radio check ${parseContext.getCurrentRadioFrequency()}`;

		// If radio frequency not found return an error
		if (!parseContext.radioFrequencyIsStated()) {
			return new Mistake(expectedRadioCall, parseContext.getRadioCall(), 'Frequency missing');
		}

		// Convert frequency string to float and check it is a valid frequency and equal to the correct frequency
		const radioFreqStated: number = parseContext.getRadioFrequencyStated();
		if (isNaN(radioFreqStated)) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				'Frequency not recognised'
			);
		} else if (radioFreqStated != parseContext.getCurrentRadioFrequency()) {
			return new Mistake(expectedRadioCall, parseContext.getRadioCall(), 'Frequency incorrect');
		}

		// Ensure aircraft callsign is present
		if (!parseContext.callContainsUserCallsign())
			return new Mistake(expectedRadioCall, parseContext.getRadioCall(), 'Callsign not recognised');

		// Check the message contains "radio check"
		if (!parseContext.callContainsConsecutiveWords(['radio', 'check'])) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				"Expected 'radio check' in message"
			);
		}

		// Trailing 0s lost when frequency string parsed to float, hence comparison of floats rather than strings
		if (parseContext.radioFrequencyStatedEqualsCurrent()) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				`Frequency incorrect: ${radioFreqStated} \n Expected: ${parseContext.getCurrentRadioFrequency()}`
			);
		}

		// Return ATC response
		return `${parseContext.getUserCallsign()}, ${
			parseContext.getCurrentTarget().callsign
		}, reading you 5`;
	}

	public static parseDepartureInformationRequest(
		parseContext: CallParsingContext
	): Mistake | string {
		const expectedRadiocall = `${parseContext
			.getUserCallsign()
			.toLowerCase()} request departure information`;

		if (!parseContext.callContainsUserCallsign()) {
			return new Mistake(
				expectedRadiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include your whole callsign in your message'
			);
		}

		if (!parseContext.callContainsConsecutiveWords(['request', 'departure', 'information'])) {
			return new Mistake(
				expectedRadiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Make sure to include the departure information request in your message.'
			);
		}

		// Return ATC response
		const metorSample: METORDataSample = parseContext.getStartAerodromeMETORSample();
		return `${parseContext.getTargetAllocatedCallsign()}, runway ${
			parseContext.getStartAerodromeTakeoffRunway().name
		}, wind ${metorSample.windDirection} degrees ${metorSample.windSpeed} knots, QNH ${
			metorSample.pressure
		}, temperature ${metorSample.temperature} dewpoint ${metorSample.dewpoint}`;
	}

	public static parseDepartureInformationReadback(
		parseContext: CallParsingContext
	): Mistake | string {
		const runwayName: string = parseContext.getStartAerodromeTakeoffRunway().name;
		const metorSample: METORDataSample = parseContext.getStartAerodromeMETORSample();

		const expectedradiocall: string = `${parseContext.getUserCallsign()} runway ${runwayName} qnh ${
			metorSample.pressure
		} ${parseContext.getUserCallsign()}`;

		if (!parseContext.callContainsConsecutiveWords(['qnh', metorSample.pressure.toString()])) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Make sure to include the air pressure in your readback.'
			);
		}

		if (!parseContext.callContainsConsecutiveWords(['runway', runwayName])) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Make sure to include the runway in your readback.'
			);
		}

		// ATC does not respond to this message
		return '';
	}

	public static parseTaxiRequest(parseContext: CallParsingContext): Mistake | string {
		const expectedradiocall: string = `${parseContext.getTargetAllocatedCallsign()} ${parseContext.getAircraftType()} at ${parseContext.getStartAerodrome()} request taxi VFR to ${parseContext.getEndAerodrome()}`;

		if (!parseContext.callStartsWithUserCallsign()) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include your callsign at the start of your message.'
			);
		}

		if (!parseContext.callContainsWords(parseContext.getAircraftType().split(' '))) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include the aircraft type in your message.'
			);
		}

		if (
			parseContext.callContainsConsecutiveWords(
				parseContext.getStartAerodrome().startPoint.split(' ')
			)
		) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Make sure to include the start point in your request.'
			);
		}

		if (parseContext.callContainsConsecutiveWords(parseContext.getEndAerodrome().name.split(' '))) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Make sure to include the destination in your request.'
			);
		}

		// Return ATC response
		return `${parseContext.getTargetAllocatedCallsign()}, taxi to holding point ${
			parseContext.getStartAerodromeTakeoffRunway().holdingPoints[0].name
		}, runway ${parseContext.getStartAerodromeTakeoffRunway().name}, QNH ${
			parseContext.getStartAerodromeMETORSample().pressure
		}`;
	}

	public static parseTaxiReadback(parseContext: CallParsingContext): Mistake | string {
		const expectedradiocall: string = `${parseContext.getTargetAllocatedCallsign()} taxi holding point ${
			parseContext.getStartAerodromeTakeoffRunway().holdingPoints[0].name
		} runway ${parseContext.getStartAerodromeTakeoffRunway().name} qnh ${
			parseContext.getStartAerodromeMETORSample().pressure
		} ${parseContext.getTargetAllocatedCallsign()}`;

		if (
			!(
				parseContext.callContainsConsecutiveWords(['taxi', 'holding', 'point']) ||
				parseContext.callContainsConsecutiveWords(['taxi', 'to', 'holding', 'point'])
			)
		) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Make sure to include the action you are approved for (taxi to holding point) in your readback.'
			);
		}

		if (
			!parseContext.callContainsConsecutiveWords(
				parseContext.getStartAerodromeTakeoffRunway().holdingPoints[0].name.split(' ')
			)
		) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Make sure to include the holding point in your readback.'
			);
		}

		if (
			!parseContext.callContainsConsecutiveWords(
				parseContext.getStartAerodromeTakeoffRunway().name.split(' ')
			)
		) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Make sure to include the runway in your readback.'
			);
		}

		if (parseContext.callEndsWithUserCallsign())
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include your callsign at the end of your readback.'
			);

		// ATC does not respond to this message
		return '';
	}

	/* Parse initial contact with ATC unit.
Should consist of ATC callsign and aircraft callsign */
	public static parseNewAirspaceInitialContact(
		currentPoint: RoutePoint,
		parseContext: CallParsingContext
	): Mistake | string {
		const expectedradiocall: string = `${parseContext
			.getCurrentTarget()
			.callsign.toLowerCase()}, ${parseContext.getUserCallsign()}`;

		if (!parseContext.callContainsTargetCallsign()) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include the target callsign at the start of your initial message.'
			);
		}

		if (!parseContext.callContainsUserCallsign()) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include your own callsign in your initial message.'
			);
		}

		if (
			parseContext.getRadioCallWordCount() >
			parseContext.getUserCallsignWords().length + parseContext.getTargetCallsignWords().length
		) {
			return new Mistake(
				expectedradiocall,
				parseContext.getUnmodifiedRadioCall(),
				'Keep your calls brief.'
			);
		}

		// Return ATC response
		return `${parseContext.getTargetAllocatedCallsign()}, ${
			parseContext.getCurrentTarget().callsign
		}.`;
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
	): Mistake | string {
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

		if (!parseContext.callStartsWithUserCallsign()) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include your own callsign at the start of your call.'
			);
		}

		// TODO
		return '';
	}

	/* Parse response to ATC unit requesting squark.
Should consist of aircraft callsign and squark code */
	public static parseNewAirspaceSquark(
		sqwarkFrequency: number,
		parseContext: CallParsingContext
	): Mistake | string {
		const expectedRadioCall: string = `Squawk ${sqwarkFrequency}, ${parseContext.getTargetAllocatedCallsign()}`;

		if (!parseContext.callStartsWithUserCallsign()) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include your own callsign at the start of your message.'
			);
		}

		if (!parseContext.callContainsWord(sqwarkFrequency.toString())) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include the sqwark code at the start of your initial message.'
			);
		}

		const nearestWaypoint: string = 'Test Waypoint';
		const distanceFromNearestWaypoint: number = 0.0;
		const directionToNearestWaypoint: string = 'Direction';
		const nextWayPoint: string = 'Next Waypoint';

		// Return ATC response
		return `${parseContext.getTargetAllocatedCallsign()}, identified ${nearestWaypoint} miles ${distanceFromNearestWaypoint} of ${directionToNearestWaypoint}. Next report at ${nextWayPoint}`;
	}

	/* Parse Wilco in response to an instruction from ATC unit.
Should consist of Wilco followed by aircraft callsign */
	public static parseWILCO(
		currentPoint: AirbornePoint,
		parseContext: CallParsingContext
	): Mistake | string {
		const expectedRadioCall: string = `Wilco, ${parseContext.getTargetAllocatedCallsign()}`;

		if (
			!parseContext.callStartsWithWord('wilco') ||
			!parseContext.callStartsWithConsecutiveWords(['will', 'comply'])
		) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include WILCO (will comply) at the start of your initial message.'
			);
		}

		if (!parseContext.callContainsUserCallsign()) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include your own callsign in your message.'
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
	public static parseVFRPositionReport(parseContext: CallParsingContext): Mistake | string {
		if (parseContext.getRoutePoint().waypoint == null) {
			throw new Error('Waypoint not found');
		}

		// May need more details to be accurate to specific situation
		const expectedRadioCall: string = `
        "${parseContext.getTargetAllocatedCallsign()}, overhead ${
			parseContext.getRoutePoint().waypoint.name
		}, ${parseContext.getRoutePoint().pose.altitude} feet`;

		if (!parseContext.callContainsUserCallsign()) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include your own callsign at the start of your radio call.'
			);
		}

		if (
			!parseContext.callContainsConsecutiveWords(
				parseContext.getRoutePoint().waypoint.name.split(' ')
			)
		) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include your current location in your radio call.'
			);
		}

		if (!parseContext.callContainsWord(parseContext.getRoutePoint().pose.altitude.toString())) {
			return new Mistake(
				expectedRadioCall,
				parseContext.getUnmodifiedRadioCall(),
				'Remember to include your altitude in your radio call.'
			);
		}

		// TODO
		return '';
	}
}
