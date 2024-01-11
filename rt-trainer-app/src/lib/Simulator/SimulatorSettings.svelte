<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import { SettingsStore } from '$lib/stores';

	export let speechRecognitionSupported: boolean = false;
	let unexpectedEvents: boolean = false;
	let speechInput: boolean = false;
	let readRecievedCalls: boolean = false;

	function updateSettings() {
		SettingsStore.set({
			unexpectedEvents: unexpectedEvents,
			speechInput: speechInput,
			readRecievedCalls: readRecievedCalls
		});

		console.log('Updated settings');
	}
</script>

<div class="settings-container relative flex flex-row items-center gap-5">
	<SlideToggle
		id="enable-random-events"
		name="slider-small"
		checked={unexpectedEvents}
		active="bg-primary-500"
		size="sm"
		on:click={() => {
			unexpectedEvents = !unexpectedEvents;
			updateSettings();
		}}
		>Unexpected events
	</SlideToggle>
	{#if speechRecognitionSupported}
		<SlideToggle
			id="enable-voice-input"
			name="slider-small"
			checked={speechInput}
			active="bg-primary-500"
			size="sm"
			on:click={() => {
				speechInput = !speechInput;
				updateSettings();
			}}
			>Voice input
		</SlideToggle>
	{/if}
	<SlideToggle
		id="enabled-audio-messages"
		name="slider-small"
		active="bg-primary-500"
		size="sm"
		on:click={() => {
			readRecievedCalls = !readRecievedCalls;
			updateSettings();
		}}
		>Audio messages
	</SlideToggle>
</div>

<style>
	.settings-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
</style>
