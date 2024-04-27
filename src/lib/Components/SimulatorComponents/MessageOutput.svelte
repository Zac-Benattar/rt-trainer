<script lang="ts">
	import {
		CurrentTargetStore,
		MostRecentlyReceivedMessageStore,
		SpeechOutputEnabledStore,
		CurrentTargetFrequencyStore,
		CurrentScenarioContextStore,
		SpeechNoiseStore
	} from '$lib/stores';
	import { SlideToggle, popup, type PopupSettings } from '@skeletonlabs/skeleton';

	let currentTarget: string;
	let currentTargetFrequency: string = '000.000';
	let readReceivedCalls: boolean = false;
	let speechNoiseLevel: number = 0;

	CurrentTargetStore.subscribe((value) => {
		currentTarget = value;
	});

	CurrentTargetFrequencyStore.subscribe((value) => {
		currentTargetFrequency = value;
	});

	let mostRecentlyReceivedMessage: string;

	MostRecentlyReceivedMessageStore.subscribe((value) => {
		mostRecentlyReceivedMessage = value;
	});

	let currentContext: string;
	CurrentScenarioContextStore.subscribe((value) => {
		currentContext = value;
		if (currentContext === '') {
			currentContext = 'Context for your current point in the scenario will appear here';
		}
	});

	$: SpeechOutputEnabledStore.set(readReceivedCalls);

	$: SpeechNoiseStore.set(speechNoiseLevel);

	const audioMessagesInfoTooltip: PopupSettings = {
		event: 'hover',
		target: 'audioMessagesInfoPopupHover',
		placement: 'bottom'
	};

	const audioMessagesNoiseInfoTooltip: PopupSettings = {
		event: 'hover',
		target: 'audioMessagesNoiseInfoPopupHover',
		placement: 'bottom'
	};
</script>

<div
	class="p-1.5 card rounded-md max-w-lg min-h-72 flex flex-col grid-cols-1 gap-1 bg-neutral-600 text-white grow {$$props.class}"
>
	<div
		class="border-0 card bg-neutral-700 grow flex flex-col justify-self-stretch px-2 py-1.5 gap-2"
	>
		<div>{currentContext}</div>
		<div>{mostRecentlyReceivedMessage}</div>
	</div>

	<div class="flex flex-row gap-x-1 flex-wrap">
		<div class="toggle px-2 shrink-0">
			<div class="flex flex-col py-2">
				<div class="flex flex-row place-content-start gap-2">
					<div class="flex flex-row place-content-start gap-2">
						<SlideToggle
							id="enabled-audio-messages"
							name="slider-label"
							active="bg-primary-500"
							size="sm"
							role="switch"
							aria-checked={readReceivedCalls}
							aria-label="Toggle text-to-speech audio messages"
							on:click={() => {
								readReceivedCalls = !readReceivedCalls;
							}}
						/>
						<div class="[&>*]:pointer-events-none" use:popup={audioMessagesInfoTooltip}>
							Read Aloud Received Calls
						</div>
						<div
							class="card p-4 variant-filled-secondary z-[3]"
							data-popup="audioMessagesInfoPopupHover"
						>
							<p>Audio messages read aloud when you receive a call from ATC or another aircraft.</p>
							<div class="arrow variant-filled-secondary" />
						</div>
					</div>
					<div class="flex flex-row place-content-start gap-2">
						<SlideToggle
							id="enabled-audio-messages-noise"
							name="slider-label"
							active="bg-primary-500"
							size="sm"
							disabled={!readReceivedCalls}
							role="switch"
							aria-checked={speechNoiseLevel > 0}
							aria-label="Toggle interference noise"
							on:click={() => {
								speechNoiseLevel = speechNoiseLevel === 0 ? 0.1 : 0;
							}}
						/>
						<div class="[&>*]:pointer-events-none" use:popup={audioMessagesNoiseInfoTooltip}>
							Interference Noise
						</div>
						<div
							class="card p-4 variant-filled-secondary z-[3]"
							data-popup="audioMessagesNoiseInfoPopupHover"
						>
							<p>
								Adds static noise to read out calls. <br />Requires Read Aloud Recieved Calls to be
								enabled.
							</p>
							<div class="arrow variant-filled-secondary" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.textarea {
		resize: none;
		overflow: hidden;
		height: auto;
		outline: none;
		border: none;
	}
</style>
