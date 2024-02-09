<script lang="ts">
	import { onMount } from 'svelte';
	import { SpeechBufferStore, SpeechInputEnabledStore } from '$lib/stores';
	import { getModalStore } from '@skeletonlabs/skeleton';

	export let enabled: boolean = false;
	export let speechEnabled: boolean = true; // User's choice
	export let transmitting: boolean = false;
	let mounted: boolean = false;
	const modalStore = getModalStore();
	let SpeechRecognitionType: any;
	let SpeechGrammarList: any;
	let SpeechRecognitionEvent: any;
	let recognition: any;

	SpeechInputEnabledStore.subscribe((value) => {
		speechEnabled = value;
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
			console.log(`You said: ${speechInput}, Confidence: ${event.results[0][0].confidence}`);

			SpeechBufferStore.set(speechInput);
		};
	}

	const handleTransmitMouseDown = () => {
		if (speechEnabled && enabled && !transmitting) {
			const transmitButton = document.getElementById('transmit-button') as HTMLDivElement;
			if (transmitButton != null) {
				transmitButton.classList.add('active');
				transmitting = true;
				recognition?.start();
				console.log('Transmitting...');
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
				console.log('Stopped transmitting...');
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

	function onKeyDown(e: { keyCode: any }) {
		switch (e.keyCode) {
			case 32:
				const transmitButton = document.getElementById('transmit-button') as HTMLDivElement;
				if (transmitButton != null) {
					transmitButton.classList.add('active');
					transmitting = true;
					recognition?.start();
				}
				break;
		}
	}

	function onKeyUp(e: { keyCode: any }) {
		switch (e.keyCode) {
			case 32:
				const transmitButton = document.getElementById('transmit-button') as HTMLDivElement;
				if (transmitButton != null) {
					transmitButton.classList.remove('active');
					transmitting = false;
					recognition?.stop();
				}
				break;
		}
	}

	onMount(() => {
		mounted = true;
	});
</script>

<div
	id="transmit-button"
	class="{$$props.class} transmit-button rounded-full cursor-pointer"
	on:mousedown={handleTransmitMouseDown}
	on:keydown={handleTransmitMouseDown}
	on:mouseup={handleTransmitMouseUp}
	on:keyup={handleTransmitMouseUp}
	on:mouseleave={handleTransmitMouseLeave}
	aria-label="Transmit Button"
	tabindex="0"
	role="button"
/>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<style lang="postcss">
	.transmit-button {
		width: 50px;
		height: 50px;
		background-color: rgba(80, 40, 40, 1);
	}

	:global(.transmit-button.enabled) {
		background-color: rgb(220, 65, 65, 0.5);
	}

	:global(.transmit-button.enabled.active) {
		background-color: rgb(220, 0, 0, 0.8);
	}
</style>
