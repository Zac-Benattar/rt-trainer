<script lang="ts">
	import {
		CurrentTargetStore,
		ATCMessageStore,
		SpeechOutputEnabledStore,
		CurrentTargetFrequencyStore
	} from '$lib/stores';
	import { SlideToggle, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	let currentTarget: string;
	let currentTargetFrequency: string = '0.00';
	let readRecievedCalls: boolean = false;

	CurrentTargetStore.subscribe((value) => {
		currentTarget = value;
	});

	CurrentTargetFrequencyStore.subscribe((value) => {
		currentTargetFrequency = value;
	});

	let atcMessage: string;

	ATCMessageStore.subscribe((value) => {
		atcMessage = value;
	});

	$: SpeechOutputEnabledStore.set(readRecievedCalls);

	const audioMessagesInfoTooltip: PopupSettings = {
		event: 'hover',
		target: 'audioMessagesInfoPopupHover',
		placement: 'bottom'
	};
</script>

<div
	class="p-1.5 rounded-md max-w-lg min-h-72 flex flex-col grid-cols-1 gap-2 bg-surface-500 text-white grow {$$props.class}"
>
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

	<div class="flex flex-row gap-x-1 bg-surface-500 flex-wrap">
		<div class="flex grow">
			<textarea
				class="textarea bg-secondary-500-50 text-secondary-50 call-target-output"
				id="call-target-output"
				name="call-target-output"
				disabled
				rows="2"
				cols="50"
				maxlength="25"
				placeholder="Current Radio Target.">{currentTarget} {currentTargetFrequency}</textarea
			>
		</div>

		<div class="toggle px-2 shrink-0">
			<div class="flex flex-col py-2">
				<SlideToggle
					id="enabled-audio-messages"
					name="slider-label"
					active="bg-primary-500"
					size="sm"
					on:click={() => {
						readRecievedCalls = !readRecievedCalls;
					}}
					><div class="[&>*]:pointer-events-none" use:popup={audioMessagesInfoTooltip}>
						Read Aloud
					</div>
				</SlideToggle>
				<div
					class="card p-4 variant-filled-secondary z-[3]"
					data-popup="audioMessagesInfoPopupHover"
				>
					<p>Audio messages read aloud when you recieve a call from ATC or another aircraft.</p>
					<div class="arrow variant-filled-secondary" />
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

	.call-target-output {
		height: 40px;
	}
</style>
