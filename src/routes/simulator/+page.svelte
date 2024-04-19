<script lang="ts">
	import Simulator from '$lib/Components/Simulator.svelte';
	import { page } from '$app/stores';
	import {
		AircraftDetailsStore,
		AllAirportsStore,
		AllAirspacesStore,
		CurrentScenarioPointIndexStore,
		EndPointIndexStore,
		OnRouteAirportsStore,
		OnRouteAirspacesStore,
		ScenarioStore,
		StartPointIndexStore,
		TutorialStore,
		WaypointsStore,
		fetchAirports,
		fetchAirspaces
	} from '$lib/stores';
	import type Scenario from '$lib/ts/Scenario';
	import type { WaypointURLObject } from '$lib/ts/ScenarioTypes';
	import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import type Airport from '$lib/ts/AeronauticalClasses/Airport';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { generateScenario } from '$lib/ts/ScenarioGenerator';

	const modalStore = getModalStore();

	// Scenario settings
	let seed: string = '';
	let hasEmergencies: boolean = false;
	let callsign: string = 'G-OFLY';
	let prefix: string = '';
	let aircraftType: string = 'Cessna 172';

	// Flag to check if critical data is missing and the user must be prompted to enter it
	let criticalDataMissing: boolean = false;

	// Scenario objects
	let waypoints: Waypoint[] = [];
	let airportIDs: string[] = [];

	// Check whether the seed is specified - if not then warn user
	const seedString: string | null = $page.url.searchParams.get('seed');
	if (seedString != null && seedString != '') {
		seed = seedString;
	} else {
		criticalDataMissing = true;
	}

	// Check whether the hasEmergency is specified
	const hasEmergencyString: string | null = $page.url.searchParams.get('hasEmergency');
	if (hasEmergencyString != null) {
		hasEmergencies = hasEmergencyString === 'true';
	}

	// Get waypoints from the URL's JSON.stringify form
	const waypointsString: string | null = $page.url.searchParams.get('waypoints');
	if (waypointsString != null) {
		const waypointsDataArray: WaypointURLObject[] = JSON.parse(waypointsString);
		waypoints = waypointsDataArray.map(
			(waypoint) =>
				new Waypoint(
					waypoint.name,
					waypoint.location,
					waypoint.type,
					waypoint.index,
					waypoint.referenceObjectId
				)
		);
		WaypointsStore.set(waypoints);
	} else {
		criticalDataMissing = true;
	}

	// Get airports from the URL's JSON.stringify form
	const airportsString: string | null = $page.url.searchParams.get('airports');
	if (airportsString != null) {
		airportIDs = airportsString.split(',');
	} else {
		criticalDataMissing = true;
	}

	// Check whether the callsign is specified
	const callsignString: string | null = $page.url.searchParams.get('callsign');
	if (callsignString != null && callsignString != '') {
		callsign = callsignString;
	}

	// Check whether the prefix is specified
	const prefixString: string | null = $page.url.searchParams.get('prefix');
	if (prefixString != null) {
		if (
			prefixString == '' ||
			prefixString == 'STUDENT' ||
			prefixString == 'HELICOPTER' ||
			prefixString == 'POLICE' ||
			prefixString == 'SUPER' ||
			prefixString == 'FASTJET' ||
			prefixString == 'FASTPROP'
		) {
			prefix = prefixString;
		}
	}

	// Check whether the aircraft type is specified
	const aircraftTypeString: string | null = $page.url.searchParams.get('aircraftType');
	if (aircraftTypeString != null && aircraftTypeString != '') {
		aircraftType = aircraftTypeString;
	}

	// Check whether start point index has been set
	let startPointIndex: number = 0;
	const startPointIndexString: string | null = $page.url.searchParams.get('startPoint');
	if (startPointIndexString != null) {
		startPointIndex = parseInt(startPointIndexString);
		if (startPointIndex < 0) {
			startPointIndex = 0;
		}
	}

	// Check whether end point index has been set
	let endPointIndex: number = -1;
	const endPointIndexString: string | null = $page.url.searchParams.get('endPoint');
	if (endPointIndexString != null) {
		endPointIndex = parseInt(endPointIndexString);
		if (endPointIndex < 0 || endPointIndex >= startPointIndex) {
			endPointIndex = -1;
		}
	}

	let tutorial: boolean = false;
	const tutorialString: string | null = $page.url.searchParams.get('tutorial');
	if (tutorialString != null) {
		tutorial = tutorialString === 'true';
	}

	// Load stores if not populated
	let airspaces: Airspace[] = [];
	AllAirspacesStore.subscribe((value) => {
		airspaces = value;
	});
	if (airspaces.length === 0) fetchAirspaces();

	let onRouteAirspaces: Airspace[] = [];
	OnRouteAirspacesStore.subscribe((value) => {
		onRouteAirspaces = value;
	});

	let airports: Airport[] = [];
	AllAirportsStore.subscribe((value) => {
		airports = value;
	});
	if (airports.length === 0) fetchAirports();

	let onRouteAirports: Airport[] = [];
	OnRouteAirportsStore.subscribe((value) => {
		onRouteAirports = value;
	});

	WaypointsStore.subscribe((value) => {
		waypoints = value;
	});

	let scenario: Scenario | undefined = undefined;

	if (criticalDataMissing) {
		// Set a short timeout then trigger modal to load scenario data
		setTimeout(() => {
			const modal: ModalSettings = {
				type: 'component',
				component: 'quickLoadScenarioDataComponent',
				response: (r: any) => {
					if (r) {
						seed = r.scenarioSeed;
						hasEmergencies = r.hasEmergencies;
						loadScenario();
					}
				}
			};
			modalStore.trigger(modal);
		}, 1000);
	}

	$: if (!criticalDataMissing && airports.length > 0 && airspaces.length > 0) {
		loadScenario();
	}

	function loadScenario() {
		try {
			scenario = generateScenario(
				seed,
				waypoints,
				onRouteAirports,
				onRouteAirspaces,
				hasEmergencies
			);
		} catch (e) {
			console.error(e);
			return;
		}

		ScenarioStore.set(scenario);

		if (endPointIndex == -1) {
			EndPointIndexStore.set(scenario.scenarioPoints.length - 1);
		} else {
			EndPointIndexStore.set(endPointIndex);
		}
	}

	ScenarioStore.set(scenario);
	CurrentScenarioPointIndexStore.set(startPointIndex);
	StartPointIndexStore.set(startPointIndex);

	TutorialStore.set(tutorial);
	AircraftDetailsStore.set({
		callsign: callsign,
		prefix: prefix,
		aircraftType: aircraftType
	});
</script>

<div class="flex" style="justify-content: center;">
	<Simulator />
</div>
