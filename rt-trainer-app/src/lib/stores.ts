import { writable } from 'svelte/store';
import type { SimulatorSettings } from './ts/ServerClientTypes';
import { FrequencyType, type AircraftDetails, type RadioFrequency, type RadioState, type TransponderState } from './ts/SimulatorTypes';
import type Seed from './ts/Seed';
import type { RoutePoint } from './ts/RouteStates';

const initialSettings: SimulatorSettings = {
	unexpectedEvents: false,
	speechInput: false,
	readRecievedCalls: false
};

const initialScenarioSeed: Seed = {
	seedString: '0',
	scenarioSeed: 0,
	weatherSeed: 0
};

const initialAircraftDetails: AircraftDetails = {
	prefix: 'STUDENT',
	callsign: 'G-OFLY',
	aircraftType: 'Cessna 172'
};

const initialRadioState: RadioState = {
	mode: 'OFF',
	dialMode: 'OFF',
	activeFrequency: 0,
	standbyFrequency: 0,
	tertiaryFrequency: 0
};

const initialTransponderState: TransponderState = {
	dialMode: 'OFF',
	frequency: 0,
	ident_enabled: false,
	vfrHasExecuted: false
};

const initialTarget: RadioFrequency = {
	frequency: 0,
	callsign: 'NONE',
	frequencyType: FrequencyType.AFIS
};

export const AircraftDetailsStore = writable<AircraftDetails>(initialAircraftDetails);

export const SettingsStore = writable<SimulatorSettings>(initialSettings);

export const SeedStore = writable<Seed>(initialScenarioSeed);

export const CurrentTargetStore = writable<RadioFrequency>(initialTarget);

export const RadioStateStore = writable<RadioState>(initialRadioState);

export const TransponderStateStore = writable<TransponderState>(initialTransponderState);

export const UserMessageStore = writable<string>('');

export const ATCMessageStore = writable<string>('');

export const KneeboardStore = writable<string>('');

export const RouteStore = writable<RoutePoint[]>([]);

export const CurrentRoutePointStore = writable<RoutePoint | null>(null);

export function setDetailsStorePrefix(prefix: string) {
	AircraftDetailsStore.update((settings) => {
		settings.prefix = prefix;
		return settings;
	});
}

export function setDetailsStoreCallsign(callsign: string) {
	AircraftDetailsStore.update((settings) => {
		settings.callsign = callsign;
		return settings;
	});
}

export function setDetailsStoreAircraftType(aircraftType: string) {
	AircraftDetailsStore.update((settings) => {
		settings.aircraftType = aircraftType;
		return settings;
	});
}
