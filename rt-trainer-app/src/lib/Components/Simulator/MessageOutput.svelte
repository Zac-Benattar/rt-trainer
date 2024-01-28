<script lang="ts">
	import {
		CurrentTargetStore,
		ATCMessageStore,
		SpeechOutputStore,
		CurrentTargetFrequencyStore
	} from '$lib/stores';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import Tooltip from 'sv-tooltip';

	let currentTarget: string;
	let currentTargetFrequency: string = '0.00';
	let readRecievedCalls: boolean = false;

	CurrentTargetStore.subscribe((value) => {
		currentTarget = value;
	});

	CurrentTargetFrequencyStore.subscribe((value) => {
		currentTargetFrequency = value.toFixed(3);
	});

	let atcMessage: string;

	ATCMessageStore.subscribe((value) => {
		atcMessage = value;
	});

	$: SpeechOutputStore.set(readRecievedCalls);
</script>

<div class="message-output-container flex flex-col grid-cols-1 gap-2 bg-surface-500">
	<div class="grow flex justify-self-stretch">
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
	</div>

	<div class="flex flex-row gap-x-1 bg-surface-500 h-40px">
		<textarea
			class="textarea shrink bg-secondary-500-50 text-secondary-50 call-target-output"
			id="call-target-output"
			name="call-target-output"
			disabled
			rows="1"
			cols="50"
			maxlength="25"
			placeholder="Current Radio Target.">{currentTarget} {currentTargetFrequency}</textarea
		>

		<div class="toggle px-2 shrink-0">
			<Tooltip
				tip="Audio messages read aloud when you recieve a call from ATC or another aircraft."
				bottom
			>
				<div class="flex flex-col py-2">
					<SlideToggle
						id="enabled-audio-messages"
						name="slider-label"
						active="bg-primary-500"
						size="sm"
						on:click={() => {
							readRecievedCalls = !readRecievedCalls;
						}}
						>Read Aloud
					</SlideToggle>
				</div>
			</Tooltip>
		</div>
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
	}

	.textarea {
		width: 100%;
		resize: none;
		overflow: hidden;
		height: auto;
		outline: none;
		border: none;
	}

	.call-target-output {
		height: 40px;
	}
</style>
