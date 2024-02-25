<script lang="ts">
	import {
		ExpectedUserMessageStore,
		LiveFeedbackStore,
		SpeechBufferStore,
		SpeechInputEnabledStore,
		UserMessageStore
	} from '$lib/stores';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { SlideToggle, getModalStore, popup, type PopupSettings } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	export let speechRecognitionSupported: boolean = false;
	let speechInput: boolean = false;
	let liveFeedback: boolean = false;
	let mounted: boolean = false;
	let message: string = '';

	$: if (mounted) {
		const inputBox = document.getElementById('call-input') as HTMLTextAreaElement;
		if (inputBox.value !== null) {
			message = inputBox.value;
		}
	}

	const dispatch = createEventDispatcher();

	const handleDelete = () => {
		resetBox();
	};

	const resetBox = () => {
		const inputBox = document.getElementById('call-input') as HTMLTextAreaElement;
		inputBox.value = '';
		message = '';
		UserMessageStore.set(message);
	};

	const submit = () => {
		const inputBox = document.getElementById('call-input') as HTMLTextAreaElement;
		message = inputBox.value;
		UserMessageStore.set(message);
		dispatch('submit');
	};

	ExpectedUserMessageStore.subscribe((value) => {
		if (value !== '') {
			resetBox();
			const inputBox = document.getElementById('call-input') as HTMLTextAreaElement;
			inputBox.value = value;
			message = value;
			UserMessageStore.set(message);
			ExpectedUserMessageStore.set('');
		}
	});

	SpeechBufferStore.subscribe((value) => {
		if (value !== '') {
			resetBox();
			const inputBox = document.getElementById('call-input') as HTMLTextAreaElement;
			inputBox.value = value;
			message = value;
			UserMessageStore.set(message);
			SpeechBufferStore.set('');
		}
	});

	$: SpeechInputEnabledStore.set(speechInput);

	$: LiveFeedbackStore.set(liveFeedback);

	onMount(() => {
		mounted = true;
	});

	const feedbackTooltip: PopupSettings = {
		event: 'hover',
		target: 'feedbackPopupHover',
		placement: 'bottom'
	};

	const speechRecognitionExperimentalWarningTooltip: PopupSettings = {
		event: 'hover',
		target: 'speechRecognitionExperimentalWarningPopupHover',
		placement: 'bottom'
	};

	const speechRecognitionNotSupportedTooltip: PopupSettings = {
		event: 'hover',
		target: 'speechRecognitionNotSupportedPopupHover',
		placement: 'bottom'
	};
</script>

<div class="p-1.5 rounded-md max-w-lg flex flex-col grid-cols-1 sm:gap-2 bg-surface-500 text-white {$$props.class}">
	<div class="grow flex justify-self-stretch">
		<textarea
			class="textarea bg-secondary-500-50 text-secondary-50 bg-surface-500"
			id="call-input"
			name="call-input"
			rows="4"
			cols="50"
			maxlength="200"
			placeholder="Enter your radio message here."
		/>
	</div>

	<div class="flex flex-row px-2 gap-x-3 place-content-end sm:place-content-evenly flex-wrap">
		<div class="flex flex-col py-2">
			<SlideToggle
				id="enable-live-feedback"
				name="slider-label"
				checked={liveFeedback}
				active="bg-primary-500"
				size="sm"
				on:click={() => {
					liveFeedback = !liveFeedback;
				}}
				><div class="[&>*]:pointer-events-none"
					use:popup={feedbackTooltip}>Feedback</div>
			</SlideToggle>
		</div>
		<div class="card p-4 variant-filled-secondary z-[3]" data-popup="feedbackPopupHover">
			<p>Shows feedback immediately, instead of just at the end of the scenario.</p>
			<div class="arrow variant-filled-secondary" />
		</div>

		{#if speechRecognitionSupported}
			<div
				class="flex flex-col py-2"
			>
				<SlideToggle
					id="enable-voice-input"
					name="slider-label"
					checked={speechInput}
					active="bg-primary-500"
					size="sm"
					on:click={() => {
						speechInput = !speechInput;
						if (speechInput) {
							modalStore.trigger({
								type: 'alert',
								title: 'Speech input is enabled',
								body: 'Hold down the spacebar or click and hold the red button to record your message. Let go when you are done.'
							});
						}
					}}
					><div class="[&>*]:pointer-events-none"
						use:popup={speechRecognitionExperimentalWarningTooltip}>Voice Input</div>
				</SlideToggle>
			</div>
			<div
				class="card p-4 variant-filled-secondary z-[3]"
				data-popup="speechRecognitionExperimentalWarningPopupHover"
			>
				<p>Speech recognition is experimental, you may need to correct the recorded text.</p>
				<div class="arrow variant-filled-secondary" />
			</div>
		{:else}
			<div
				class="flex flex-col py-2"
			>
				<SlideToggle
					id="enable-voice-input"
					name="slider-label"
					checked={speechInput}
					active="bg-primary-500"
					size="sm"
					disabled
					><div class="[&>*]:pointer-events-none"
						use:popup={speechRecognitionNotSupportedTooltip}>Voice Input</div>
				</SlideToggle>
			</div>
			<div
				class="card p-4 variant-filled-secondary z-[3]"
				data-popup="speechRecognitionNotSupportedPopupHover"
			>
				<p>
					Speech recognition is not supported in this browser.<br />Please use a different browser
					if you would like to use this feature.<br />Google Chrome, Microsoft Edge and Safari are
					recommended.
				</p>
				<div class="arrow variant-filled-secondary" />
			</div>
		{/if}

		<button class="submit-button btn px-3 bg-surface-400" on:click={submit}>Submit</button>

		<button class="clear-button btn bg-surface-400" on:click={handleDelete}>Clear</button>
	</div>
</div>

<style lang="postcss">
	.textarea {
		resize: none;
		overflow: auto;
	}

	.btn {
		height: 40px;
	}
</style>
