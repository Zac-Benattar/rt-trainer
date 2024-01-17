<script lang="ts">
	import type { RadioFrequency } from '$lib/ts/SimulatorTypes';
	import { CurrentTargetStore, ATCMessageStore, SpeechOutputStore } from '$lib/stores';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import Tooltip from 'sv-tooltip';

	let currentTarget: RadioFrequency;
	let readRecievedCalls: boolean = false;

	CurrentTargetStore.subscribe((value) => {
		currentTarget = value;
	});

	let atcMessage: string;

	ATCMessageStore.subscribe((value) => {
		atcMessage = value;
	});

	$: SpeechOutputStore.set(readRecievedCalls);
</script>

<div class="message-output-container flex flex-col grid-cols-1 bg-surface-500">
	<div class="flex flex-col gap-y-2 grow">
		<textarea
			class="textarea bg-surface-500 text-secondary-50 call-output"
			id="call-output"
			name="call-output"
			disabled
			rows="3"
			cols="50"
			maxlength="100"
			placeholder="Radio messages will appear here.">{atcMessage}</textarea
		>
		<textarea
			class="textarea bg-secondary-500-50 text-secondary-50 call-target-output"
			id="call-target-output"
			name="call-target-output"
			disabled
			rows="1"
			cols="50"
			maxlength="25"
			placeholder="Radio messages will appear here."
			>{currentTarget.callsign} {currentTarget.frequency}MHz</textarea
		>
	</div>
	<div class="flex flex-row content-evenly justify-end gap-x-3 px-5 bg-surface-500 text-secondary-50">
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
				}}
				>Audio messages
			</SlideToggle>
		</Tooltip>
	</div>
</div>

<style lang="postcss">
	.message-output-container {
		box-sizing: border-box;
		padding: 8px;
		min-width: 490px;
		max-width: 490px;
		height: 200px;
		border-radius: 5px;
		color: black;
	}

	.textarea {
		width: 100%;
		resize: none;
		overflow: hidden;
		height: auto;
		outline: none;
		border: none;
	}

	.call-output {
		
	}

	.call-target-output {
		height: 40px;
	}
</style>
