<script lang="ts">
	import Simulator from '$lib/Simulator/Simulator.svelte';
	import { page } from '$app/stores';
	import { SettingsStore, SeedStore } from '$lib/stores';
	import Seed from '$lib/ts/Seed';

	// Get the seed from the URL
	let seedString = $page.params.seed;
	if (seedString == null) {
		seedString = '';
	}
	let seed: Seed = new Seed(seedString);
	
	// Set the seed store
	SeedStore.set(seed);

	// Check whether unexpected events are enabled from the URL
	let enableEmergencies: boolean = false;
	var emergenciesString = $page.url.searchParams.get('emergencies');
	if (emergenciesString != null) {
		enableEmergencies = emergenciesString === 'True';
	}

	// Set the initial simulator settings
	SettingsStore.set({
		unexpectedEvents: enableEmergencies,
		speechInput: false,
		readRecievedCalls: false
	});
</script>

<div class="relative flex" style="justify-content: center;">
	<Simulator />
</div>
