<script lang="ts">
	import { page } from '$app/stores';
	import Map from '$lib/Components/Simulator/Map.svelte';
	import {
		ClearSimulationStores,
		GenerationParametersStore,
		NullRouteStore,
		OpenAIPHealthStore,
		WaypointsStore
	} from '$lib/stores';
	import { initiateRouteV2 } from '$lib/ts/Route';
	import Seed from '$lib/ts/Seed';
	import type { Waypoint } from '$lib/ts/Waypoint';
	import { generateRandomURLValidString } from '$lib/ts/utils';
	import axios from 'axios';

	ClearSimulationStores();

	checkOpenAIPHealth();

	// Get the seed
	let seedString = $page.params.seed;
	if (seedString == null) {
		seedString = generateRandomURLValidString(8);
	}
	let seed: Seed = new Seed(seedString);

	// Check whether the number of airborne waypoints are specified
	const airborneWaypointsString: string | null = $page.url.searchParams.get('airborneWaypoints');
	let airborneWaypoints: number = 2;
	if (
		airborneWaypointsString == null ||
		airborneWaypointsString == undefined ||
		airborneWaypointsString == ''
	) {
		airborneWaypoints = 2;
	} else {
		airborneWaypoints = parseInt(airborneWaypointsString);
		if (airborneWaypoints < 0 || airborneWaypoints > 5) {
			airborneWaypoints = 2;
		}
	}

	// Check whether emergencies are enabled
	let hasEmergency: boolean = false;
	const emergenciesString: string | null = $page.url.searchParams.get('emergencies');
	if (emergenciesString != null) {
		hasEmergency = emergenciesString === 'True';
	}

	GenerationParametersStore.set({ seed, airborneWaypoints, hasEmergency });

	initiateRouteV2();

	let openAIPHealth: string = 'Unknown';

	OpenAIPHealthStore.subscribe((health) => {
		openAIPHealth = health;
	});

	let waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((route) => {
		waypoints = route;
	});

	// For testing
	async function checkOpenAIPHealth(): Promise<void> {
		try {
			const response = await axios.get(`/api/openaiphealth`);

			if (response === undefined) {
				NullRouteStore.set(true);
			} else {
				OpenAIPHealthStore.set(response.data);
			}
		} catch (error: unknown) {
			if (error.message === 'Network Error') {
				NullRouteStore.set(true);
			} else {
				console.error('Error: ', error);
			}
		}
	}
</script>

<div class="flex flex-col gap-3 p-5">
	<div class="flex flex-col gap-1 card p-5 max-w-lg">
		<div>OpenAIP Status: {openAIPHealth}</div>
		<div>Route Length: {waypoints.length}</div>
		<button class="btn-md rounded-md variant-filled w-48">Push to route table</button>
	</div>

	<Map enabled={true} widthSmScreen={'800px'} heightSmScreen={'500px'} initialZoomLevel={9} />
</div>
