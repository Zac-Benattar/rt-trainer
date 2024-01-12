import { type Aerodrome, type CallParsingData, type CallParsingDataMessage, type SimulatorUpdateData, Mistake } from "./States";
import Route from "./Route";
import { getRadioCheckSimulatorUpdateData } from "./RouteStates";

export function parseRadioCheck(
    scenarioSeed: number,
    radioCheck: string,
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    let expectedRadioCall: string = `${parsingData.currentTarget.callsign}, ${parsingData.callsign}, radio check ${parsingData.currentRadioFrequency}`;
    let messageWords: string[] = radioCheck.split(' ');
    let startAerodrome: Aerodrome = Route.getStartAerodrome(scenarioSeed);
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
    let radioFreqStated: number = +messageWords[radioFreqIndex];
    if (isNaN(radioFreqStated)) {
        return new Mistake(expectedRadioCall, radioCheck, "Frequency not recognised");
    } else if (radioFreqStated != parsingData.currentRadioFrequency) {
        return new Mistake(expectedRadioCall, radioCheck, "Frequency incorrect");
    }

    // Split the callsign into its words and do something else not sure what
    let callsignExpected: string = parsingData.currentTarget.callsign.toLowerCase();
    let callsignWords: string[] = callsignexpected.split(' ');
    for (let i = 0; i < callsignWords.length; i++) {
        if (messageWords[i] != callsignWords[i]) {
            return new Mistake(expectedRadioCall, radioCheck, "Callsign not recognised");
        }
    }

    // Not sure what this does
    if (messageWords[callsignWords.length] != parsingData.callsign.toLowerCase()) {
        return new Mistake (
            expectedradiocall,
            radioCheck,
                `Callsign not recognised: ${messageWords.slice(callsignWords.length).join(" ")}`,
        );
    }

    // Check the message contains "radio check"
    if (messageWords[radioFreqIndex - 2] != "radio"
        || messageWords[radioFreqIndex - 1] != "check")
    {
        return new Mistake (
            expectedradiocall,
            radioCheck,
            "Expected 'radio check' in message"
        );
    }

    // Trailing 0s lost when frequency string parsed to float, hence comparison of floats rather than strings
    if (radioFreqStated != parsingData.currentRadioFrequency) {
        return new Mistake (
            expectedradiocall,
            radioCheck,
                `Frequency incorrect: ${radioFreqStated} \n Expected: ${parsingData.currentRadioFrequency}`);
    }

    let atcResponse: string = `${parsingData.callsign}, ${parsingData.currentTarget.callsign}, reading you 5`;

    return getRadioCheckSimulatorUpdateData(scenarioSeed);
}

export function parseDepartureInformationRequest(
    scenarioSeed: number,
    weatherSeed: number,
    departureInformationRequest: string,
    currentState: CallParsingData,
) : SimulatorUpdateData | Mistake {
    let expectedradiocall = format!(
        "{0} request departure information",
        currentstate.callsign.toLowerCase()
    );

    let messagewords: string[] = departureinformationrequest
        .splitwhitespace()
        .collect<string[]>();
    let callsignExpected: string = currentState.callsign.toLowerCase();
    let callsignWords: string[] = callsignExpected.split(' ');
    for (let i = 0; i < callsignWords.length; i++) {
        if (messagewords[i] != callsignwords[i] {
            return Ok(ServerResponseMistake(Mistake {
                callexpected: format!(
                    "{0} request departure information",
                    currentstate.callsign.toLowerCase()
                ),
                details: "Remeber to include your whole callsign in your message".tostring(),
                callfound: departureinformationrequest.tostring(),
            }));
        }
    }

    let startandendaerodrome: (Aerodrome, Aerodrome) =
        match getstartandendaerodromes(*scenarioSeed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Errormsg("Aerodromes not generated"));
            }
        };

    let metorsample: cratemodelsaerodromeMETORDataSample =
        getmetorsample(*weatherseed, startandendaerodrome.0.metordata.clone());
    let runwayindex: usize =
        (scenarioSeed % (startandendaerodrome.0.runways.len() as number)) as usize;
    let runway: Runway = match startandendaerodrome.0.runways.get(runwayindex) {
        Some(runway) => runway,
        None => {
            return Ok(ServerResponseMistake(Mistake {
                callexpected: expectedradiocall,
                details: "Runway not recognised".tostring(),
                callfound: departureinformationrequest.tostring(),
            }));
        }
    };

    if (!departureinformationrequest.contains("request departure information") {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: format!(
                "{0} request departure information",
                currentstate.callsign.toLowerCase()
            ),
            details: format!(
                "Make sure to include the departure information request in your message.",
            ),
            callfound: departureinformationrequest.tostring(),
        }));
    }

    // Figure out airport runway, come up with some wind, pressure, temp and dewpoint numbers
    let atcresponse: string = format!(
        "{0}, runway {1}, wind {2} degrees {3} knots, QNH {4}, temperature {5} dewpoint {6}",
        shortencallsign(
            scenarioSeed,
            currentstate.aircrafttype,
            currentstate.callsign
        ),
        runway.name,
        metorsample.winddirection,
        metorsample.windspeed,
        metorsample.pressure,
        metorsample.temp,
        metorsample.dewpoint,
    );

    let nextstate = match getpredepartinforeadbackstage(*scenarioSeed) {
        Ok(stage) => stage,
        Err() => {
            return Err(Errormsg("Could not get pre-requesting departure information stage"));
        }
    };

    Ok(ServerResponseStateMessage(SentStateMessage {
        state: nextstate,
        message: atcresponse,
    }))
}

export function parseDepartureInformationReadback(
    scenarioSeed: number,
    weatherseed: number,
    departureinformationreadback: string,
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    const startAerodrome = Route.getStartAerodrome(scenarioSeed);

    let metorsample: cratemodelsaerodromeMETORDataSample =
        getmetorsample(*weatherseed, startandendaerodrome.0.metordata.clone());
    let runwayindex: usize =
        (scenarioSeed % (startandendaerodrome.0.runways.len() as number)) as usize;
    let runway: Runway = match startandendaerodrome.0.runways.get(runwayindex) {
        Some(runway) => runway,
        None => {
            return Err(Errormsg("Runway not generated"));
        }
    };

    let runwaystring: string = format!("runway {}", runway.name);
    let pressurestring: string = format!("qnh {}", metorsample.pressure,);

    let expectedradiocall: string = format!(
        "{0} runway {1} qnh {2} {3}",
        parsingData.targetallocatedcallsign.toLowerCase(),
        runway.name.toLowerCase(),
        metorsample.pressure,
        parsingData.targetallocatedcallsign.toLowerCase()
    );

    let messagewords: string[] = departureinformationreadback
        .splitwhitespace()
        .collect<string[]>();

    if (!departureinformationreadback.contains(runwaystring.asstr())
        || !departureinformationreadback.contains(pressurestring.asstr())
        || messagewords[messagewords.len() - 1]
            != parsingData.targetallocatedcallsign.toLowerCase()
    {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!("Make sure to include the runway and air pressure in your readback.",),
            callfound: departureinformationreadback.tostring(),
        }));
    }

    // ATC does not respond to this message
    let atcresponse: string = stringnew();

    let nextstate = match getpretaxirequeststage(*scenarioSeed) {
        Ok(stage) => stage,
        Err() => {
            return Err(Errormsg("Could not get pre-requesting departure information stage"));
        }
    };

    Ok(ServerResponseStateMessage(SentStateMessage {
        state: nextstate,
        message: atcresponse,
    }))
}

export function parseTaxiRequest(
    scenarioSeed: number,
    weatherSeed: number,
    taxiRequest: string,
    parsingData: CallParsingData,
) : SimulatorUpdateData | Mistake {
    let startandendaerodrome: (Aerodrome, Aerodrome) =
        match getstartandendaerodromes(*scenarioSeed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Errormsg("Aerodromes not generated"));
            }
        };
    let metorsample: cratemodelsaerodromeMETORDataSample =
        getmetorsample(*weatherseed, startandendaerodrome.0.metordata.clone());

    let runwayindex: usize =
        (scenarioSeed % (startandendaerodrome.0.runways.len() as number)) as usize;
    let runway: Runway = match startandendaerodrome.0.runways.get(runwayindex) {
        Some(runway) => runway.toowned(),
        None => {
            return Err(Errormsg("Runway not generated"));
        }
    };

    let expectedradiocall: string = format!(
        "{0} {1} at {2} request taxi VFR to {3}",
        currentstate.targetallocatedcallsign.toLowerCase(),
        currentstate.aircrafttype.toLowerCase(),
        startandendaerodrome.0.startpoint.toLowerCase(),
        startandendaerodrome.1.name.toLowerCase(),
    );

    let messagewords: string[] = taxirequest.split(' ');

    if (messagewords[0] != currentstate.targetallocatedcallsign.toLowerCase()
        || messagewords[1] != currentstate.aircrafttype.toLowerCase()
        || messagewords.contains(
            startandendaerodrome
                .0
                .startpoint
                .toLowerCase()
                .asstr(),
        )
        || messagewords.contains(startandendaerodrome.1.name.toLowerCase().asstr())
    {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!(
                "Make sure to include the aircraft type, start point and destination in your request.",
            ),
            callfound: taxirequest.tostring(),
        }));
    }

    let atcresponse: string = format!(
        "{0}, taxi to holding point {1}, runway {2}, QNH {3}",
        currentstate.targetallocatedcallsign,
        runway.holdingpoints[0].name,
        runway.name,
        metorsample.pressure,
    );

    let nextstate = match getpretaxiclearancereadbackstage(*scenarioSeed) {
        Ok(stage) => stage,
        Err() => {
            return Err(Errormsg("Could not get pre-requesting departure information stage"));
        }
    };

    Ok(ServerResponseStateMessage(SentStateMessage {
        state: nextstate,
        message: atcresponse,
    }))
}

 parsetaxireadback(
    scenarioSeed: number,
    weatherseed: number,
    taxirequest: string,
    currentstate: CallParsingData,
) : SimulatorUpdateData | Mistake {
    let messagewords: string[] = taxirequest.split(' ');

    let startandendaerodrome: (Aerodrome, Aerodrome) =
        match getstartandendaerodromes(*scenarioSeed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Errormsg("Aerodromes not generated"));
            }
        };

    let metorsample: cratemodelsaerodromeMETORDataSample =
        getmetorsample(*weatherseed, startandendaerodrome.0.metordata.clone());

    let runwayindex: usize =
        (scenarioSeed % (startandendaerodrome.0.runways.len() as number)) as usize;
    let runway: cratemodelsaerodromeRunway =
        match startandendaerodrome.0.runways.get(runwayindex) {
            Some(runway) => runway,
            None => {
                return Err(Errormsg("Runway not generated"));
            }
        };

    let expectedradiocall: string = format!(
        "{0} taxi holding point {1} runway {2} qnh {3} {4}",
        currentstate.targetallocatedcallsign.toLowerCase(),
        runway.holdingpoints[0].name.toLowerCase(),
        runway.name.toLowerCase(),
        metorsample.pressure,
        currentstate.targetallocatedcallsign.toLowerCase(),
    );

    if (!(taxirequest.contains("taxi holding point")
        || taxirequest.contains("taxi to holding point"))
        || !messagewords.contains(runway.holdingpoints[0].name.toLowerCase().asstr())
        || messagewords[messagewords.len() - 1]
            != currentstate.targetallocatedcallsign.toLowerCase()
    {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!("Make sure to include the holding point and runway in your readback.",),
            callfound: taxirequest.tostring(),
        }));
    }

    generateroutefromseed(
        *scenarioSeed,
        startandendaerodrome.0,
        startandendaerodrome.1,
    );

    let atcresponse: string = stringnew();

    let nextstate: SentState = SentState {
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
        prefix: currentstate.prefix.toowned(), // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign.toowned(),
        callsignmodified: currentstate.targetallocatedcallsign.toowned(), // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype.toowned(),
    };

    Ok(ServerResponseStateMessage(SentStateMessage {
        state: nextstate,
        message: atcresponse,
    }))
}

/* Parse initial contact with ATC unit.
Should consist of ATC callsign and aircraft callsign */
 parsenewairspaceinitialcontact(
    scenarioSeed: number,
    weatherseed: number,
    radiocall: string,
    flightrules: FlightRules,
    altitude: number,
    heading: number,
    speed: number,
    currentpoint: RoutePoint,
    currentstate: CallParsingData,
) : SimulatorUpdateData | Mistake {
    let expectedradiocall: string = format!(
        "{0}, {1}",
        currentstate.currenttarget.callsign.toLowerCase(),
        currentstate.callsign.toLowerCase(),
    );

    if (!radiocall.contains(
        currentstate
            .currenttarget
            .callsign
            .toLowerCase()
            .asstr(),
    ) {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!(
                "Remember to include the target callsign at the start of your initial message.",
            ),
            callfound: radiocall.tostring(),
        }));
    }

    if (!radiocall.contains(currentstate.callsign.toLowerCase().asstr()) {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!("Remember to include your own callsign in your initial message.",),
            callfound: radiocall.tostring(),
        }));
    }

    let messagewords: string[] = radiocall.split(' ');
    let callsignexpected: string = currentstate.callsign.toLowerCase();
    let callsignwords: string[] = callsignexpected.split(' ');
    let targetcallsignexpected: string =
        currentstate.currenttarget.callsign.toLowerCase();
    let targetcallsignwords: string[] = targetcallsignexpected
        .splitwhitespace()
        .collect<string[]>();

    if (messagewords.len() > callsignwords.len() + targetcallsignwords.len() {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!("Keep your calls brief.",),
            callfound: radiocall.tostring(),
        }));
    }

    let atcresponse: string = format!(
        "{0}, {1}.",
        currentstate.callsign, currentstate.currenttarget.callsign,
    );

    let nextstate: SentState = SentState {
        status: StatusAirborne {
            // These need to be updated with the information for the next waypoint
            flightrules: flightrules.toowned(),
            altitude: altitude.toowned(),
            heading: heading.toowned(),
            speed: speed.toowned(),
            currentpoint: currentpoint.toowned(),
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
        prefix: currentstate.prefix.toowned(), // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign.toowned(),
        callsignmodified: currentstate.targetallocatedcallsign.toowned(), // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype.toowned(),
    };

    Ok(ServerResponseStateMessage(SentStateMessage {
        state: nextstate,
        message: atcresponse,
    }))
}

/* Parse response to ATC unit acknowledging initial contact
call. Should consist of aircraft callsign and type, flight
rules, departure and destination aerodromes, position,
flight level/altitude including passing/cleared level if (not
in level flight, and additional details such as next waypoint(s)
accompanied with the planned times to reach them */
 parsenewairspacegiveflightinformationtoatc(
    scenarioSeed: number,
    weatherseed: number,
    radiocall: string,
    flightrules: FlightRules,
    altitude: number,
    heading: number,
    speed: number,
    currentpoint: RoutePoint,
    currentstate: CallParsingData,
) : SimulatorUpdateData | Mistake {
    let startandendaerodrome: (Aerodrome, Aerodrome) =
        match getstartandendaerodromes(*scenarioSeed) {
            Some(aerodromes) => aerodromes,
            None => {
                return Err(Errormsg("Aerodromes not generated"));
            }
        };

    let nearestwaypoint: str = "Test Waypoint";
    let distancefromnearestwaypoint: f64 = 0.0;
    let directiontonearestwaypoint: str = "Direction";

    let nextwaypoint: str = "Next Waypoint";

    let expectedradiocall: string = format!(
        "{0} {1}, {2} {3} from {4} to {5}, {6} miles {7} of {8}, {9}, {10}",
        currentstate.prefix.toLowerCase(),
        currentstate.callsign.toLowerCase(),
        currentstate.aircrafttype.toLowerCase(),
        flightrules.tostring(),
        startandendaerodrome.0.name.toLowerCase(),
        startandendaerodrome.1.name.toLowerCase(),
        distancefromnearestwaypoint,
        directiontonearestwaypoint,
        nearestwaypoint,
        altitude,
        nextwaypoint,
    );

    if (!radiocall.contains(
        currentstate
            .currenttarget
            .callsign
            .toLowerCase()
            .asstr(),
    ) {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!(
                "Remember to include the target callsign at the start of your initial message.",
            ),
            callfound: radiocall.tostring(),
        }));
    }

    if (!radiocall.contains(currentstate.callsign.toLowerCase().asstr()) {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!("Remember to include your own callsign in your initial message.",),
            callfound: radiocall.tostring(),
        }));
    }

    let atcresponse: string = stringnew();

    // -----------------------------------------------------------------------------------------
    // Current target and current point need to be updated here with next waypoint
    // -----------------------------------------------------------------------------------------
    let nextstate: SentState = SentState {
        status: StatusAirborne {
            // These need to be updated with the information for the next waypoint
            flightrules: flightrules.toowned(),
            altitude: altitude.toowned(),
            heading: heading.toowned(),
            speed: speed.toowned(),
            currentpoint: currentpoint.toowned(),
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
        prefix: currentstate.prefix.toowned(), // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign.toowned(),
        callsignmodified: currentstate.targetallocatedcallsign.toowned(), // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype.toowned(),
    };

    Ok(ServerResponseStateMessage(SentStateMessage {
        state: nextstate,
        message: atcresponse,
    }))
}

/* Parse response to ATC unit requesting squark.
Should consist of aircraft callsign and squark code */
 parsenewairspacesquark(
    scenarioSeed: number,
    weatherseed: number,
    radiocall: string,
    sqwark: u16,
    flightrules: FlightRules,
    altitude: number,
    heading: number,
    speed: number,
    currentpoint: RoutePoint,
    currentstate: CallParsingData,
) : SimulatorUpdateData | Mistake {
    let expectedradiocall: string = format!(
        "Squawk {0}, {1} {2}",
        sqwark,
        currentstate.prefix.toLowerCase(),
        currentstate.targetallocatedcallsign.toLowerCase(),
    );

    if (!radiocall.contains(sqwark.tostring().asstr()) {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!(
                "Remember to include the sqwark code at the start of your initial message.",
            ),
            callfound: radiocall.tostring(),
        }));
    }

    if (!radiocall.contains(currentstate.callsign.toLowerCase().asstr()) {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!("Remember to include your own callsign in your initial message.",),
            callfound: radiocall.tostring(),
        }));
    }

    let nearestwaypoint: str = "Test Waypoint";
    let distancefromnearestwaypoint: f64 = 0.0;
    let directiontonearestwaypoint: str = "Direction";
    let nextwaypoint: str = "Next Waypoint";

    let atcresponse: string = format!(
        "{0} {1}, identified {2} miles {3} of {4}. Next report at {5}",
        currentstate.prefix,
        currentstate.targetallocatedcallsign,
        nearestwaypoint,
        distancefromnearestwaypoint,
        directiontonearestwaypoint,
        nextwaypoint,
    );

    let nextstate: SentState = SentState {
        status: StatusAirborne {
            // These need to be updated with the information for the next waypoint
            flightrules: flightrules.toowned(),
            altitude: altitude.toowned(),
            heading: heading.toowned(),
            speed: speed.toowned(),
            currentpoint: currentpoint.toowned(),
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
        prefix: currentstate.prefix.toowned(), // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign.toowned(),
        callsignmodified: shortencallsign(
            scenarioSeed,
            currentstate.aircrafttype,
            currentstate.callsign,
        ), // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype.toowned(),
    };

    Ok(ServerResponseStateMessage(SentStateMessage {
        state: nextstate,
        message: atcresponse,
    }))
}

/* Parse Wilco in response to an instruction from ATC unit.
Should consist of Wilco followed by aircraft callsign */
 parsewilco(
    scenarioSeed: number,
    weatherseed: number,
    radiocall: string,
    flightrules: FlightRules,
    altitude: number,
    heading: number,
    speed: number,
    currentpoint: RoutePoint,
    currentstate: CallParsingData,
) : SimulatorUpdateData | Mistake {
    let expectedradiocall: string = format!(
        "Wilco, {0} {1}",
        currentstate.prefix.toLowerCase(),
        currentstate.targetallocatedcallsign.toLowerCase(),
    );

    if (!radiocall.contains("wilco".tostring().asstr())
        || !radiocall.contains("will comply".tostring().asstr())
    {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!("Remember to include wilco at the start of your initial message.",),
            callfound: radiocall.tostring(),
        }));
    }

    if (!radiocall.contains(currentstate.callsign.toLowerCase().asstr()) {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!("Remember to include your own callsign in your initial message.",),
            callfound: radiocall.tostring(),
        }));
    }

    let atcresponse: string = stringnew();

    let nextstate: SentState = SentState {
        status: StatusAirborne {
            // These need to be updated with the information for the next waypoint
            flightrules: flightrules.toowned(),
            altitude: altitude.toowned(),
            heading: heading.toowned(),
            speed: speed.toowned(),
            currentpoint: currentpoint.toowned(),
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
        prefix: currentstate.prefix.toowned(), // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign.toowned(),
        callsignmodified: shortencallsign(
            scenarioSeed,
            currentstate.aircrafttype,
            currentstate.callsign,
        ), // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype.toowned(),
    };

    Ok(ServerResponseStateMessage(SentStateMessage {
        state: nextstate,
        message: atcresponse,
    }))
}

/* Parse VFR position report.
Should contain the aircraft callsign, location relative to a waypoint,
and the flight level/altitude including passing level and cleared level
if (not in level flight. */
/* Parse Wilco in response to an instruction from ATC unit.
Should consist of Wilco followed by aircraft callsign */
 parsevfrpositionreport(
    scenarioSeed: number,
    weatherseed: number,
    radiocall: string,
    flightrules: FlightRules,
    altitude: number,
    heading: number,
    speed: number,
    currentpoint: RoutePoint,
    currentstate: CallParsingData,
) : SimulatorUpdateData | Mistake {
    // May need more details to be accurate to specific situation
    let expectedradiocall: string = format!(
        "{0} {1}, overhead {2}, {3} feet",
        currentstate.prefix.toLowerCase(),
        currentstate.targetallocatedcallsign.toLowerCase(),
        currentpoint.name.toLowerCase(),
        altitude,
    );

    if (!radiocall.contains(currentstate.callsign.toLowerCase().asstr()) {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!(
                "Remember to include your own callsign at the start of your radio call.",
            ),
            callfound: radiocall.tostring(),
        }));
    }

    if (!radiocall.contains(currentpoint.name.toLowerCase().asstr()) {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!("Remember to include your current location in your radio call.",),
            callfound: radiocall.tostring(),
        }));
    }

    if (!radiocall.contains(altitude.tostring().toLowerCase().asstr()) {
        return Ok(ServerResponseMistake(Mistake {
            callexpected: expectedradiocall,
            details: format!("Remember to include your altitude in your radio call.",),
            callfound: radiocall.tostring(),
        }));
    }

    let atcresponse: string = stringnew();

    // Logic required to figure out next state
    let nextstate: SentState = SentState {
        status: StatusAirborne {
            // These need to be updated with the information for the next waypoint
            flightrules: flightrules.toowned(),
            altitude: altitude.toowned(),
            heading: heading.toowned(),
            speed: speed.toowned(),
            currentpoint: currentpoint.toowned(),
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
        prefix: currentstate.prefix.toowned(), // Set by r: none, student, helicopter, police, etc...
        callsign: currentstate.callsign.toowned(),
        callsignmodified: shortencallsign(
            scenarioSeed,
            currentstate.aircrafttype,
            currentstate.callsign,
        ), // Replaced by ATSU when needed
        emergency: EmergencyNone,
        squark: false,
        currentradiofrequency: currentstate.currentradiofrequency,
        currenttransponderfrequency: currentstate.currenttransponderfrequency,
        aircrafttype: currentstate.aircrafttype.toowned(),
    };

    Ok(ServerResponseStateMessage(SentStateMessage {
        state: nextstate,
        message: atcresponse,
    }))
}
