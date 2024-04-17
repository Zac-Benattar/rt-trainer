import { ServerResponse } from './ServerClientTypes';
import type RadioCall from './RadioCall';
import {
	ChangeZoneStage,
	CircuitAndLandingStage,
	ClimbOutStage,
	InboundForJoinStage,
	LandingToParkedStage,
	PositionReportStage,
	RequestTrafficServiceMATZATZPenetrationStage,
	StartUpStage,
	TakeOffStage,
	TaxiStage
} from './ScenarioStages';
import type { METORDataSample } from './AeronauticalClasses/METORData';

export default class Parser {
	public static parseCall(radioCall: RadioCall): ServerResponse {
		switch (radioCall.getCurrentScenarioPoint().stage) {
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
				return this.parseTakeoffClearanceReadback(radioCall);
			case TakeOffStage.AcknowledgeTraffic:
				return this.parseAcknowledgeTraffic(radioCall);
			case TakeOffStage.AnnounceTakingOff:
				return this.parseAnnounceTakingOff(radioCall);
			case ClimbOutStage.AnnounceLeavingZone:
				return this.parseAnnounceLeavingZone(radioCall);
			case InboundForJoinStage.RequestJoin:
				return this.parseRequestJoin(radioCall);
			case InboundForJoinStage.ReportDetails:
				return this.parseRequestOverheadJoinPassMessage(radioCall);
			case InboundForJoinStage.ReadbackOverheadJoinClearance:
				return this.parseOverheadJoinClearanceReadback(radioCall);
			case InboundForJoinStage.ReportAirportInSight:
				return this.parseAnnounceAirportInSight(radioCall);
			case InboundForJoinStage.ContactTower:
				return this.parseLandingContactTower(radioCall);
			case CircuitAndLandingStage.ReportFinal:
				return this.parseAnnounceFinal(radioCall);
			case CircuitAndLandingStage.AcknowledgeGoAround:
				return this.parseAcknowledgeGoAroundInstruction(radioCall);
			case CircuitAndLandingStage.AnnounceGoAround:
				return this.parseAnnounceGoAround(radioCall);
			case CircuitAndLandingStage.ReadbackContinueApproach:
				return this.parseContinueApproachReadback(radioCall);
			case CircuitAndLandingStage.ReadbackLandingClearance:
				return this.parseLandingClearanceReadback(radioCall);
			case LandingToParkedStage.ReadbackVacateRunwayRequest:
				return this.parseAcklowledgeVacateRunwayInstruction(radioCall);
			case LandingToParkedStage.ReportVacatedRunway:
				return this.parseAnnounceRunwayVacated(radioCall);
			case LandingToParkedStage.ReadbackTaxiInformation:
				return this.parseTaxiParkingSpotReadback(radioCall);
			case ChangeZoneStage.ContactNewFrequency:
				return this.parseNewAirspaceInitialContact(radioCall);
			case ChangeZoneStage.PassMessage:
				return this.parseNewAirspaceGiveFlightInformationToATC(radioCall);
			case ChangeZoneStage.Squawk:
				return this.parseNewAirspaceSquark(radioCall);
			case RequestTrafficServiceMATZATZPenetrationStage.RequestTrafficService:
				return this.parseRequestMATZPenetration(radioCall);
			case RequestTrafficServiceMATZATZPenetrationStage.RequestMATZATZPenetration:
				return this.parseMATZPenetrationReadback(radioCall);
			case RequestTrafficServiceMATZATZPenetrationStage.Squawk:
				return this.parseSqwuak(radioCall);
			case RequestTrafficServiceMATZATZPenetrationStage.AcknowledgeTrafficService:
				return this.parseAcknowledgeTrafficService(radioCall);
			case RequestTrafficServiceMATZATZPenetrationStage.ReadbackDescendInstruction:
				return this.parseMATZPenetrationTrafficServiceReadback(radioCall);
			case RequestTrafficServiceMATZATZPenetrationStage.AnnounceReachMATZPenetrationHeight:
				return this.parseAnnounceReachingMATZPenetrationHeight(radioCall);
			case RequestTrafficServiceMATZATZPenetrationStage.RequestLeavingZoneChangeFrequency:
				return this.parseLeavingMATZFrequencyChangeRequest(radioCall);
			case PositionReportStage.PositionReport:
				return this.parseVFRPositionReport(radioCall);
			default:
				throw new Error(
					'Unimplemented route point type: ' + radioCall.getCurrentScenarioPoint().stage
				);
		}
	}

	// Example: Wellesbourne Information, student Golf Oscar Foxtrot Lima Yankee, radio check One Eight Zero Decimal Zero Three
	public static parseRadioCheck(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getCurrentTarget()}, ${radioCall.getUserCallsignPhoneticsWithPrefix()}, request radio check on ${radioCall.getCurrentRadioFrequencyPhonetics()}`;

		radioCall.assertCallContainsCurrentRadioFrequency(true);
		radioCall.assertCallStartsWithTargetCallsign(true);
		radioCall.assertCallContainsUserCallsign(true);
		radioCall.assertCallContainsConsecutiveCriticalWords(['radio', 'check']);

		// Return ATC response
		const atcResponse = `${radioCall
			.getUserCallsignPhoneticsWithPrefix()
			.toUpperCase()}, ${radioCall.getCurrentTarget()}, readability 5, pass your message.`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	// Example: Student Golf Oscar Foxtrot Lima Yankee, request departure information
	public static parseDepartureInformationRequest(radioCall: RadioCall): ServerResponse {
		const expectedRadiocall = `${radioCall
			.getTargetAllocatedCallsign()
			.toLowerCase()} request departure information`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsConsecutiveCriticalWords(['departure', 'information']);

		// Return ATC response
		const metorSample: METORDataSample = radioCall.getStartAirportMETORSample();
		const atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, runway ${
			radioCall.getTakeoffRunway().designator
		}, surface wind ${metorSample.getWindDirectionString()} ${metorSample.getWindSpeedString()}, QNH ${metorSample.getPressureString()}, temperature ${metorSample.getTemperatureString()} dewpoint ${metorSample.getDewpointString()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadiocall);
	}

	// Example: Runway 24, QNH 1013, Student Golf Lima Yankee
	public static parseDepartureInformationReadback(radioCall: RadioCall): ServerResponse {
		const runwayName: string = radioCall.getTakeoffRunway().designator;
		const expectedRadioCall: string = `Runway ${runwayName} QNH ${radioCall
			.getStartAirportMETORSample()
			.getPressureString()} ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsTakeOffRunwayName(true);
		radioCall.assertCallContainsTakeoffPressure(true);
		radioCall.assertCallEndsWithUserCallsign(false);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	// Example: Student Golf Lima Yankee, by the south side hangers, request taxi for vfr flight to birmingham
	public static parseTaxiRequest(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()} ${radioCall.getAircraftType()} by the ${radioCall.getStartAirportStartingPoint()} request taxi VFR to ${radioCall
			.getEndAirport()
			.getShortName()}`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsScenarioStartPoint(false);
		// radioCall.assertCallContainsEndAirportName(true); // This is a critical word but not always understood by the speech recognition so commented out until we can fix
		radioCall.assertCallContainsCriticalWord('taxi');
		radioCall.assertCallContainsFlightRules(false);

		// Return ATC response
		const atcResponse = `${radioCall
			.getTargetAllocatedCallsign()
			.toUpperCase()}, taxi to holding point ${radioCall.getTakeoffRunwayTaxiwayHoldingPoint()}. Hold short of runway ${
			radioCall.getTakeoffRunway().designator
		}, QNH ${radioCall.getStartAirportMETORSample().getPressureString()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	// Example: Taxi holding point alpha. Hold short of runway 24, QNH 1013, Student Golf Lima Yankee
	public static parseTaxiClearanceReadback(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()} taxi holding point ${radioCall.getTakeoffRunwayTaxiwayHoldingPoint()} runway ${
			radioCall.getTakeoffRunway().designator
		} QNH ${radioCall
			.getStartAirportMETORSample()
			.getPressureString()} ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsCriticalWord('taxi');
		radioCall.assertCallContainsConsecutiveNonCriticalWords(['holding', 'point']);
		radioCall.assertCallContainsTakeOffRunwayHoldingPoint(true);
		radioCall.assertCallContainsTakeOffRunwayName(true);
		radioCall.assertCallContainsTakeoffPressure(true);
		radioCall.assertCallEndsWithUserCallsign(false);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseTaxiInformationRequest(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, by the ${radioCall.getStartAirportStartingPoint()}, request taxi information, VFR to ${radioCall
			.getEndAirport()
			.getShortName()}`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsConsecutiveCriticalWords(['taxi', 'information']);
		radioCall.assertCallContainsFlightRules(false);
		radioCall.assertCallContainsScenarioStartPoint(false);
		// radioCall.assertCallContainsEndAirportName(true); // This is a critical word but not always understood by the speech recognition so commented out until we can fix

		// Return ATC response
		const atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, runway ${
			radioCall.getTakeoffRunway().designator
		}, QNH ${radioCall.getStartAirportMETORSample().getPressureString()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseAnnounceTaxiing(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, taxiing to runway ${
			radioCall.getTakeoffRunway().designator
		}, QNH ${radioCall.getStartAirportMETORSample().getPressureString()}`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsCriticalWord('taxiing'); // Could potentially cause issues with spelling and speach recognition - maybe introduce a check form a list of possible matches
		radioCall.assertCallContainsTakeOffRunwayName(true);
		radioCall.assertCallContainsTakeoffPressure(true);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	// Example: Student Golf Lima Yankee, ready for departure, request right turnout heading 330 degrees
	public static parseReadyForDeparture(radioCall: RadioCall): ServerResponse {
		let expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, ready for departure`;
		if (radioCall.getStartAirport().isControlled()) {
			expectedRadioCall += ` request right turnout heading ${radioCall.getTakeoffTurnoutHeading()} degrees`;
		}

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsCriticalWord('departure');

		if (radioCall.getStartAirport().isControlled()) {
			radioCall.assertCallContainsTakeoffTurnoutHeading(true);
		}

		// Return ATC response
		let atcResponse: string = radioCall.getTargetAllocatedCallsign();
		if (radioCall.getStartAirport().isControlled()) {
			atcResponse += `, hold position. After departure turn right approved, climb not above ${radioCall.getTakeoffTransitionAltitude()} until zone boundary`;
		} else {
			atcResponse += `, ${radioCall.getTakeoffTraffic()}, ${radioCall.getTakeoffWindString()}`;
		}

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	// Example: Holding. After departure right turn approved, not above 1500 feet until zone boundary. Student Golf Lima Yankee
	public static parseReadbackAfterDepartureInformation(radioCall: RadioCall): ServerResponse {
		let expectedRadioCall: string = `Holding position.`;
		if (radioCall.getStartAirport().isControlled()) {
			expectedRadioCall += ` After departure right turn approved, not above ${radioCall.getTakeoffTransitionAltitude()} until zone boundary.`;
		}
		expectedRadioCall += ` ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsNonCriticalWord('holding');
		if (radioCall.getStartAirport().isControlled()) {
			radioCall.assertCallContainsTransitionAltitude(true);
		}
		radioCall.assertCallEndsWithUserCallsign(false);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	// Example: Cleared for takeoff, Student Golf Lima Yankee
	public static parseTakeoffClearanceReadback(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Cleared for takeoff, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsCriticalWords(['cleared', 'takeoff']);
		radioCall.assertCallEndsWithUserCallsign(false);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	// Example: Roger, holding position, Student Golf Lima Yankee
	public static parseAcknowledgeTraffic(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Roger, holding position, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsCriticalWord('holding');
		radioCall.assertCallEndsWithUserCallsign(false);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	// Example: Taking off, Student Golf Lima Yankee
	public static parseAnnounceTakingOff(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Taking off, ${radioCall.getTargetAllocatedCallsign()}`;

		// Although ATC can infer the takeoff from the aircraft's position/state and the callsign in this radio call, it is good practice to announce it
		radioCall.assertCallContainsConsecutiveNonCriticalWords(['taking', 'off']);
		radioCall.assertCallEndsWithUserCallsign(true);

		const atcResponse = `${radioCall.getTargetAllocatedCallsign()}, roger.`;

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseAnnounceLeavingZone(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, overhead ${radioCall.getCurrentFixName()} ${radioCall.getCurrentAltitudeString()}, changing to ${radioCall.getNextFrequencyName()} on ${radioCall.getNextFrequency()}`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsCurrentAltitude(false);
		radioCall.assertCallContainsCurrentFixName(false);
		radioCall.assertCallContainsNonCriticalWords(['changing', 'to']);
		radioCall.assertCallContainsNextFrequencyName(true);
		radioCall.assertCallContainsNextFrequency(true);

		// Return ATC response
		const atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, roger.`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	/* Parse initial contact with new ATC unit.
	Example: Student Golf Oscar Foxtrot Lima Yankee, Birmingham Radar */
	public static parseNewAirspaceInitialContact(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall
			.getCurrentTarget()
			.toLowerCase()}, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallStartsWithTargetCallsign(false);
		radioCall.assertCallContainsUserCallsign(true);

		// Return ATC response
		const atcResponse = `${radioCall
			.getTargetAllocatedCallsign()
			.toUpperCase()}, ${radioCall.getCurrentTarget()}, pass your message`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	/* Parse response to ATC unit acknowledging initial contact
call. Should consist of aircraft callsign and type, flight
rules, departure and destination airports, position,
flight level/altitude including passing/cleared level if (not
in level flight, and additional details such as next waypoint(s)
accompanied with the planned times to reach them */
	public static parseNewAirspaceGiveFlightInformationToATC(radioCall: RadioCall): ServerResponse {
		// These are not implemented yet - and must be implemented properly can't just use waypoints need stuff not technically in the route
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, ${radioCall.getAircraftType()} VFR from ${radioCall
			.getStartAirport()
			.getShortName()} to ${radioCall
			.getEndAirport()
			.getShortName()}, ${radioCall.getPositionRelativeToNearestFix()}, ${radioCall.getCurrentAltitudeString()}, VFR to ${radioCall.getNextFixName()}`;

		// TODO
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseRequestMATZPenetration(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getCurrentTarget()}, ${radioCall.getUserCallsignPhoneticsWithPrefix()}, request traffic service, MATZ and ATZ penetration`;

		radioCall.assertCallStartsWithTargetCallsign(false);
		radioCall.assertCallContainsUserCallsign(false);
		radioCall.assertCallContainsCriticalWords(['traffic', 'service']);
		radioCall.assertCallContainsCriticalWords(['matz', 'atz', 'penetration']);

		const atcResponse = `${radioCall.getTargetAllocatedCallsign()}, ${radioCall.getCurrentTarget()}, pass your message`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseMATZPenetrationReadback(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()} ${radioCall.getAircraftType()}, from ${radioCall
			.getStartAirport()
			.getShortName()} to ${radioCall
			.getEndAirport()
			.getShortName()}, ${radioCall.getPositionRelativeToNearestFix()}, ${radioCall.getCurrentAltitudeString()} ${radioCall.getCurrentAltimeterSetting()}, VFR, tracking to ${radioCall.getNextWaypointName()}, squawking ${radioCall.getSquarkCode()}, request Traffic Service, MATZ and ATZ penetration`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsAircraftType(false);
		// radioCall.assertCallContainsStartAirportName(true); // This is a critical word but not always understood by the speech recognition so commented out until we can fix
		// radioCall.assertCallContainsEndAirportName(true); // This is a critical word but not always understood by the speech recognition so commented out until we can fix
		radioCall.assertCallContainsCurrentAltitude(true);
		radioCall.assertCallContainsNextWaypointName(true);
		radioCall.assertCallContainsSqwarkCode(true);
		radioCall.assertCallContainsCriticalWords(['traffic', 'service']);
		radioCall.assertCallContainsCriticalWords(['matz', 'atz', 'penetration']);

		const atcResponse = `${radioCall.getTargetAllocatedCallsign()}, sqwuak ${radioCall.getSquarkCode()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseSqwuak(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Sqwuak ${radioCall.getSquarkCode()}, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsNonCriticalWord('sqwuak');
		radioCall.assertCallContainsSqwarkCode(true);
		radioCall.assertCallEndsWithUserCallsign(false);

		const atcResponse = `${radioCall.getTargetAllocatedCallsign()}, identified ${radioCall.getPositionRelativeToNearestFix()}, Traffic Service`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseAcknowledgeTrafficService(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Traffic Service, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsCriticalWords(['traffic', 'service']);
		radioCall.assertCallEndsWithUserCallsign(false);

		const atcResponse = `${radioCall.getTargetAllocatedCallsign()}, descend to height ${radioCall.getMATZPenetrationHeight()} for MATZ penetration. ${radioCall.getATCPressureReading()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseMATZPenetrationTrafficServiceReadback(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Descend to height ${radioCall.getMATZPenetrationHeight()}, ${radioCall.getATCPressureReading()}, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsMATZPenetrationHeight(true);
		radioCall.assertCallContainsATCPressureReading(true);
		radioCall.assertCallEndsWithUserCallsign(false);

		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseAnnounceReachingMATZPenetrationHeight(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, reaching height ${radioCall.getMATZPenetrationHeight()}`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsMATZPenetrationHeight(true);

		const atcResponse = `${radioCall.getTargetAllocatedCallsign()}, maintain height ${radioCall.getMATZPenetrationHeight()}, MATZ and ATZ penetration approved`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseLeavingMATZFrequencyChangeRequest(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Roger ${radioCall.getTargetAllocatedCallsign()}, ${radioCall.getATCPressureReading()}, request change to ${radioCall.getNextFrequencyName()} ${radioCall.getNextFrequency()}`;

		radioCall.assertCallContainsUserCallsign(false);
		radioCall.assertCallContainsCriticalWords(['request', 'change']);

		const atcResponse = `${radioCall.getTargetAllocatedCallsign()}, radar service terminated, sqwuak 7000, freecall ${radioCall.getNextFrequencyName()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	/* Parse response to ATC unit requesting squark.
Should consist of aircraft callsign and squark code */
	public static parseNewAirspaceSquark(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Squawk ${radioCall.getSquarkCode()}, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsSqwarkCode(true);
		radioCall.assertCallEndsWithUserCallsign(false);

		// These are not implemented yet - and must be implemented properly can't just use waypoints need stuff not technically in the route
		const atcResponse = `${radioCall
			.getTargetAllocatedCallsign()
			.toUpperCase()}, identified ${radioCall.getPositionRelativeToNearestFix()}. Next report at ${radioCall.getNextFixName()}`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	/* Parse Wilco in response to an instruction from ATC unit.
Should consist of Wilco followed by aircraft callsign */
	public static parseWILCO(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Wilco, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsWilco(true);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	/* Parse Roger in response to an instruction from ATC unit which
	requires no readback. Should consist of Roger followed by aircraft
	callsign or simply just the aircraft callsign alone. */
	public static parseRoger(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Roger, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsRoger(true);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	/* Parse VFR position report.
Should contain the aircraft callsign, location relative to a waypoint,
and the flight level/altitude including passing level and cleared level
if (not in level flight. */
	public static parseVFRPositionReport(radioCall: RadioCall): ServerResponse {
		// May need more details to be accurate to specific situation
		const expectedRadioCall: string = `
        ${radioCall.getTargetAllocatedCallsign()}, ${radioCall.getClosestVRPName()} ${radioCall.getCurrentTime()}, ${radioCall.getCurrentAltitude()} feet, ${radioCall.getNextWaypointName()} ${radioCall.getNextWaypointArrivalTime()}`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsClosestVRPName(true);
		radioCall.assertCallContainsAltitude(true);

		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseRequestJoin(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getCurrentTarget()}, ${radioCall.getTargetAllocatedCallsign()}, request join`;

		radioCall.assertCallStartsWithTargetCallsign(false);
		radioCall.assertCallContainsUserCallsign(false);
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

		radioCall.assertCallStartsWithUserCallsign(true);
		radioCall.assertCallContainsAircraftType(false);
		radioCall.assertCallContainsPreviousWaypointName(false);
		radioCall.assertCallContainsPositionRelativeToLastWaypoint(false);
		radioCall.assertCallContainsCurrentAltitude(true);
		radioCall.assertCallContainsCurrentATISLetter(true);
		radioCall.assertCallContainsConsecutiveCriticalWords(['request', 'overhead', 'join']);

		const atcResponse = `${radioCall
			.getTargetAllocatedCallsign()
			.toUpperCase()}, join overhead runway ${radioCall.getLandingRunwayName()}, height ${radioCall.getOverheadJoinAltitude()} ${radioCall
			.getEndAirportMETORSample()
			.getPressureString()}, report airport in sight`;

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseOverheadJoinClearanceReadback(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, join overhead runway ${radioCall.getLandingRunwayName()}, height ${radioCall.getOverheadJoinAltitude()}, ${radioCall
			.getEndAirportMETORSample()
			.getPressureString()}, wilco, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['join', 'overhead']);
		radioCall.assertCallContainsLandingRunwayName(true);
		radioCall.assertCallContainsLandingPressure(true);
		radioCall.assertCallEndsWithUserCallsign(false);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseAnnounceAirportInSight(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, airport in sight`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsConsecutiveCriticalWords(['airport', 'in', 'sight']);

		let atcResponse = '';
		if (radioCall.getEndAirport().isControlled()) {
			atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, contact ${radioCall
				.getEndAirport()
				.getShortName()} tower on ${radioCall.getEndAirport().getTowerFrequency()?.value}`;
		}

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseLandingContactTower(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getEndAirport().getShortName()} tower ${
			radioCall.getEndAirport().getTowerFrequency()?.value
		}, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords([
			radioCall.getEndAirport().getShortName(),
			'tower'
		]);
		radioCall.assertCallEndsWithUserCallsign(true);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseAcknowledgeGoAroundInstruction(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Going around ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['going', 'around']);
		radioCall.assertCallEndsWithUserCallsign(false);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseAnnounceGoAround(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Going around, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['going', 'around']);
		radioCall.assertCallEndsWithUserCallsign(false);

		let atcResponse = '';
		if (radioCall.getEndAirport().isControlled()) {
			atcResponse = `Roger, ${radioCall
				.getTargetAllocatedCallsign()
				.toUpperCase()}, contact ${radioCall.getEndAirport().getShortName()} tower on ${
				radioCall.getEndAirport().getTowerFrequency()?.value
			}`;
		}

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseAnnounceFinal(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, final`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsCriticalWord('final');

		let atcResponse = '';
		if (radioCall.getEndAirport().isControlled()) {
			atcResponse = `${radioCall
				.getTargetAllocatedCallsign()
				.toUpperCase()}, continue approach, ${radioCall.getLandingTraffic()}`;
		} else {
			atcResponse = `${radioCall
				.getTargetAllocatedCallsign()
				.toUpperCase()}, surface wind ${radioCall
				.getEndAirportMETORSample()
				.getWindDirectionString()} ${radioCall
				.getEndAirportMETORSample()
				.getWindSpeedString()}. ${radioCall.getLandingTraffic()}`;
		}
		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseContinueApproachReadback(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Continue approach, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['continue', 'approach']);
		radioCall.assertCallEndsWithUserCallsign(false);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseLandingClearanceReadback(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Cleared to land, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsConsecutiveCriticalWords(['cleared', 'to', 'land']);
		radioCall.assertCallEndsWithUserCallsign(false);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}

	public static parseAcklowledgeVacateRunwayInstruction(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Taxi to the end, wilco, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsCriticalWords(['taxi', 'end']);
		radioCall.assertCallContainsWilco(true);
		radioCall.assertCallEndsWithUserCallsign(false);

		let atcResponse = '';
		if (radioCall.getEndAirport().isControlled()) {
			atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, contact ${radioCall
				.getEndAirport()
				.getShortName()} tower on ${radioCall.getEndAirport().getTowerFrequency()?.value}`;
		}

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseAnnounceRunwayVacated(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `${radioCall.getTargetAllocatedCallsign()}, runway vacated`;

		radioCall.assertCallStartsWithUserCallsign(false);
		radioCall.assertCallContainsCriticalWord('vacated');

		let atcResponse = '';
		if (radioCall.getEndAirport().isControlled()) {
			atcResponse = `${radioCall
				.getTargetAllocatedCallsign()
				.toUpperCase()}, taxi to ${radioCall.getLandingParkingSpot()}`;
		} else {
			atcResponse = `${radioCall.getTargetAllocatedCallsign().toUpperCase()}, roger`;
		}

		return new ServerResponse(radioCall.getFeedback(), atcResponse, expectedRadioCall);
	}

	public static parseTaxiParkingSpotReadback(radioCall: RadioCall): ServerResponse {
		const expectedRadioCall: string = `Taxi to ${radioCall.getLandingParkingSpot()}, ${radioCall.getTargetAllocatedCallsign()}`;

		radioCall.assertCallContainsCriticalWord('taxi');
		radioCall.assertCallContainsLandingParkingSpot(false);
		radioCall.assertCallEndsWithUserCallsign(false);

		// ATC does not respond to this message
		return new ServerResponse(radioCall.getFeedback(), '', expectedRadioCall);
	}
}
