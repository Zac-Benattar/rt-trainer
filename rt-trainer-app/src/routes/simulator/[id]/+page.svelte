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
	import type { PageData } from './$types';
	import Scenario from '$lib/ts/Scenario';
	import { plainToInstance } from 'class-transformer';
	export let data: PageData;

	// Get the slug
	const { id } = $page.params;

	let callsign: string = data.aircraftDetails?.callsign ?? 'G-OFLY';
	let prefix: string = data.aircraftDetails?.prefix ?? 'STUDENT';
	let aircraftType: string = data.aircraftDetails?.aircraftType ?? 'Cessna 172';

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
		tutorial = tutorialString === 'True';
	}

	if (data.scenario == null) {
		throw new Error('Scenario data is not available');
	}

	const scenario = plainToInstance(Scenario, data.scenario as Scenario);
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
