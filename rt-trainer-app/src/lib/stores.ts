import { derived, writable } from 'svelte/store';
import type { COMFrequency, SimulatorSettings, SimulatorState } from './lib/States';

const initialSimulatorSettings: SimulatorSettings = {
	prefix: 'STUDENT',
	callsign: 'G-OSKY',
	aircraftType: 'Cessna 172'
};

const initialSimulatorState: SimulatorState = {
	radio_mode: 'OFF',
	radio_dial_mode: 'OFF',
	radio_active_frequency: 0,
	radio_standby_frequency: 0,
	radio_tertiary_frequency: 0,
	transponder_dial_mode: 'OFF',
	transponder_frequency: 0,
	transponder_ident_enabled: false,
	transponder_vfr_has_executed: false,
	message: '',
	atc_message: ''
};

const initialSimulatorTarget: COMFrequency = {
	frequency: 0,
	callsign: 'NONE',
	frequency_type: 'AFIS'
};

export const simulatorSettingsStore = writable<SimulatorSettings>(initialSimulatorSettings);

export const simulatorStateStore = writable<SimulatorState>(initialSimulatorState);

export const simulatorCurrentTargetStore = writable<COMFrequency>(initialSimulatorTarget);

export const simulatorMessageStore = derived(simulatorStateStore, ($simulatorStateStore) => {
    return $simulatorStateStore.message;
});

export const simulatorATCMessageStore = derived(simulatorStateStore, ($simulatorStateStore) => {
    return $simulatorStateStore.atc_message;
});

export function setSettingsPrefix(prefix: string) {
	simulatorSettingsStore.update((settings) => {
		settings.prefix = prefix;
		return settings;
	});
}

export function setSettingsCallsign(callsign: string) {
	simulatorSettingsStore.update((settings) => {
		settings.callsign = callsign;
		return settings;
	});
}

export function setSettingsAircraftType(aircraftType: string) {
	simulatorSettingsStore.update((settings) => {
		settings.aircraftType = aircraftType;
		return settings;
	});
}
