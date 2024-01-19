import { writable } from 'svelte/store';
import type { GenerationParameters } from './ts/ServerClientTypes';

import type { RoutePoint } from './ts/RouteStates';
import type { AircraftDetails, RadioState, TransponderState } from './ts/SimulatorTypes';

const initialGenerationParameters: GenerationParameters = {
	seed: {
		seedString: '0',
		scenarioSeed: 0,
		weatherSeed: 0
	},
	airborneWaypoints: 2,
	hasEmergency: false
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
	identEnabled: false,
	vfrHasExecuted: false
};

export const AircraftDetailsStore = writable<AircraftDetails>(initialAircraftDetails);

export const GenerationParametersStore = writable<GenerationParameters>(initialGenerationParameters);

export const CurrentTargetStore = writable<string>('');

export const CurrentTargetFrequencyStore = writable<number>(0);

export const SpeechInputStore = writable<boolean>(false);

export const SpeechOutputStore = writable<boolean>(false);

export const RadioStateStore = writable<RadioState>(initialRadioState);

export const TransponderStateStore = writable<TransponderState>(initialTransponderState);

export const UserMessageStore = writable<string>('');

export const ExpectedUserMessageStore = writable<string>('');

export const ATCMessageStore = writable<string>('');

export const KneeboardStore = writable<string>('');

export const RouteStore = writable<RoutePoint[]>([]);

export const CurrentRoutePointStore = writable<RoutePoint | null>(null);

export function ClearSimulationStores(): void {
	AircraftDetailsStore.set(initialAircraftDetails);
	GenerationParametersStore.set(initialGenerationParameters);
	CurrentTargetStore.set('');
	CurrentTargetFrequencyStore.set(0);
	SpeechInputStore.set(false);
	SpeechOutputStore.set(false);
	RadioStateStore.set(initialRadioState);
	TransponderStateStore.set(initialTransponderState);
	UserMessageStore.set('');
	ExpectedUserMessageStore.set('');
	ATCMessageStore.set('');
	KneeboardStore.set('');
	RouteStore.set([]);
	CurrentRoutePointStore.set(null);
}
