<script lang="ts">
	import Simulator from '$lib/Components/Simulator/Simulator.svelte';
	import { page } from '$app/stores';
	import {
		CurrentRoutePointIndexStore,
		EndPointIndexStore,
		ScenarioStore,
		StartPointIndexStore,
		TutorialStore
	} from '$lib/stores';
	import type { PageData } from './$types';
	import Scenario from '$lib/ts/Scenario';
	import { Waypoint } from '$lib/ts/AeronauticalClasses/Waypoint';

	export let data: PageData;

	// Get the slug
	const { id } = $page.params;

	// Check whether the callsign is specified
	const callsignString: string | null = $page.url.searchParams.get('callsign');
	let callsign: string = 'G-OFLY';
	if (callsignString != null) {
		if (callsignString == '') {
			callsign = 'G-OFLY';
		} else {
			callsign = callsignString;
		}
	}

	// Check whether the prefix is specified
	const prefixString: string | null = $page.url.searchParams.get('prefix');
	let prefix: string = 'G-OFLY';
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
	let aircraftType: string = 'Cessna 172';
	if (aircraftTypeString != null) {
		if (aircraftTypeString == '') {
			aircraftType = 'Cessna 172';
		} else {
			aircraftType = aircraftTypeString;
		}
	}

	// Check whether emergencies are enabled
	let hasEmergency: boolean = false;
	const emergenciesString: string | null = $page.url.searchParams.get('emergencies');
	if (emergenciesString != null) {
		hasEmergency = emergenciesString === 'True';
	}

	// Check whether start point index has been set
	let startPointIndex: number = 0;
	const startPointIndexString: string | null = $page.url.searchParams.get('startPoint');
	if (startPointIndexString != null) {
		startPointIndex = parseInt(startPointIndexString);
		console.log(startPointIndex);
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

	const waypoints: Waypoint[] = data.scenario?.routes.waypoints.map(
		(waypoint) =>
			new Waypoint(
				waypoint.name,
				parseFloat(waypoint.latitude),
				parseFloat(waypoint.longitude),
				waypoint.type,
				waypoint.index,
				waypoint.description?.toString()
			)
	);

	ScenarioStore.set(new Scenario(data.scenario?.seed, waypoints));
	CurrentRoutePointIndexStore.set(startPointIndex);
	StartPointIndexStore.set(startPointIndex);
	if (endPointIndex == -1) {
		EndPointIndexStore.set(routePoints.length - 1);
	} else {
		EndPointIndexStore.set(endPointIndex);
	}
	TutorialStore.set(tutorial);
</script>

<div class="flex" style="justify-content: center;">
	<Simulator scenarioId={id}/>
</div>
