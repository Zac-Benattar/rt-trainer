<script lang="ts">
	import Simulator from '$lib/Components/Simulator/Simulator.svelte';
	import { page } from '$app/stores';
	import { AircraftDetailsStore, GenerationParametersStore } from '$lib/stores';
	import Seed from '$lib/ts/Seed';
	import { generateRandomURLValidString } from '$lib/ts/utils';

	/* Need to read in generation parameters from the URL. Using stores would not be sufficent 
	given that this would prevent users from pasting in a URL and getting the correct parameters. */

	// Get the seed
	let seedString = $page.params.seed;
	if (seedString == null) {
		seedString = generateRandomURLValidString(8);
	}
	let seed: Seed = new Seed(seedString);

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
	AircraftDetailsStore.set({ callsign, prefix, aircraftType });

	console.log(seed, airborneWaypoints, hasEmergency, callsign, prefix, aircraftType);
</script>

<div class="relative flex" style="justify-content: center;">
	<Simulator />
</div>
