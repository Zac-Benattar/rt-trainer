import { ServerResponse } from './ServerClientTypes';
import type { AirbornePoint } from './RoutePoints';
import type RadioCall from './RadioCall';
import { StartUpStage, TakeOffStage, TaxiStage } from './RouteStages';
import type { METORDataSample } from './Aerodrome';

export default class Parser {
	public static parseCall(radioCall: RadioCall): ServerResponse {
		switch (radioCall.getCurrentRoutePoint().stage) {
			case StartUpStage.RadioCheck:
				return this.parseRadioCheck(radioCall);
			case StartUpStage.DepartureInformationRequest:
				return this.parseDepartureInformationRequest(radioCall);
			case StartUpStage.ReadbackDepartureInformation:
				return this.parseDepartureInformationReadback(radioCall);
			case TaxiStage.TaxiRequest:
				return this.parseTaxiRequest(radioCall);
			case TaxiStage.TaxiClearanceReadback:
				return this.parseTaxiClearanceReadback(radioCall);
			case TaxiStage.RequestTaxiInformation:
				return this.parseTaxiInformationRequest(radioCall);
			case TaxiStage.AnnounceTaxiing:
				return this.parseAnnounceTaxiing(radioCall);
			case TakeOffStage.ReadyForDeparture:
				return this.parseReadyForDeparture(radioCall);
			case TakeOffStage.ReadbackAfterDepartureInformation:
				return this.parseReadbackAfterDepartureInformation(radioCall);
			default:
				throw new Error('Unimplemented route point type');
		}
	}

	// Example: Wellesbourne Information, student Golf Oscar Foxtrot Lima Yankee, radio check One Eight Zero Decimal Zero Three
	public static parseRadioCheck(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getCurrentTarget()}, ${radioCall.getUserCallsignPhonetics()}, radio check ${radioCall.getCurrentRadioFrequencyPhonetics()}`;

		radioCall.assertCallContainsCurrentRadioFrequency();
		radioCall.assertCallStartsWithTargetCallsign();
		radioCall.assertCallContainsUserCallsign();
		radioCall.assertCallContainsConsecutiveCriticalWords(['radio', 'check']);

		// Return ATC response
		const atcResponse = `${radioCall
			.getUserCallsignPhonetics()
			.toUpperCase()}, ${radioCall.getCurrentTarget()}, reading you five.`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	// Example: Student Golf Oscar Foxtrot Lima Yankee, request departure information
	public static parseDepartureInformationRequest(radioCall: RadioCall): ServerResponse {
		const expectedRadiocall = `${radioCall
			.getTargetAllocatedCallsign()
			.toLowerCase()} request departure information`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsConsecutiveCriticalWords(['request', 'departure', 'information']);

		// Return ATC response
		const metorSample: METORDataSample = radioCall.getStartAerodromeMETORSample();
		const atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, runway ${
			radioCall.getStartAerodromeTakeoffRunway().name
		}, surface wind ${metorSample.getWindDirectionString()} ${metorSample.getWindSpeedString()}, QNH ${metorSample.getPressureString()}, temperature ${metorSample.getTemperatureString()} dewpoint ${metorSample.getDewpointString()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadiocall);
	}

	// Example: Runway 24, QNH 1013, Student Golf Lima Yankee
	public static parseDepartureInformationReadback(radioCall: RadioCall): ServerResponse {
		const runwayName: string = radioCall.getStartAerodromeTakeoffRunway().name;
		const expectedRadioCall: string = `Runway ${runwayName} QNH ${radioCall
			.getStartAerodromeMETORSample()
			.getPressureString()} ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsTakeOffRunwayName();
		radioCall.assertCallContainsStartAerodromePressure();
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	// Example: Student Golf Lima Yankee, by the south side hangers, request taxi for vfr flight to birmingham
	public static parseTaxiRequest(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()} ${radioCall.getAircraftType()} by the ${
			radioCall.getStartAerodromeStartingPoint().name
		} request taxi VFR to ${radioCall.getEndAerodrome().getShortName()}`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsScenarioStartPoint();
		radioCall.assertCallContainsEndAerodromeName();
		radioCall.assertCallContainsConsecutiveCriticalWords(['request', 'taxi']);
		radioCall.assertCallContainsCriticalWord('vfr');

		// Return ATC response
		const atcResponse = `${radioCall
			.getTargetAllocatedCallsign()
			.toUpperCase()}, taxi to holding point ${
			radioCall.getTakeoffRunwayHoldingPoint().name
		} via taxiway charlie. Hold short of runway ${
			radioCall.getStartAerodromeTakeoffRunway().name
		}, QNH ${radioCall.getStartAerodromeMETORSample().getPressureString()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	// Example: Taxi holding point alpha via taxiway charlie. Hold short of runway 24, QNH 1013, Student Golf Lima Yankee
	public static parseTaxiClearanceReadback(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()} taxi holding point ${
			radioCall.getTakeoffRunwayHoldingPoint().name
		} runway ${radioCall.getStartAerodromeTakeoffRunway().name} QNH ${radioCall
			.getStartAerodromeMETORSample()
			.getPressureString()} ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsCriticalWord('taxi');
		radioCall.assertCallContainsConsecutiveCriticalWords(['holding', 'point']);
		radioCall.assertCallContainsTakeOffRunwayHoldingPoint();
		radioCall.assertCallContainsTakeOffRunwayName();
		radioCall.assertCallContainsStartAerodromePressure();
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseTaxiInformationRequest(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, by the ${
			radioCall.getStartAerodromeStartingPoint().name
		}, request taxi information, VFR to ${radioCall.getEndAerodrome().getShortName()}`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsConsecutiveCriticalWords(['request', 'taxi', 'information']);
		radioCall.assertCallContainsFlightRules();
		radioCall.assertCallContainsScenarioStartPoint();
		radioCall.assertCallContainsEndAerodromeName();

		// Return ATC response
		const atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, runway ${
			radioCall.getStartAerodromeTakeoffRunway().name
		}, QNH ${radioCall.getStartAerodromeMETORSample().getPressureString()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseAnnounceTaxiing(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, taxiing to runway ${
			radioCall.getStartAerodromeTakeoffRunway().name
		}, QNH ${radioCall.getStartAerodromeMETORSample().getPressureString()}`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsCriticalWord('taxiing');
		radioCall.assertCallContainsTakeOffRunwayName();
		radioCall.assertCallContainsStartAerodromePressure();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	// Example: Student Golf Lima Yankee, ready for departure, request right turnout heading 330 degrees
	public static parseReadyForDeparture(radioCall: RadioCall): ServerResponse {
		let expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, ready for departure`;
		if (radioCall.getStartAerodrome().isControlled()) {
			expectedRadioCall += ` request right turnout heading ${radioCall.getTakeoffTurnoutHeading()} degrees`;
		}

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsConsecutiveCriticalWords(['ready', 'for', 'departure']);

		if (radioCall.getStartAerodrome().isControlled()) {
			radioCall.assertCallContainsTakeoffTurnoutHeading();
		}

		// Return ATC response
		const atcResponse = `${radioCall
			.getTargetAllocatedCallsign()
			.toUpperCase()}, hold position. After departure turn right approved, climb not above ${radioCall.getTakeoffTransitionAltitude()} until zone boundary`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	// Example: Holding. After departure right turn approved, not above 1500 feet until zone boundary. Student Golf Lima Yankee
	public static parseReadbackAfterDepartureInformation(radioCall: RadioCall): ServerResponse {
		let expectedRadioCall: string = `Holding.`;
		if (radioCall.getStartAerodrome().isControlled()) {
			expectedRadioCall += ` After departure right turn approved, not above ${radioCall.getTakeoffTransitionAltitude()} until zone boundary.`;
		}
		expectedRadioCall += ` ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsNonCriticalWord('Holding');
		if (radioCall.getStartAerodrome().isControlled()) {
			radioCall.assertCallContainsNotAboveTransitionAltitude();
		}
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	/* Parse initial contact with new ATC unit.
	Example Student Golf Oscar Foxtrot Lima Yankee, Birmingham Radar */
	public static parseNewAirspaceInitialContact(
		currentPoint: AirbornePoint,
		radioCall: RadioCall
	): ServerResponse {
		const expectedRadioCall: string = `${radioCall
			.getCurrentTarget()
			.toLowerCase()}, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallStartsWithTargetCallsign();
		radioCall.assertCallContainsUserCallsign();

		// Return ATC response
		const atcResponse = `${radioCall
			.getTargetAllocatedCallsign()
			.toUpperCase()}, ${radioCall.getCurrentTarget()}.`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	/* Parse response to ATC unit acknowledging initial contact
call. Should consist of aircraft callsign and type, flight
rules, departure and destination aerodromes, position,
flight level/altitude including passing/cleared level if (not
in level flight, and additional details such as next waypoint(s)
accompanied with the planned times to reach them */
	public static parseNewAirspaceGiveFlightInformationToATC(radioCall: RadioCall): ServerResponse {
		const nearestwaypoint: string = 'Test Waypoint';
		const distancefromnearestwaypoint: number = 0.0;
		const directiontonearestwaypoint: string = 'Direction';

		const nextwaypoint: string = 'Next Waypoint';

		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, ${radioCall.getAircraftType()} VFR from ${radioCall
			.getStartAerodrome()
			.getShortName()} to ${radioCall
			.getEndAerodrome()
			.getShortName()}, ${distancefromnearestwaypoint} miles ${directiontonearestwaypoint} of ${nearestwaypoint}, ${
			radioCall.getCurrentRoutePoint().pose.altitude
		}, ${nextwaypoint}`;

		// TODO
		return '';
	}

	/* Parse response to ATC unit requesting squark.
Should consist of aircraft callsign and squark code */
	public static parseNewAirspaceSquark(
		sqwarkFrequency: number,
		radioCall: RadioCall
	): ServerResponse {
		const expectedRadioCall: string = `Squawk ${sqwarkFrequency}, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsSqwarkCode();
		radioCall.assertCallContainsUserCallsign();

		const nearestWaypoint: string = 'Test Waypoint';
		const distanceFromNearestWaypoint: number = 0.0;
		const directionToNearestWaypoint: string = 'Direction';
		const nextWayPoint: string = 'Next Waypoint';

		// Return ATC response
		const atcResponse = `${radioCall
			.getTargetAllocatedCallsign()
			.toUpperCase()}, identified ${nearestWaypoint} miles ${distanceFromNearestWaypoint} of ${directionToNearestWaypoint}. Next report at ${nextWayPoint}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	/* Parse Wilco in response to an instruction from ATC unit.
Should consist of Wilco followed by aircraft callsign */
	public static parseWILCO(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Wilco, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertWILCOCallCorrect();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	/* Parse Roger in response to an instruction from ATC unit which
	requires no readback. Should consist of Roger followed by aircraft
	callsign or simply just the aircraft callsign alone. */
	public static parseRoger(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Roger, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertRogerCallCorrect();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	/* Parse VFR position report.
Should contain the aircraft callsign, location relative to a waypoint,
and the flight level/altitude including passing level and cleared level
if (not in level flight. */
	public static parseVFRPositionReport(radioCall: RadioCall): ServerResponse {
		if (radioCall.getCurrentRoutePoint().waypoint == null) {
			throw new Error('Waypoint not found');
		}

		// May need more details to be accurate to specific situation
		const expectedRadioCall: string = `
        "${radioCall.getTargetAllocatedCallsign()}, overhead ${
			radioCall.getCurrentRoutePoint().waypoint.name
		}, ${radioCall.getCurrentRoutePoint().pose.altitude} feet`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsCurrentLocation();
		radioCall.assertCallContainsAltitude();

		// TODO
	}
}
