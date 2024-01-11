<script lang="ts">
	import { onMount } from 'svelte';
	import { UserMessageStore } from '$lib/stores';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { SettingsStore } from '$lib/stores';

	export let enabled: boolean = false;
	export let speechEnabled: boolean = true; // User's choice
	export let transmitting: boolean = false;
	let mounted: boolean = false;
	let userMessage: string;
	const modalStore = getModalStore();
	let SpeechRecognitionType: any;
	let SpeechGrammarList: any;
	let SpeechRecognitionEvent: any;
	let recognition: any;

	SettingsStore.subscribe((value) => {
		speechEnabled = value.speechInput;
	});

	$: if (speechEnabled && mounted) {
		const transmitButton = document.getElementById('transmit-button') as HTMLDivElement;
		if (enabled) {
			transmitButton.classList.add('enabled');
		} else {
			transmitButton.classList.remove('enabled');
		}
	}

	$: if (speechEnabled && mounted) {
		SpeechRecognitionType = window.SpeechRecognition || window.webkitSpeechRecognition;
		SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
		SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
		recognition = new SpeechRecognitionType();
		recognition.lang = 'en';
		recognition.onresult = (event: SpeechRecognitionEvent) => {
			const speechInput = event.results[0][0].transcript;
			console.log(
				`Input: ${event.results[0][0].transcript} Confidence: ${event.results[0][0].confidence}`
			);
			if (event.results[0][0].confidence > 0.5) {
				console.log('Speech Recognition Success');
				userMessage = speechInput;
				UserMessageStore.set(userMessage);
			} else {
				modalStore.trigger({
					type: 'alert',
					title: 'Speech Recognition Error',
					body: 'Low confidence in speech recognition. Please repeat your message clearly.'
				});
			}
		};
	}

	const handleTransmitMouseDown = () => {
		if (speechEnabled && enabled && !transmitting) {
			const transmitButton = document.getElementById('transmit-button') as HTMLDivElement;
			if (transmitButton != null) {
				transmitButton.classList.add('active');
				transmitting = true;
				recognition?.start();
			}
		}
	};

	const handleTransmitMouseUp = () => {
		if (speechEnabled && enabled && transmitting) {
			const transmitButton = document.getElementById('transmit-button') as HTMLDivElement;
			if (transmitButton != null) {
				transmitButton.classList.remove('active');
				transmitting = false;
				recognition?.stop();
			}
		}
	};

	const handleTransmitMouseLeave = () => {
		if (speechEnabled && enabled && transmitting) {
			const transmitButton = document.getElementById('transmit-button') as HTMLDivElement;
			if (transmitButton != null) {
				transmitButton.classList.remove('active');
				transmitting = false;
				recognition?.stop();
			}
		}
	};

	onMount(() => {
		mounted = true;
	});
</script>

<div
	id="transmit-button"
	class="transmit-button absolute cursor-pointer"
	on:mousedown={handleTransmitMouseDown}
	on:keydown={handleTransmitMouseDown}
	on:mouseup={handleTransmitMouseUp}
	on:keyup={handleTransmitMouseUp}
	on:mouseleave={handleTransmitMouseLeave}
	aria-label="Transmit Button"
	tabindex="0"
	role="button"
/>

<style lang="postcss">
	.transmit-button {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background-color: rgba(80, 40, 40, 1);
	}

	:global(.transmit-button.enabled) {
		background-color: rgb(220, 65, 65, 0.5);
	}

	:global(.transmit-button.enabled.active) {
		background-color: rgb(220, 0, 0, 0.8);
	}
</style>
