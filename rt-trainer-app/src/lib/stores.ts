import { writable } from 'svelte/store';
import type { RadioState, COMFrequency, SimulatorSettings, TransponderState } from './lib/States';

const initialSimulatorSettings: SimulatorSettings = {
	prefix: 'STUDENT',
	callsign: 'G-OFLY',
	aircraftType: 'Cessna 172'
};

const initialRadioState: RadioState = {
	mode: 'OFF',
	dial_mode: 'OFF',
	active_frequency: 0,
	standby_frequency: 0,
	tertiary_frequency: 0,
};

const initialTransponderState: TransponderState = {
	dial_mode: 'OFF',
	frequency: 0,
	ident_enabled: false,
	vfr_has_executed: false,
};

const initialSimulatorTarget: COMFrequency = {
	frequency: 0,
	callsign: 'NONE',
	frequency_type: 'AFIS'
};

export const simulatorSettingsStore = writable<SimulatorSettings>(initialSimulatorSettings);

export const simulatorCurrentTargetStore = writable<COMFrequency>(initialSimulatorTarget);

export const simulatorRadioStateStore = writable<RadioState>(initialRadioState);

export const simulatorTransponderStateStore = writable<TransponderState>(initialTransponderState);

export const simulatorMessageStore = writable<string>('');

export const simulatorATCMessageStore = writable<string>('');

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
