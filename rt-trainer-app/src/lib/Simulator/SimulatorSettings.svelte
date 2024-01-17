<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import { SettingsStore } from '$lib/stores';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import Tooltip from 'sv-tooltip';

	export let speechRecognitionSupported: boolean = false;
	let speechInput: boolean = false;
	let readRecievedCalls: boolean = false;
	const modalStore = getModalStore();

	SettingsStore.subscribe((settings) => {
		speechInput = settings.speechInput;
		readRecievedCalls = settings.readRecievedCalls;
	});

	function updateSettings() {
		SettingsStore.set({
			speechInput: speechInput,
			readRecievedCalls: readRecievedCalls
		});
	}
</script>

<div class="settings-container relative flex flex-row items-center gap-5">
	{#if speechRecognitionSupported}
		<Tooltip
			tip="Speech recognition is experimental, you may need to correct the recorded text."
			bottom
		>
			<SlideToggle
				id="enable-voice-input"
				name="slider-label"
				checked={speechInput}
				active="bg-primary-500"
				size="sm"
				on:click={() => {
					speechInput = !speechInput;
					updateSettings();
				}}
				>Voice input
			</SlideToggle>
		</Tooltip>
	{:else}
		<Tooltip
			tip="Speech recognition is not supported in this browser.<br>Please use a different browser if you would like to use this feature."
			bottom
		>
			<SlideToggle
				id="enable-voice-input"
				name="slider-label"
				checked={speechInput}
				active="bg-primary-500"
				size="sm"
				on:click={() => {
					modalStore.trigger({
						type: 'alert',
						title: 'Speech Recognition Error',
						body: 'Speech recognition is not supported in this browser. Please use a different browser if you would like to use this feature.'
					});
				}}
				disabled
				>Voice input
			</SlideToggle>
		</Tooltip>
	{/if}
	<Tooltip
		tip="Audio messages can be played when you recieve a call from ATC or another aircraft."
		bottom
	>
		<SlideToggle
			id="enabled-audio-messages"
			name="slider-label"
			active="bg-primary-500"
			size="sm"
			on:click={() => {
				readRecievedCalls = !readRecievedCalls;
				updateSettings();
			}}
			>Audio messages
		</SlideToggle>
	</Tooltip>
</div>

<style>
	.settings-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		margin-bottom: -10px; /* Account for the tooltip height */
	}
</style>
