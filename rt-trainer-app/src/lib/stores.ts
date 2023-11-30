import { writable } from 'svelte/store';
import type { SimulatorSettings } from './lib/States';

const initialSimulatorSettings: SimulatorSettings = {
    prefix: 'STUDENT',
    callsign: 'G-OSKY',
    aircraftType: 'Cessna 172'
};

export const simulatorSettingsStore = writable<SimulatorSettings>(initialSimulatorSettings);

export function setPrefix(prefix: string) {
    simulatorSettingsStore.update(settings => {
        settings.prefix = prefix;
        return settings;
    });
}

export function setCallsign(callsign: string) {
    simulatorSettingsStore.update(settings => {
        settings.callsign = callsign;
        return settings;
    });
}

export function setAircraftType(aircraftType: string) {
    simulatorSettingsStore.update(settings => {
        settings.aircraftType = aircraftType;
        return settings;
    });
}

export function getSimulatorSettings() {
    return simulatorSettingsStore;
}


