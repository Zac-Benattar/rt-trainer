<script lang="ts">
	import Radio from './Radio.svelte';
	import Transponder from './Transponder.svelte';
	import Map from './Map.svelte';
	import { clipboard } from '@skeletonlabs/skeleton';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	export let unexpectedEvents: boolean = false;
	export let seed: string = '0';

	// generate the link to the scenario
	var scenarioLink = 'www.rt-trainer.com/scenario/' + seed;
	if (unexpectedEvents) {
		scenarioLink += '?unexpectedEvents=' + unexpectedEvents;
	}
</script>

<div class="relative flex">
	<div class="columns-3xl">
		<div class="relative">
			<h1>Simulator</h1>
		</div>
		<div>
			<p>
				Unexpected events <SlideToggle
					id="enable-random-events"
					name="slider-small"
					checked={unexpectedEvents}
					active="bg-primary-500"
					size="sm"
					on:click={() => (unexpectedEvents = !unexpectedEvents)}
				/>
			</p>
		</div>
		<div class="radio-transponder-container relative">
			<Radio />
			<div style="min-height:50px; user-select: none;"></div>
			<Transponder />
			<Map />
		</div>
		<div class="relative">
			<!-- Source -->
			<div data-clipboard="scenarioLinkElement">{scenarioLink}</div>

			<!-- Trigger -->
			<button use:clipboard={{ element: 'scenarioLinkElement' }}>Copy</button>
		</div>
	</div>
</div>

<style lang="postcss">
	.radio-transponder-container {
		display: flex;
		flex-direction: columns;
		justify-content: center;
	}
</style>
