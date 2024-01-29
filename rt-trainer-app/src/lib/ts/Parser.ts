import { ServerResponse } from './ServerClientTypes';
import type RoutePoint from './RoutePoints';
import type RadioCall from './RadioCall';
import {
	CircuitAndLandingStage,
	InboundForJoinStage,
	StartUpStage,
	TakeOffStage,
	TaxiStage
} from './RouteStages';
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
			case TakeOffStage.ReadbackClearance:
				return this.parseReadbackClearance(radioCall);
			case TakeOffStage.AcknowledgeTraffic:
				return this.parseAcknowledgeTraffic(radioCall);
			case TakeOffStage.AnnounceTakingOff:
				return this.parseAnnounceTakingOff(radioCall);
			case InboundForJoinStage.RequestJoin:
				return this.parseRequestJoin(radioCall);
			case InboundForJoinStage.ReportDetails:
				return this.parseRequestOverheadJoinPassMessage(radioCall);
			case InboundForJoinStage.ReadbackOverheadJoinClearance:
				return this.parseReadbackOverheadJoinClearance(radioCall);
			case InboundForJoinStage.ReportAerodromeInSight:
				return this.parseAnnounceAerodromeInSight(radioCall);
			case InboundForJoinStage.ContactTower:
				return this.parselandingContactTower(radioCall);
			case CircuitAndLandingStage.ReportFinal:
				return this.parseAnnounceFinal(radioCall);
			case CircuitAndLandingStage.AcknowledgeGoAround:
				return this.parseAcknowledgeGoAroundInstruction(radioCall);
			case CircuitAndLandingStage.AnnounceGoAround:
				return this.parseAnnounceGoAround(radioCall);
			default:
				throw new Error(
					'Unimplemented route point type: ' + radioCall.getCurrentRoutePoint().stage
				);
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
			.toUpperCase()}, ${radioCall.getCurrentTarget()}, readability 5, pass your message.`;

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
			radioCall.getTakeoffRunway().name
		}, surface wind ${metorSample.getWindDirectionString()} ${metorSample.getWindSpeedString()}, QNH ${metorSample.getPressureString()}, temperature ${metorSample.getTemperatureString()} dewpoint ${metorSample.getDewpointString()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadiocall);
	}

	// Example: Runway 24, QNH 1013, Student Golf Lima Yankee
	public static parseDepartureInformationReadback(radioCall: RadioCall): ServerResponse {
		const runwayName: string = radioCall.getTakeoffRunway().name;
		const expectedRadioCall: string = `Runway ${runwayName} QNH ${radioCall
			.getStartAerodromeMETORSample()
			.getPressureString()} ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsTakeOffRunwayName();
		radioCall.assertCallContainsTakeoffPressure();
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
			radioCall.getTakeoffRunwayTaxiwayHoldingPoint().name
		} via taxiway charlie. Hold short of runway ${
			radioCall.getTakeoffRunway().name
		}, QNH ${radioCall.getStartAerodromeMETORSample().getPressureString()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	// Example: Taxi holding point alpha via taxiway charlie. Hold short of runway 24, QNH 1013, Student Golf Lima Yankee
	public static parseTaxiClearanceReadback(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()} taxi holding point ${
			radioCall.getTakeoffRunwayTaxiwayHoldingPoint().name
		} runway ${radioCall.getTakeoffRunway().name} QNH ${radioCall
			.getStartAerodromeMETORSample()
			.getPressureString()} ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsCriticalWord('taxi');
		radioCall.assertCallContainsConsecutiveCriticalWords(['holding', 'point']);
		radioCall.assertCallContainsTakeOffRunwayHoldingPoint();
		radioCall.assertCallContainsTakeOffRunwayName();
		radioCall.assertCallContainsTakeoffPressure();
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
			radioCall.getTakeoffRunway().name
		}, QNH ${radioCall.getStartAerodromeMETORSample().getPressureString()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseAnnounceTaxiing(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, taxiing to runway ${
			radioCall.getTakeoffRunway().name
		}, QNH ${radioCall.getStartAerodromeMETORSample().getPressureString()}`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsCriticalWord('taxiing');
		radioCall.assertCallContainsTakeOffRunwayName();
		radioCall.assertCallContainsTakeoffPressure();

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
		let atcResponse: string = radioCall.getTargetAllocatedCallsign();
		if (radioCall.getStartAerodrome().isControlled()) {
			atcResponse += `, hold position. After departure turn right approved, climb not above ${radioCall.getTakeoffTransitionAltitude()} until zone boundary`;
		} else {
			const traffic: string = radioCall.getTakeoffTraffic() + ', ';
			if (traffic) {
				atcResponse += `traffic is ${traffic}, `;
			} else {
				atcResponse += 'no reported traffic, ';
			}
			const metorSample: METORDataSample = radioCall.getStartAerodromeMETORSample();
			atcResponse += metorSample.getWindDirectionString() + ', ' + metorSample.getWindSpeedString();
		}

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

	// Example: Cleared for takeoff, Student Golf Lima Yankee
	public static parseReadbackClearance(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Cleared for takeoff, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['cleared', 'for', 'takeoff']);
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	// Example: Roger, holding position, Student Golf Lima Yankee
	public static parseAcknowledgeTraffic(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Roger, holding position, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsCriticalWord('roger');
		radioCall.assertCallContainsConsecutiveCriticalWords(['holding', 'position']);
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	// Example: Taking off, Student Golf Lima Yankee
	public static parseAnnounceTakingOff(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Taking off, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['taking', 'off']);
		radioCall.assertCallEndsWithUserCallsign();

		const atcResponse = `${radioCall.getTargetAllocatedCallsign()}, roger.`;

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	/* Parse initial contact with new ATC unit.
	Example: Student Golf Oscar Foxtrot Lima Yankee, Birmingham Radar */
	public static parseNewAirspaceInitialContact(
		currentPoint: RoutePoint,
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
		if (radioCall.getCurrentFix() == null) {
			throw new Error('Waypoint not found');
		}

		// May need more details to be accurate to specific situation
		const expectedRadioCall: string = `
        "${radioCall.getTargetAllocatedCallsign()}, overhead ${
			radioCall.getCurrentFix().name
		}, ${radioCall.getCurrentAltitude()} feet`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsCurrentLocation();
		radioCall.assertCallContainsAltitude();

		// TODO
	}

	public static parseRequestJoin(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getCurrentTarget()}, ${radioCall.getTargetAllocatedCallsign()}, request join`;

		radioCall.assertCallStartsWithTargetCallsign();
		radioCall.assertCallContainsUserCallsign();
		radioCall.assertCallContainsConsecutiveCriticalWords(['request', 'join']);

		const atcResponse = `${radioCall
			.getTargetAllocatedCallsign()
			.toUpperCase()}, ${radioCall.getCurrentTarget()}, pass your message`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseRequestOverheadJoinPassMessage(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, ${
			radioCall.getAircraftType
		} inbound from ${radioCall.getPreviousWaypointName()}, ${radioCall.getPositionRelativeToLastWaypoint()}, ${radioCall.getCurrentAltitude()}, information ${radioCall.getCurrentATISLetter()}, request overhead join`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsAircraftType();
		radioCall.assertCallContainsPreviousWaypointName();
		radioCall.assertCallContainsPositionRelativeToLastWaypoint();
		radioCall.assertCallContainsCurrentAltitude();
		radioCall.assertCallContainsCurrentATISLetter();
		radioCall.assertCallContainsConsecutiveCriticalWords(['request', 'overhead', 'join']);

		const atcResponse = `${radioCall
			.getTargetAllocatedCallsign()
			.toUpperCase()}, join overhead runway ${radioCall.getLandingRunwayName()}, height ${radioCall.getJoinOverheadAltitude()} ${radioCall
			.getEndAerodromeMETORSample()
			.getPressureString()}, report aerodrome in sight`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseReadbackOverheadJoinClearance(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, join overhead runway ${radioCall.getLandingRunwayName()}, height ${radioCall.getJoinOverheadAltitude()}, ${radioCall
			.getEndAerodromeMETORSample()
			.getPressureString()}, wilco, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['join', 'overhead']);
		radioCall.assertCallContainsLandingRunwayName();
		radioCall.assertCallContainsLandingPressure();
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseAnnounceAerodromeInSight(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, aerodrome in sight`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsConsecutiveCriticalWords(['aerodrome', 'in', 'sight']);

		let atcResponse = '';
		if (radioCall.getEndAerodrome().isControlled()) {
			atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, contact ${radioCall
				.getEndAerodrome()
				.getShortName()} tower on ${radioCall.getEndAerodrome().getLandingFrequency()}`;
		}

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parselandingContactTower(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall
			.getEndAerodrome()
			.getShortName()} tower ${radioCall
			.getEndAerodrome()
			.getLandingFrequency()}, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords([
			radioCall.getEndAerodrome().getShortName(),
			'tower'
		]);
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseAcknowledgeGoAroundInstruction(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Going around ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['going', 'around']);
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseAnnounceGoAround(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Going around, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['going', 'around']);
		radioCall.assertCallEndsWithUserCallsign();

		let atcResponse = '';
		if (radioCall.getEndAerodrome().isControlled()) {
			atcResponse = `Roger, ${radioCall
				.getTargetAllocatedCallsign()
				.toUpperCase()}, contact ${radioCall.getEndAerodrome().getShortName()} tower on ${radioCall
				.getEndAerodrome()
				.getLandingFrequency()}`;
		}

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseAnnounceFinal(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, final`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsCriticalWord('final');

		let atcResponse = '';
		if (radioCall.getEndAerodrome().isControlled()) {
			atcResponse = `${radioCall
				.getTargetAllocatedCallsign()
				.toUpperCase()}, continue approach, ${radioCall.getLandingTraffic()}`;
		} else {
			atcResponse = `${radioCall
				.getTargetAllocatedCallsign()
				.toUpperCase()}, surface wind ${radioCall
				.getEndAerodromeMETORSample()
				.getWindDirectionString()} ${radioCall
				.getEndAerodromeMETORSample()
				.getWindSpeedString()}. ${radioCall.getLandingTraffic()}`;
		}
		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseAcknowledgeContinueApproach(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Continue approach, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['continue', 'approach']);
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseAcknowledgeClearedToLand(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Cleared to land, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['cleared', 'to', 'land']);
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseAcklowledgeVacateRunwayInstruction(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Taxi to the end, wilco, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsCriticalWords(['taxi', 'end']);
		radioCall.assertCallContainsWilco();
		radioCall.assertCallEndsWithUserCallsign();

		let atcResponse = '';
		if (radioCall.getEndAerodrome().isControlled()) {
			atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, contact ${radioCall
				.getEndAerodrome()
				.getShortName()} tower on ${radioCall.getEndAerodrome().getLandingFrequency()}`;
		}

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseAnnounceRunwayVacated(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, runway vacated`;

		radioCall.assertCallStartsWithUserCallsign();
		radioCall.assertCallContainsConsecutiveCriticalWords(['runway', 'vacated']);

		let atcResponse = '';
		if (radioCall.getEndAerodrome().isControlled()) {
			atcResponse = `${radioCall
				.getTargetAllocatedCallsign()
				.toUpperCase()}, taxi to ${radioCall.getLandingParkingSpot()}`;
		} else {
			atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, roger`;
		}

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseReadbackTaxiParkingSpot(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Taxi to ${radioCall.getLandingParkingSpot()}, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['taxi', 'to']);
		radioCall.assertCallContainsLandingParkingSpot();
		radioCall.assertCallEndsWithUserCallsign();

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}
}
