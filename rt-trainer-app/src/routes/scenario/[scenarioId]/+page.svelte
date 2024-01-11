<script lang="ts">
	import Simulator from '../../../lib/Simulator/Simulator.svelte';
	import { page } from '$app/stores';
	import { SettingsStore, SeedStore } from '$lib/stores';

	// Get the seed from the URL
	let seedString: string = $page.params.scenarioId;

	// Split the seed into two halves and pad them with zeros to make sure they are the same length
	const [tempScenarioSeed, tempWeatherSeed] = splitAndPadNumber(simpleHash(seedString));
	const scenarioSeed = tempScenarioSeed;
	const weatherSeed = tempWeatherSeed;

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

	// Set the seed store
	SeedStore.set({
		seedString: seedString,
		scenarioSeed: scenarioSeed,
		weatherSeed: weatherSeed
	});

	// Splits a number into two halves and pads them with zeros to make sure they are the same length
	function splitAndPadNumber(input: number): [number, number] {
		const numberString = input.toString();
		const halfLength = Math.ceil(numberString.length / 2);
		const firstHalf = parseInt(numberString.padEnd(halfLength, '0').slice(0, halfLength));
		const secondHalf = parseInt(numberString.slice(halfLength).padEnd(halfLength, '0'));
		return [firstHalf, secondHalf];
	}

	// Simple hash function: hash * 31 + char
	function simpleHash(str: string) {
		let hash = 0;

		if (str.length === 0) {
			return hash;
		}

		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
		}

		return hash;
	}
</script>

<div class="relative flex" style="justify-content: center;">
	<Simulator />
</div>
