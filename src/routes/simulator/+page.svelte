<script lang="ts">
	import Simulator from '$lib/Components/Simulator.svelte';
	import { page } from '$app/stores';
	import {
		AircraftDetailsStore,
		AllAirportsStore,
		AllAirspacesStore,
		CurrentScenarioPointIndexStore,
		EndPointIndexStore,
		ScenarioStore,
		StartPointIndexStore,
		TutorialStore,
		WaypointsStore
	} from '$lib/stores';
	import type Scenario from '$lib/ts/Scenario';
	import { goto } from '$app/navigation';

	// Get the slug
	const { id } = $page.params;

	let seed: string = '';
	let hasEmergencies: boolean = false;
	let callsign: string = 'G-OFLY';
	let prefix: string = 'STUDENT';
	let aircraftType: string = 'Cessna 172';

	// Check whether the seed is specified
	const seedString: string | null = $page.url.searchParams.get('seed');
	if (seedString != null && seedString != '') {
		seed = seedString;
	} else {
		console.log('No seed specified');
		alert('No seed specified');
		goto('/');
	}

	// Check whether the hasEmergency is specified
	const hasEmergencyString: string | null = $page.url.searchParams.get('hasEmergency');
	if (hasEmergencyString != null) {
		hasEmergencies = hasEmergencyString === 'true';
	}

	// Get waypoints from the URL's JSON.stringify form
	const waypointsString: string | null = $page.url.searchParams.get('waypoints');
	if (waypointsString != null) {
		const waypointsArray: string[] = JSON.parse(waypointsString);
		const waypoints = waypointsArray.map((waypoint) => JSON.parse(waypoint));
		console.log(waypoints);
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

	const scenario: Scenario = null;
	scenario.currentPointIndex = startPointIndex;
	ScenarioStore.set(scenario);
	CurrentScenarioPointIndexStore.set(startPointIndex);
	AllAirspacesStore.set(scenario.airspaces);
	AllAirportsStore.set(scenario.airports);
	WaypointsStore.set(scenario.waypoints);
	StartPointIndexStore.set(startPointIndex);
	if (endPointIndex == -1) {
		EndPointIndexStore.set(scenario.scenarioPoints.length - 1);
	} else {
		EndPointIndexStore.set(endPointIndex);
	}
	TutorialStore.set(tutorial);
	AircraftDetailsStore.set({
		callsign: callsign,
		prefix: prefix,
		aircraftType: aircraftType
	});
</script>

<div class="flex" style="justify-content: center;">
	<Simulator scenarioId={id} />
</div>
