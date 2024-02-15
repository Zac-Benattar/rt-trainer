import { derived, writable } from 'svelte/store';
import type { GenerationParameters } from './ts/ServerClientTypes';
import type RoutePoint from './ts/RoutePoints';
import type {
	AircraftDetails,
	AltimeterState,
	RadioState,
	TransponderState
} from './ts/SimulatorTypes';
import type RadioCall from './ts/RadioCall';
import type RouteElement from './ts/RouteElement';
import { Waypoint } from './ts/AeronauticalClasses/Waypoint';
import ATZ from './ts/AeronauticalClasses/ATZ';

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

const initialAltimeterState: AltimeterState = {
	pressure: 1013
};

export const AircraftDetailsStore = writable<AircraftDetails>(initialAircraftDetails);

export const GenerationParametersStore = writable<GenerationParameters>(
	initialGenerationParameters
);

export const SpeechInputEnabledStore = writable<boolean>(false);

export const SpeechBufferStore = writable<string>('');

export const SpeechOutputEnabledStore = writable<boolean>(false);

export const LiveFeedbackStore = writable<boolean>(false);

export const RadioStateStore = writable<RadioState>(initialRadioState);

export const TransponderStateStore = writable<TransponderState>(initialTransponderState);

export const AltimeterStateStore = writable<AltimeterState>(initialAltimeterState);

export const UserMessageStore = writable<string>('');

export const ExpectedUserMessageStore = writable<string>('');

export const ATCMessageStore = writable<string>('');

export const KneeboardStore = writable<string>('');

// Route stores
export const RouteStore = writable<RoutePoint[]>([]);

export const RouteElementStore = writable<RouteElement[]>([]);

export const WaypointsStore = derived(RouteElementStore, ($RouteElementStore) => {
	const waypointsData = $RouteElementStore.filter(
		(element) => (<Waypoint>element).waypointType != undefined
	);

	// waypoints data only holds the data, we need to turn them into actual waypoint objects
	// so we can use the methods
	const waypoints: Waypoint[] = [];
	waypointsData.forEach((waypoint) => {
		console.log(waypoint);
		waypoints.push(
			new Waypoint(waypoint.waypointType, waypoint.index, waypoint.geometry[0], waypoint.name, waypoint.description, waypoint.arrivalTime)
		);
	});

	console.log(waypoints);

	return waypoints;
});

export const ATZsStore = derived(RouteElementStore, ($RouteElementStore) => {
	const ATZData = $RouteElementStore.filter((element) => (<ATZ>element).height != undefined);

	// ATZ data only holds the data, we need to turn them into actual ATZ objects
	// so we can use the methods
	const ATZs: ATZ[] = [];
	ATZData.forEach((atz) => {
		ATZs.push(new ATZ(atz.name, atz.geometry[0], atz.centre, atz.type, atz.height));
	});

	console.log(ATZs);

	return ATZs;
});

export const CurrentRoutePointIndexStore = writable<number>(0);

function createStartPointIndexStore() {
	const { subscribe, set } = writable(0);
	return {
		subscribe,
		set: (value: number) => {
			if (value >= 0) {
				set(value);
			} else {
				throw new Error('Start point index cannot be negative');
			}
		}
	};
}

export const StartPointIndexStore = createStartPointIndexStore();

// Eventually add logic to prevent setting the end point index to a value greater than the length of the route
function createEndPointIndexStore() {
	const { subscribe, set } = writable(0);
	return {
		subscribe,
		set: (value: number) => {
			set(value);
		}
	};
}

export const EndPointIndexStore = createEndPointIndexStore();

export const CurrentRoutePointStore = derived(
	[RouteStore, CurrentRoutePointIndexStore],
	([$RouteStore, $CurrentRoutePointIndexStore]) => {
		return $RouteStore[$CurrentRoutePointIndexStore];
	}
);

export const CurrentTargetStore = derived(CurrentRoutePointStore, ($CurrentRoutePointStore) => {
	return $CurrentRoutePointStore?.updateData.currentTarget || '';
});

export const CurrentTargetFrequencyStore = derived(
	CurrentRoutePointStore,
	($CurrentRoutePointStore) => {
		return $CurrentRoutePointStore?.updateData.currentTargetFrequency || 0;
	}
);

// Radio calls history
export const RadioCallsHistoryStore = writable<RadioCall[]>([]);

// Page stores
export const TutorialStore = writable<boolean>(false);

// System status stores
export const NullRouteStore = writable<boolean>(false);

export const OpenAIPHealthStore = writable<string>('');

export function ClearSimulationStores(): void {
	AircraftDetailsStore.set(initialAircraftDetails);
	GenerationParametersStore.set(initialGenerationParameters);
	SpeechInputEnabledStore.set(false);
	SpeechOutputEnabledStore.set(false);
	LiveFeedbackStore.set(false);
	RadioStateStore.set(initialRadioState);
	TransponderStateStore.set(initialTransponderState);
	AltimeterStateStore.set(initialAltimeterState);
	UserMessageStore.set('');
	ExpectedUserMessageStore.set('');
	ATCMessageStore.set('');
	KneeboardStore.set('');
	RouteStore.set([]);
	RouteElementStore.set([]);
	CurrentRoutePointIndexStore.set(0);
	EndPointIndexStore.set(0);
	TutorialStore.set(false);
	NullRouteStore.set(false);
}
