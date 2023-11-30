import { writable } from 'svelte/store';
import type { COMFrequency, SimulatorSettings, State } from './lib/States';

const initialSimulatorSettings: SimulatorSettings = {
    prefix: 'STUDENT',
    callsign: 'G-OSKY',
    aircraftType: 'Cessna 172'
};

export const simulatorSettingsStore = writable<SimulatorSettings>(initialSimulatorSettings);

export function setSettingsPrefix(prefix: string) {
    simulatorSettingsStore.update(settings => {
        settings.prefix = prefix;
        return settings;
    });
}

export function setSettingsCallsign(callsign: string) {
    simulatorSettingsStore.update(settings => {
        settings.callsign = callsign;
        return settings;
    });
}

export function setSettingsAircraftType(aircraftType: string) {
    simulatorSettingsStore.update(settings => {
        settings.aircraftType = aircraftType;
        return settings;
    });
}

export const simulatorStateStore = writable<State>();

export function setStatePrefix(prefix: string) {
    simulatorStateStore.update(state => {
        state.prefix = prefix;
        return state;
    })
}

export function setStateCallsign(callsign: string) {
    simulatorStateStore.update(state => {
        state.callsign = callsign;
        return state;
    })
}

export function setStateTargetAllocatedCallsign(callsign: string) {
    simulatorStateStore.update(state => {
        state.target_allocated_callsign = callsign;
        return state;
    })
}

export function setStateSquark(squark: boolean) {
    simulatorStateStore.update(state => {
        state.squark = squark;
        return state;
    })
}

export function setStateCurrentTarget(target: COMFrequency) {
    simulatorStateStore.update(state => {
        state.current_target = target;
        return state;
    })
}

export function setStateCurrentRadioFrequency(frequency: number) {
    simulatorStateStore.update(state => {
        state.current_radio_frequency = frequency;
        return state;
    })
}

export function setStateCurrentTransponderFrequency(frequency: number) {
    simulatorStateStore.update(state => {
        state.current_transponder_frequency = frequency;
        return state;
    })
}

export function setStateLat(lat: number) {
    simulatorStateStore.update(state => {
        state.lat = lat;
        return state;
    })
}

export function setStateLong(long: number) {
    simulatorStateStore.update(state => {
        state.long = long;
        return state;
    })
}

export function setStateEmergency(emergency: "None" | "Mayday") {
    simulatorStateStore.update(state => {
        state.emergency = emergency;
        return state;
    })
}

export function setStateAircraftType(aircraftType: string) {
    simulatorStateStore.update(state => {
        state.aircraft_type = aircraftType;
        return state;
    })
}

export function setStateStatus(status: string) {
    simulatorStateStore.update(state => {
        state.status = status;
        return state;
    })
}



