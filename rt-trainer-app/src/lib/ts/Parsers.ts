import { type CallParsingData, type SimulatorUpdateData, Mistake, type Seed } from "./ServerClientTypes";
import Route, { type RoutePoint } from "./Route";
import { getGetDepartInfoReadbackSimulatorUpdateData, getGetTaxiClearenceReadbackSimulatorUpdateData, getRadioCheckSimulatorUpdateData, getTaxiRequestSimulatorUpdateData } from "./RouteStates";
import { getAbbreviatedCallsign } from "./utils";
import type { Aerodrome, FlightRules, METORDataSample, Runway, Waypoint } from "./SimulatorTypes";

export function parseRadioCheck(
    seed: Seed,
    radioCheck: string,
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    const expectedRadioCall: string = `${parsingData.currentTarget.callsign}, ${parsingData.callsign}, radio check ${parsingData.currentRadioFrequency}`;
    const messageWords: string[] = radioCheck.split(' ');
    const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);
    let radioFreqIndex: number = -1;

    // Check if the radio frequency is included in the message
    for (let i = 0; i < messageWords.length; i++) {
        if (messageWords[i].includes('.')) {
            radioFreqIndex = i;
        }
    }

    // If radio frequency not found return an error
    if (radioFreqIndex == -1) {
        return new Mistake(expectedRadioCall, radioCheck, "Frequency missing");
    }

    // Convert frequency string to float and check it is a valid frequency and equal to the correct frequency
    const radioFreqStated: number = +messageWords[radioFreqIndex];
    if (isNaN(radioFreqStated)) {
        return new Mistake(expectedRadioCall, radioCheck, "Frequency not recognised");
    } else if (radioFreqStated != parsingData.currentRadioFrequency) {
        return new Mistake(expectedRadioCall, radioCheck, "Frequency incorrect");
    }

    // Split the callsign into its words and do something else not sure what
    const callsignExpected: string = parsingData.currentTarget.callsign.toLowerCase();
    const callsignWords: string[] = callsignExpected.split(' ');
    for (let i = 0; i < callsignWords.length; i++) {
        if (messageWords[i] != callsignWords[i]) {
            return new Mistake(expectedRadioCall, radioCheck, "Callsign not recognised");
        }
    }

    // Not sure what this does
    if (messageWords[callsignWords.length] != parsingData.callsign.toLowerCase()) {
        return new Mistake (
            expectedRadioCall,
            radioCheck,
                `Callsign not recognised: ${messageWords.slice(callsignWords.length).join(" ")}`,
        );
    }

    // Check the message contains "radio check"
    if (messageWords[radioFreqIndex - 2] != "radio"
        || messageWords[radioFreqIndex - 1] != "check")
    {
        return new Mistake (
            expectedRadioCall,
            radioCheck,
            "Expected 'radio check' in message"
        );
    }

    // Trailing 0s lost when frequency string parsed to float, hence comparison of floats rather than strings
    if (radioFreqStated != parsingData.currentRadioFrequency) {
        return new Mistake (
            expectedRadioCall,
            radioCheck,
            `Frequency incorrect: ${radioFreqStated} \n Expected: ${parsingData.currentRadioFrequency}`);
    }

    const atcResponse: string = `${parsingData.callsign}, ${parsingData.currentTarget.callsign}, reading you 5`;

    return getRadioCheckSimulatorUpdateData(seed);
}

export function parseDepartureInformationRequest(
    seed: Seed,
    departureInformationRequest: string,
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    const expectedRadiocall = `${parsingData.callsign.toLowerCase()} request departure information`;
        
    const messageWords: string[] = departureInformationRequest.split(' ');
    const callsignExpected: string = parsingData.callsign.toLowerCase();
    const callsignWords: string[] = callsignExpected.split(' ');
    for (let i = 0; i < callsignWords.length; i++) {
        if (messageWords[i] != callsignWords[i]) {
            return new Mistake (expectedRadiocall, departureInformationRequest, "Remeber to include your whole callsign in your message");
        }
    }

    const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);

    const metorSample: METORDataSample = Route.getMETORSample(seed, startAerodrome.metorData);
    const runwayIndex: number = seed.scenarioSeed % startAerodrome.runways.length;
    const runway: Runway = startAerodrome.runways[runwayIndex];

    if (!departureInformationRequest.search("request departure information")) {
        return new Mistake (
            expectedRadiocall,
            departureInformationRequest,
            "Make sure to include the departure information request in your message."
        );
    }

    // Figure out airport runway, come up with some wind, pressure, temp and dewpoint numbers
    const atcresponse: string = 
        `${getAbbreviatedCallsign(
            seed.scenarioSeed,
            parsingData.aircraftType,
            parsingData.targetAllocatedCallsign
        )}, runway ${runway.name}, wind ${metorSample.windDirection} degrees ${metorSample.windSpeed} knots, QNH ${metorSample.pressure}, temperature ${metorSample.temperature} dewpoint ${metorSample.dewpoint}`;


    return getGetDepartInfoReadbackSimulatorUpdateData(seed);
}

export function parseDepartureInformationReadback(
    seed: Seed,
    departureInformationReadback: string,
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    const startAerodrome = Route.getStartAerodrome(seed);

    const metorSample: METORDataSample = Route.getMETORSample(seed, startAerodrome.metorData);
    const runwayindex: number = seed.scenarioSeed % startAerodrome.runways.length;
    const runway: Runway = startAerodrome.runways[runwayindex];

    const runwaystring: string = `runway ${runway.name}`;
    const pressurestring: string = `qnh ${metorSample.pressure}`;

    const expectedradiocall: string = `${parsingData.callsign.toLowerCase()} runway ${runway.name.toLowerCase()} qnh ${metorSample.pressure} ${parsingData.callsign.toLowerCase()}`;

    const messagewords: string[] = departureInformationReadback.split(' ');

    if (!departureInformationReadback.search(runwaystring)
        || !departureInformationReadback.search(pressurestring)
        || messagewords[messagewords.length - 1]
            != parsingData.targetAllocatedCallsign.toLowerCase())
    {
        return new Mistake (
            expectedradiocall,
            departureInformationReadback,
            "Make sure to include the runway and air pressure in your readback."
        );
    }

    // ATC does not respond to this message
    const atcresponse: string = '';

    return getTaxiRequestSimulatorUpdateData(seed);
}

export function parseTaxiRequest(
    seed: Seed,
    taxiRequest: string,
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);
    const endAerodrome: Aerodrome = Route.getEndAerodrome(seed);
    const metorSample: METORDataSample =
        Route.getMETORSample(seed, startAerodrome.metorData);

    const runwayindex: number = seed.scenarioSeed % startAerodrome.runways.length;
    const runway: Runway = startAerodrome.runways[runwayindex];
    const expectedradiocall: string = `${parsingData.targetAllocatedCallsign.toLowerCase()} ${ parsingData.aircraftType.toLowerCase()} at ${ startAerodrome.startPoint.toLowerCase()} request taxi VFR to ${endAerodrome.name.toLowerCase()}`;

    const messagewords: string[] = taxiRequest.split(' ');

    if (messagewords[0] != parsingData.targetAllocatedCallsign.toLowerCase()
        || messagewords[1] != parsingData.aircraftType.toLowerCase()
        || messagewords.find(x => x == startAerodrome.startPoint.toLowerCase())
        || messagewords.find(x => x == endAerodrome.name.toLowerCase()))
    {
        return new Mistake (
            expectedradiocall,
            taxiRequest,
            "Make sure to include the aircraft type, start point and destination in your request.");
    }

    const atcresponse: string = `${parsingData.targetAllocatedCallsign}, taxi to holding point ${runway.holdingPoints[0].name}, runway ${runway.name}, QNH ${metorSample.pressure}`;

    return getGetTaxiClearenceReadbackSimulatorUpdateData(seed);
}

export function parseTaxiReadback(
    seed: Seed,
    taxiRequest: string,
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    const messageWords: string[] = taxiRequest.split(' ');

    const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);
    const endAerodrome: Aerodrome = Route.getEndAerodrome(seed);

    const metorsample: METORDataSample = Route.getMETORSample(seed, startAerodrome.metorData);

    const runwayIndex: number = seed.scenarioSeed % startAerodrome.runways.length;
    const runway: Runway = startAerodrome.runways[runwayIndex];

    const expectedradiocall: string = `${parsingData.targetAllocatedCallsign.toLowerCase()} taxi holding point ${runway.holdingPoints[0].name.toLowerCase()} runway ${runway.name.toLowerCase()} qnh ${ metorsample.pressure} ${parsingData.targetAllocatedCallsign.toLowerCase()}`;

    if (!(taxiRequest.search("taxi holding point")
        || taxiRequest.search("taxi to holding point"))
        || !messageWords.find(x => x == runway.holdingPoints[0].name.toLowerCase())
        || messageWords[messageWords.length - 1]
            != parsingData.targetAllocatedCallsign.toLowerCase())
    {
        return new Mistake (
            expectedradiocall,
            taxiRequest,
            "Make sure to include the holding point and runway in your readback.");
    }

    const atcResponse: string = '';

    const nextstate: SentState = SentState {
        status: StatusTaxiing {
            stage: TaxiingStagePreReadyForDeparture,
        },
        pose: Pose {
            location: startandendaerodrome.0.location,
            altitude: startandendaerodrome.0.altitude,
            heading: 0,
            airspeed: 0,
        },
        currenttarget: COMFrequency {
            frequencytype: currentstate.currenttarget.frequencytype,
            frequency: currentstate.currenttarget.frequency,
            callsign: currentstate.currenttarget.callsign.clone(),
        },
        prefix: currentstate.prefix, // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign,
        callsignmodified: currentstate.targetallocatedcallsign, // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype,
    };
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
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    const expectedradiocall: string = `${parsingData.currentTarget.callsign.toLowerCase()}, ${parsingData.callsign.toLowerCase()}`;

    if (!radioCall.search(
        parsingData
            .currentTarget
            .callsign
            .toLowerCase()
    )) {
        return new Mistake (
            expectedradiocall,
            radioCall,
            "Remember to include the target callsign at the start of your initial message."
        );
    }

    if (!radioCall.search(parsingData.callsign.toLowerCase())) {
        return new Mistake (
            expectedradiocall,
            radioCall,
            "Remember to include your own callsign in your initial message."
        );
    }

    const messagewords: string[] = radioCall.split(' ');
    const callsignexpected: string = parsingData.callsign.toLowerCase();
    const callsignwords: string[] = callsignexpected.split(' ');
    const targetcallsignexpected: string =
        parsingData.currentTarget.callsign.toLowerCase();
    const targetcallsignwords: string[] = targetcallsignexpected
        .split(' ');

    if (messagewords.length > callsignwords.length + targetcallsignwords.length) {
        return new Mistake (
            expectedradiocall,
            radioCall,
            "Keep your calls brief."
        );
    }

    const atcResponse: string = `${parsingData.callsign}, ${parsingData.currentTarget.callsign}.`;

    const nextstate: SentState = SentState {
        status: StatusAirborne {
            // These need to be updated with the information for the next waypoint
            flightrules: flightrules,
            altitude: altitude,
            heading: heading,
            speed: speed,
            currentpoint: currentpoint,
            airborneevent: WaypointStagePreNewAirspaceFlightDetailsGiven,
        },
        pose: Pose {
            location: currentpoint.location,
            altitude: 0,
            heading: 0,
            airspeed: 0,
        },
        currenttarget: COMFrequency {
            frequencytype: currentstate.currenttarget.frequencytype,
            frequency: currentstate.currenttarget.frequency,
            callsign: currentstate.currenttarget.callsign.clone(),
        },
        prefix: currentstate.prefix, // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign,
        callsignmodified: currentstate.targetallocatedcallsign, // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype,
    };
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
    currentPoint: RoutePoint,
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);
    const endAerodrome: Aerodrome = Route.getEndAerodrome(seed);

    const nearestwaypoint: string = "Test Waypoint";
    const distancefromnearestwaypoint: number = 0.0;
    const directiontonearestwaypoint: string = "Direction";

    const nextwaypoint: string = "Next Waypoint";

    const expectedRadioCall: string = `${parsingData.prefix.toLowerCase()} ${parsingData.callsign.toLowerCase()}, ${parsingData.aircraftType.toLowerCase()} ${flightRules.tostring()} from ${startAerodrome.name.toLowerCase()} to ${endAerodrome.name.toLowerCase()}, ${distancefromnearestwaypoint} miles ${directiontonearestwaypoint} of ${nearestwaypoint}, ${altitude}, ${nextwaypoint}`;

    if (!radioCall.search(
        parsingData
            .currentTarget
            .callsign
            .toLowerCase()
    )) {
        return new Mistake (
            expectedRadioCall,
            radioCall,
            "Remember to include the target callsign at the start of your initial message.",
        );
    }

    if (!radioCall.search(parsingData.callsign.toLowerCase())) {
        return new Mistake (
            expectedRadioCall,
            radioCall,
            "Remember to include your own callsign in your initial message.");
    }

    const atcresponse: string = '';

    // -----------------------------------------------------------------------------------------
    // Current target and current point need to be updated here with next waypoint
    // -----------------------------------------------------------------------------------------
    const nextstate: SentState = SentState {
        status: StatusAirborne {
            // These need to be updated with the information for the next waypoint
            flightrules: flightrules,
            altitude: altitude,
            heading: heading,
            speed: speed,
            currentpoint: currentpoint,
            airborneevent: WaypointStagePreNewAirspaceFlightDetailsGiven,
        },
        pose: Pose {
            location: currentpoint.location,
            altitude: 0,
            heading: 0,
            airspeed: 0,
        },
        currenttarget: COMFrequency {
            frequencytype: currentstate.currenttarget.frequencytype,
            frequency: currentstate.currenttarget.frequency,
            callsign: currentstate.currenttarget.callsign.clone(),
        },
        prefix: currentstate.prefix, // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign,
        callsignmodified: currentstate.targetallocatedcallsign, // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype,
    };
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
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    const expectedRadioCall: string = `Squawk ${sqwarkFrequency}, ${parsingData.prefix.toLowerCase()} ${parsingData.targetAllocatedCallsign.toLowerCase()}`;

    if (!radioCall.search(sqwarkFrequency.toString())) {
        return new Mistake (
            expectedRadioCall,
            radioCall,
            "Remember to include the sqwark code at the start of your initial message."
        );
    }

    if (!radioCall.search(parsingData.callsign.toLowerCase())) {
        return new Mistake (
            expectedRadioCall,
            radioCall,
            "Remember to include your own callsign in your initial message.",
        );
    }

    const nearestWaypoint: string = "Test Waypoint";
    const distanceFromNearestWaypoint: number = 0.0;
    const directionToNearestWaypoint: string = "Direction";
    const nextWayPoint: string = "Next Waypoint";

    const atcresponse: string = 
        `${parsingData.prefix} ${parsingData.targetAllocatedCallsign}, identified ${nearestWaypoint} miles ${distanceFromNearestWaypoint} of ${directionToNearestWaypoint}. Next report at ${nextWayPoint}`;

    const nextstate: SentState = SentState {
        status: StatusAirborne {
            // These need to be updated with the information for the next waypoint
            flightrules: flightrules,
            altitude: altitude,
            heading: heading,
            speed: speed,
            currentpoint: currentpoint,
            airborneevent: WaypointStagePreWilco,
        },
        pose: Pose {
            location: currentpoint.location,
            altitude: 0,
            heading: 0,
            airspeed: 0,
        },
        currenttarget: COMFrequency {
            frequencytype: currentstate.currenttarget.frequencytype,
            frequency: currentstate.currenttarget.frequency,
            callsign: currentstate.currenttarget.callsign.clone(),
        },
        prefix: currentstate.prefix, // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign,
        callsignmodified: shortencallsign(
            scenarioSeed,
            currentstate.aircrafttype,
            currentstate.callsign,
        ), // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype,
    };
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
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    const expectedRadioCall: string = `Wilco, ${parsingData.prefix.toLowerCase()} ${parsingData.targetAllocatedCallsign.toLowerCase()}`;

    if (!radioCall.search("wilco")
        || !radioCall.search("will comply"))
    {
        return new Mistake (
            expectedRadioCall, radioCall, "Remember to include wilco at the start of your initial message.");
    }

    if (!radioCall.search(parsingData.callsign.toLowerCase())) {
        return new Mistake (
            expectedRadioCall, radioCall, "Remember to include your own callsign in your initial message."
        );
    }

    const atcResponse: string = '';

    const nextstate: SentState = SentState {
        status: StatusAirborne {
            // These need to be updated with the information for the next waypoint
            flightrules: flightrules,
            altitude: altitude,
            heading: heading,
            speed: speed,
            currentpoint: currentpoint,
            airborneevent: WaypointStagePreWilco,
        },
        pose: Pose {
            location: currentpoint.location,
            altitude: 0,
            heading: 0,
            airspeed: 0,
        },
        currenttarget: COMFrequency {
            frequencytype: currentstate.currenttarget.frequencytype,
            frequency: currentstate.currenttarget.frequency,
            callsign: currentstate.currenttarget.callsign.clone(),
        },
        prefix: currentstate.prefix, // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign,
        callsignmodified: shortencallsign(
            scenarioSeed,
            currentstate.aircrafttype,
            currentstate.callsign,
        ), // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype,
    };
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
    currentPoint: RoutePoint,
    currentState: CallParsingData,
) : SimulatorUpdateData | Mistake {
    // May need more details to be accurate to specific situation
    const expectedRadioCall: string = format!(
        "{0} {1}, overhead {2}, {3} feet",
        currentState.prefix.toLowerCase(),
        currentState.targetallocatedcallsign.toLowerCase(),
        currentPoint.name.toLowerCase(),
        altitude,
    );

    if (!radioCall.contains(currentState.callsign.toLowerCase())) {
        return Mistake (
            expectedRadioCall, radioCall, "Remember to include your own callsign at the start of your radio call.");
    }

    if (!radioCall.contains(currentPoint.name.toLowerCase())) {
        return new Mistake (
            expectedRadioCall, radioCall, "Remember to include your current location in your radio call.");
    }

    if (!radioCall.contains(altitude.tostring().toLowerCase())) {
        return new Mistake (
            expectedRadioCall, radioCall, "Remember to include your altitude in your radio call.");
    }

    const atcResponse: string = '';

    // Logic required to figure out next state
    const nextstate: SentState = SentState {
        status: StatusAirborne {
            // These need to be updated with the information for the next waypoint
            flightrules: flightrules,
            altitude: altitude,
            heading: heading,
            speed: speed,
            currentPoint: currentPoint,
            airborneevent: WaypointStagePreWilco,
        },
        pose: Pose {
            location: currentpoint.location,
            altitude: 0,
            heading: 0,
            airspeed: 0,
        },
        currenttarget: COMFrequency {
            frequencytype: currentstate.currenttarget.frequencytype,
            frequency: currentstate.currenttarget.frequency,
            callsign: currentstate.currenttarget.callsign.clone(),
        },
        prefix: currentstate.prefix, // Set by user: none, student, helicopter, police, etc...
        callsign: currentstate.callsign,
        callsignmodified: shortencallsign(
            scenarioSeed,
            currentstate.aircrafttype,
            currentstate.callsign,
        ), // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype,
    };
}

