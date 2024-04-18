import { derived, writable } from 'svelte/store';
import type {
	AircraftDetails,
	AltimeterState,
	RadioState,
	TransponderState
} from './ts/SimulatorTypes';
import type RadioCall from './ts/RadioCall';
import type Scenario from './ts/Scenario';
import type Airspace from './ts/AeronauticalClasses/Airspace';
import type Waypoint from './ts/AeronauticalClasses/Waypoint';
import type Airport from './ts/AeronauticalClasses/Airport';
import * as turf from '@turf/turf';

const initialAircraftDetails: AircraftDetails = {
	prefix: 'STUDENT',
	callsign: 'G-OFLY',
	aircraftType: 'Cessna 172'
};

const initialRadioState: RadioState = {
	mode: 'OFF',
	dialMode: 'OFF',
	activeFrequency: '000.000',
	standbyFrequency: '000.000',
	tertiaryFrequency: '000.000'
};

const initialTransponderState: TransponderState = {
	dialMode: 'OFF',
	frequency: '0000',
	identEnabled: false,
	vfrHasExecuted: false
};

const initialAltimeterState: AltimeterState = {
	pressure: 1013
};

export const AircraftDetailsStore = writable<AircraftDetails>(initialAircraftDetails);

export const ScenarioSeedStore = writable<string>('');

export const HasEmergencyEventsStore = writable<boolean>(false);

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

// Scenario/route stores
export const ScenarioStore = writable<Scenario | undefined>(undefined);

export const ScenarioPointsStore = derived(ScenarioStore, ($ScenarioStore) => {
	if ($ScenarioStore) {
		return $ScenarioStore.scenarioPoints;
	} else {
		return [];
	}
});

export const WaypointsStore = writable<Waypoint[]>([]);

export const WaypointPointsMapStore = derived(WaypointsStore, ($WaypointsStore) => {
	return $WaypointsStore.map((waypoint) => [waypoint.location[1], waypoint.location[0]]);
});

export const RouteDistanceMetersStore = derived(WaypointsStore, ($RoutePointStore) => {
	let distance = 0;
	for (let i = 0; i < $RoutePointStore.length - 1; i++) {
		const point1 = $RoutePointStore[i];
		const point2 = $RoutePointStore[i + 1];
		distance += turf.distance(point1.location, point2.location, { units: 'meters' });
	}
	return distance;
});

export const RouteDistanceDisplayUnitStore = writable<string>('Nautical Miles');

export const RouteDistanceDisplayStore = derived(
	[RouteDistanceMetersStore, RouteDistanceDisplayUnitStore],
	([$RouteDistanceMetersStore, $RouteDistanceDisplayUnitStore]) => {
		if ($RouteDistanceDisplayUnitStore == 'Nautical Miles') {
			return ($RouteDistanceMetersStore / 1852).toFixed(2) + ' nm';
		} else if ($RouteDistanceDisplayUnitStore == 'Miles') {
			return ($RouteDistanceMetersStore / 1609.344).toFixed(2) + ' mi';
		} else {
			return ($RouteDistanceMetersStore / 1000).toFixed(2) + ' km';
		}
	}
);

export const AllAirspacesStore = writable<Airspace[]>([]);

export const maxFlightLevelStore = writable<number>(0);

export const FilteredAirspacesStore = derived(
	[AllAirspacesStore, maxFlightLevelStore],
	([$AllAirspacesStore, $MaxFlightLevelStore]) => {
		const filteredAirspaces: Airspace[] = [];
		$AllAirspacesStore.forEach((airspace) => {
			if (airspace.lowerLimit <= $MaxFlightLevelStore) {
				filteredAirspaces.push(airspace);
			}
		});
		return filteredAirspaces;
	}
);

export const OnRouteAirspacesStore = derived(
	[FilteredAirspacesStore, maxFlightLevelStore, WaypointsStore],
	([$FilteredAirspacesStore, $MaxFlightLevelStore, $WaypointStore]) => {
		if ($FilteredAirspacesStore.length === 0 || $WaypointStore.length === 0) return [];

		const filteredAirspaces: Airspace[] = [];
		$FilteredAirspacesStore.forEach((airspace) => {
			if (
				airspace.isIncludedInRoute(
					$WaypointStore.map((waypoint) => waypoint.location),
					$MaxFlightLevelStore
				)
			) {
				filteredAirspaces.push(airspace);
			}
		});
		return filteredAirspaces;
	}
);

export const AllAirportsStore = writable<Airport[]>([]);

export const OnRouteAirportsStore = writable<Airport[]>([]);

export const CurrentScenarioPointIndexStore = writable<number>(0);

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

export const CurrentScenarioPointStore = derived(
	[ScenarioStore, CurrentScenarioPointIndexStore],
	([$ScenarioStore, $CurrentRoutePointStore]) => {
		if ($ScenarioStore) {
			if ($ScenarioStore.scenarioPoints.length > 0) {
				$ScenarioStore.currentPointIndex = Math.max(
					0,
					Math.min($CurrentRoutePointStore, $ScenarioStore.scenarioPoints.length - 1)
				);
				return $ScenarioStore.getCurrentPoint();
			}
		}
	}
);

export const CurrentTargetStore = derived(CurrentScenarioPointStore, ($CurrentRoutePointStore) => {
	return $CurrentRoutePointStore?.updateData.currentTarget || '';
});

export const CurrentTargetFrequencyStore = derived(
	CurrentScenarioPointStore,
	($CurrentRoutePointStore) => {
		return $CurrentRoutePointStore?.updateData.currentTargetFrequency || '000.000';
	}
);

// Radio calls history
export const RadioCallsHistoryStore = writable<RadioCall[]>([]);

// Page stores
export const TutorialStore = writable<boolean>(false);

// System status stores
export const NullRouteStore = writable<boolean>(false);

// Server response stores - for blocking repeated server requests
export const AwaitingServerResponseStore = writable<boolean>(false);

export function ClearSimulationStores(): void {
	AircraftDetailsStore.set(initialAircraftDetails);
	ScenarioSeedStore.set('');
	HasEmergencyEventsStore.set(false);
	SpeechInputEnabledStore.set(false);
	SpeechOutputEnabledStore.set(false);
	LiveFeedbackStore.set(false);
	RadioStateStore.set(initialRadioState);
	TransponderStateStore.set(initialTransponderState);
	AltimeterStateStore.set(initialAltimeterState);
	UserMessageStore.set('');
	ExpectedUserMessageStore.set('');
	ATCMessageStore.set('');
	ScenarioStore.set(undefined);
	WaypointsStore.set([]);
	CurrentScenarioPointIndexStore.set(0);
	EndPointIndexStore.set(0);
	TutorialStore.set(false);
	NullRouteStore.set(false);
}
