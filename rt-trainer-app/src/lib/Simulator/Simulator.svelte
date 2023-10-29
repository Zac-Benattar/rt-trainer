<script lang="ts">
	import Radio from './Radio.svelte';
	import Transponder from './Transponder.svelte';
	import Map from './Map.svelte';
	import MessageInput from './MessageInput.svelte';
	import MessageOutput from './MessageOutput.svelte';
	import Kneeboard from './Kneeboard.svelte';
	import { clipboard } from '@skeletonlabs/skeleton';
	import { SlideToggle } from '@skeletonlabs/skeleton';

	export let unexpectedEvents: boolean = false;
	export let voiceInput: boolean = false;
	export let audioMessages: boolean = false;
	export let seed: string = '0';
	let kneeboardOffset: number = 480;

	// If not wanting server stuff to deal with then can chuck all the functionality in here?
	// It would make the whole project run on clientside and expose all simulation code and require local stt

	// Generate the link to the scenario
	let scenarioLink: string = 'www.rt-trainer.com/scenario/' + seed;
	if (unexpectedEvents) {
		scenarioLink += '?unexpectedEvents=' + unexpectedEvents;
	}

	// Bodge to keep kneeboard delete button in the right place
	function updateKneeboardOffset() {
		if (!audioMessages) {
			if (!voiceInput) {
				kneeboardOffset = 480;
			} else {
				kneeboardOffset = 240;
			}
		} else {
			if (!voiceInput) {
				kneeboardOffset = 240;
			} else {
				kneeboardOffset = 0;
			}
		}
	}

	const handleVoiceInputToggle = () => {
		voiceInput = !voiceInput;
		updateKneeboardOffset();
	};

	const handleAudioMessagesToggle = () => {
		audioMessages = !audioMessages;
		updateKneeboardOffset();
	};
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
				on:click={handleVoiceInputToggle}
				>Voice input
			</SlideToggle>
			<SlideToggle
				id="enabled-audio-messages"
				name="slider-small"
				active="bg-primary-500"
				size="sm"
				on:click={handleAudioMessagesToggle}
				>Audio messages
			</SlideToggle>
		</div>

		<div class="radio-transponder-container flex flex-col gap-10">
			<div>
				<Radio />
			</div>
			<div>
				<Transponder />
			</div>
		</div>

		{#if !voiceInput}
			<div class="rt-message-input-container">
				<MessageInput />
			</div>
		{/if}

		{#if !audioMessages}
			<div class="rt-message-output-container">
				<MessageOutput />
			</div>
		{/if}

		<div class="map-kneeboard-container flex flex-row gap-5">
			<div>
				<Map />
			</div>
			<div>
				<Kneeboard offset={kneeboardOffset} />
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
