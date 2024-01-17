<script lang="ts">
	import { SpeechInputStore, UserMessageStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import Tooltip from 'sv-tooltip';

	export let speechRecognitionSupported: boolean = false;
	let speechInput: boolean = false;

	let mounted: boolean = false;

	let message: string = 'Enter your radio message here.';

	UserMessageStore.subscribe((value) => {
		if (mounted) {
			const inputBox = document.getElementById('message-input') as HTMLInputElement;
			inputBox.textContent = value;
			message = value;
		}
	});

	$: if (mounted) {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		if (
			inputBox.textContent !== null &&
			inputBox.textContent !== 'Enter your radio message here.'
		) {
			message = inputBox.textContent;
		}
	}

	const dispatch = createEventDispatcher();

	const handleKeypress = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		message = inputBox.textContent ? inputBox.textContent : '';
	};

	const handleDelete = () => {
		resetBox();
	};

	const handleFocus = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		if (inputBox.textContent === 'Enter your radio message here.') {
			inputBox.textContent = '';
			message = '';
		}
	};

	const handleFocusOut = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		if (!inputBox.textContent || !inputBox.textContent.replace(/\s/g, '').length) {
			resetBox();
		}
	};

	const resetBox = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		inputBox.textContent = 'Enter your radio message here.';
		message = '';
	};

	const submit = () => {
		UserMessageStore.set(message);
		dispatch('submit');
	};

	$: SpeechInputStore.set(speechInput);

	onMount(() => {
		mounted = true;
	});
</script>

<div class="message-input-container flex flex-col grid-cols-1 items-end">
	<p
		id="message-input"
		contenteditable="true"
		class="input-box"
		on:focus={handleFocus}
		on:focusout={handleFocusOut}
		on:change={handleFocus}
		on:keypress={handleKeypress}
		on:input={handleKeypress}
	>
		Enter your radio message here.
	</p>

	<div class="flex flex-row grid-rows-1 items-end content-center items-center">
		<div class="speech-input-container">
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
						}}
						>Voice input
					</SlideToggle>
				</Tooltip>
			{:else}
				<Tooltip
					tip="Speech recognition is not supported in this browser.<br>Please use a different browser if you would like to use this feature.<br>Google Chrome, Microsoft Edge and Safari are recommended."
					bottom
				>
					<SlideToggle
						id="enable-voice-input"
						name="slider-label"
						checked={speechInput}
						active="bg-primary-500"
						size="sm"
						disabled
						>Voice input
					</SlideToggle>
				</Tooltip>
			{/if}
		</div>

		<button class="submit-button btn variant-filled" on:click={submit}>Submit</button>
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<!-- svelte-ignore a11y-missing-attribute -->
		<input
			class="delete-button btn"
			type="image"
			src="/images/delete.png"
			on:click={handleDelete}
			on:keypress={handleDelete}
		/>
	</div>
</div>

<style lang="postcss">
	.message-input-container {
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

	.input-box {
		width: 100%;
		height: 120px;
		resize: none;
		overflow: auto;
	}

	.input-box:focus {
		outline: none;
	}

	.speech-input-container {
		padding-right: 10px;
		margin-bottom: -10px;
	}

	.delete-button {
		padding-right: 0px;
		padding-bottom: 0px;
		padding-top: 0px;
		padding-left: 10px;
		width: 60px;
		height: 40px;
	}

	.submit-button {
		color: black;
		background-color: #707070;
	}

	:global(.submit-button:hover) {
		background-color: #707070;
	}
</style>
