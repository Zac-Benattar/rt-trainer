<script lang="ts">
	import Radio from './Radio.svelte';
	import Transponder from './Transponder.svelte';
	import Map from './Map.svelte';
	import { clipboard } from '@skeletonlabs/skeleton';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import Kneeboard from './Kneeboard.svelte';
	export let unexpectedEvents: boolean = false;
	export let voiceInput: boolean = false;
	export let seed: string = '0';

	// generate the link to the scenario
	var scenarioLink = 'www.rt-trainer.com/scenario/' + seed;
	if (unexpectedEvents) {
		scenarioLink += '?unexpectedEvents=' + unexpectedEvents;
	}
</script>

<div class="relative flex">
	<div class="flex flex-col gap-10">
		<div class="settings-container relative flex flex-row gap-5">
			<SlideToggle
				id="enable-random-events"
				name="slider-small"
				checked={unexpectedEvents}
				active="bg-primary-500"
				size="sm"
				on:click={() => (unexpectedEvents = !unexpectedEvents)}
				>Unexpected events
			</SlideToggle>
			<SlideToggle
				id="enable-voice-input"
				name="slider-small"
				checked={voiceInput}
				active="bg-primary-500"
				size="sm"
				on:click={() => (voiceInput = !voiceInput)}
				>Voice input
			</SlideToggle>
		</div>
		<div class="radio-transponder-container flex flex-col gap-10">
			<div>
				<Radio />
			</div>
			<div>
				<Transponder />
			</div>
			<div class="map-kneeboard-container flex flex-row gap-5">
				<div>
					<Map />
				</div>
				<div>
					<Kneeboard />
				</div>
			</div>
		</div>
		<div
			class="copy-link-div relative w-full text-token card variant-soft p-4 flex items-center gap-4"
		>
			<!-- Source -->
			<div data-clipboard="scenarioLinkElement">{scenarioLink}</div>

			<!-- Trigger -->
			<button use:clipboard={{ element: 'scenarioLinkElement' }} class="btn variant-filled"
				>Copy</button
			>
		</div>
		<div class="h-5" />
	</div>
</div>

<style lang="postcss">
	.settings-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.radio-transponder-container {
		justify-content: center;
	}

	.copy-link-div {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
</style>
