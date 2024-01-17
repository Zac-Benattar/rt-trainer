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

<div class="kneeboard flex flex-col grid-cols-1">
	<p class="output-box">{atcMessage}</p>
	<p class="output-data-box">
		Current Target: {currentTarget.callsign}<br />
		{currentTarget.frequency} MHz
		{currentTarget.frequencyType}
	</p>
	<div class="play-atc-call-container">
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
	.kneeboard {
		box-sizing: border-box;
		padding: 10px;
		min-width: 490px;
		max-width: 490px;
		height: 200px;
		background-color: #fff;
		padding: 20px;
		outline: solid 1px #ccc;
		border-radius: 5px;
		color: black;
	}

	.play-atc-call-container {
		margin-top: 10px;
		margin-bottom: -10px;
	}

	.output-box {
		width: 100%;
		height: 120px;
		resize: none;
		overflow: auto;
	}
</style>
