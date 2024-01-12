import { ParkedState, type Aerodrome, type SimulatorUpdateData } from "./States";
import Route from "./Route";
import { ParkedStage, TaxiingStage } from "./FlightStages";

export function getRadioCheckSimulatorUpdateData(scenarioSeed: number) : SimulatorUpdateData {
    const startAerodrome = Route.getStartAerodrome(scenarioSeed);

    const stage = new ParkedState(ParkedStage.DepartInfo, startAerodrome);

    return {
        stage: stage,
        callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
        squark: false,
        currentTarget: startAerodrome.comFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
        currentTransponderFrequency: 7000,
        location: startAerodrome.location,
        emergency: 'None',
    }
}

// Stage 2
export function getRequestingDepartInfoSimulatorUpdateData(scenario_seed: number) : SimulatorUpdateData{
    const startAerodrome: Aerodrome = Route.getStartAerodrome(scenario_seed);

    const stage = new ParkedState(ParkedStage.DepartInfo, startAerodrome);

    return {
        stage: stage,
        callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
        squark: false,
        currentTarget: startAerodrome.comFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
        currentTransponderFrequency: 7000,
        location: startAerodrome.location,
        emergency: 'None',
    }
}

// Stage 3
export function getGetDepartInfoReadbackSimulatorUpdateData(scenario_seed: number) : SimulatorUpdateData {
    const startAerodrome: Aerodrome = Route.getStartAerodrome(scenario_seed);

    const stage = new ParkedState(ParkedStage.DepartInfo, startAerodrome);

    return {
        stage: stage,
        callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
        squark: false,
        currentTarget: startAerodrome.comFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
        currentTransponderFrequency: 7000,
        location: startAerodrome.location,
        emergency: 'None',
    }
}

// Stage 4
export function getTaxiRequestSimulatorUpdateData(scenario_seed: number) : SimulatorUpdateData {
    const startAerodrome: Aerodrome = Route.getStartAerodrome(scenario_seed);

    const stage = new ParkedState(ParkedStage.DepartInfo, startAerodrome);

    return {
        stage: stage,
        callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
        squark: false,
        currentTarget: startAerodrome.comFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
        currentTransponderFrequency: 7000,
        location: startAerodrome.location,
        emergency: 'None',
    }
}

// Stage 5
export function getGetTaxiClearenceReadbackSimulatorUpdateDate(scenario_seed: number) : SimulatorUpdateData {
    const startAerodrome: Aerodrome = Route.getStartAerodrome(scenario_seed);

    const stage = new TaxiingState(TaxiingStage.ReadyForDeparture, startAerodrome);

    return {
        stage: stage,
        callsignModified: false, // States whether callsign has been modified by ATC, e.g. shortened
        squark: false,
        currentTarget: startAerodrome.comFrequencies[0], // TODO: Change to correct frequency - add method in aerodrome to get the specific frequencies
        currentTransponderFrequency: 7000,
        location: startAerodrome.location,
        emergency: 'None',
    }
}