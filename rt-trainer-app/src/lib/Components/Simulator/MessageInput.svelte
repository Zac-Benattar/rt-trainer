<script lang="ts">
	import { ExpectedUserMessageStore, SpeechInputStore, UserMessageStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import Tooltip from 'sv-tooltip';

	export let speechRecognitionSupported: boolean = false;
	let speechInput: boolean = false;
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

	$: SpeechInputStore.set(speechInput);

	onMount(() => {
		mounted = true;
	});
</script>

<div class="message-input-container flex flex-col grid-cols-1 bg-surface-500">
	<div class="grow">
		<textarea
			class="textarea bg-secondary-500-50 text-secondary-50 bg-surface-500"
			id="call-input"
			name="call-input"
			rows="4"
			cols="50"
			maxlength="100"
			placeholder="Enter your radio message here."
		/>
	</div>

	<div class="flex flex-row grid-rows-1 justify-end center gap-x-3 px-5 bg-surface-500">
		{#if speechRecognitionSupported}
			<Tooltip
				tip="Speech recognition is experimental, you may need to correct the recorded text."
				bottom
			>
				<div class="flex flex-col py-2">
					<SlideToggle
						id="enable-voice-input"
						name="slider-label"
						checked={speechInput}
						active="bg-primary-500"
						size="sm"
						on:click={() => {
							speechInput = !speechInput;
						}}
						>Voice input
					</SlideToggle>
				</div>
			</Tooltip>
		{:else}
			<Tooltip
				tip="Speech recognition is not supported in this browser.<br>Please use a different browser if you would like to use this feature.<br>Google Chrome, Microsoft Edge and Safari are recommended."
				bottom
			>
				<div class="flex flex-col py-2">
					<SlideToggle
						id="enable-voice-input"
						name="slider-label"
						checked={speechInput}
						active="bg-primary-500"
						size="sm"
						disabled
						>Voice input
					</SlideToggle>
				</div>
			</Tooltip>
		{/if}

		<button class="submit-button btn bg-surface-400" on:click={submit}>Submit</button>

		<button class="clear-button btn self-end bg-surface-400" on:click={handleDelete}>Clear</button>
	</div>
</div>

<style lang="postcss">
	.message-input-container {
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
		overflow: auto;
	}
</style>
