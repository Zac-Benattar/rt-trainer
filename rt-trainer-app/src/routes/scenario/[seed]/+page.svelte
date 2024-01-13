<script lang="ts">
	import Simulator from '$lib/Simulator/Simulator.svelte';
	import { page } from '$app/stores';
	import { SettingsStore, SeedStore } from '$lib/stores';
	import Seed from '$lib/ts/Seed';

	// Get the seed from the URL
	var seedString = $page.params.seed;
	if (seedString == null) {
		seedString = '';
	}
	let seed: Seed = new Seed(seedString);

	// Set the seed store
	SeedStore.set(seed);

	// Check whether unexpected events are enabled from the URL
	let unexpectedEvents: boolean = false;
	var unexpectedEventsString = $page.url.searchParams.get('unexpectedEvents');
	if (unexpectedEventsString != null) {
		unexpectedEvents = unexpectedEventsString === 'True';
	}

	// Set the initial simulator settings
	SettingsStore.set({
		unexpectedEvents: unexpectedEvents,
		speechInput: false,
		readRecievedCalls: false
	});
</script>

<div class="relative flex" style="justify-content: center;">
	<Simulator />
</div>
