<script lang="ts">
	import { onMount } from 'svelte';
	import { SpeechBufferStore, SpeechInputEnabledStore } from '$lib/stores';
	import { swapDigitsWithWords } from '$lib/ts/utils';

	export let enabled: boolean = false;
	export let speechEnabled: boolean = true; // User's choice
	export let transmitting: boolean = false;
	let mounted: boolean = false;
	let SpeechRecognitionType: any;
	let SpeechGrammarList: any;
	let SpeechRecognitionEvent: any;
	let recognition: any;
	let transmitButtonClasses = 'disabled';

	SpeechInputEnabledStore.subscribe((value) => {
		speechEnabled = value;
	});

	$: if (speechEnabled && enabled) {
		transmitButtonClasses = 'enabled';
	} else {
		transmitButtonClasses = 'disabled';
	}

	$: if (speechEnabled) {
		SpeechRecognitionType = window.SpeechRecognition || window.webkitSpeechRecognition;
		SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
		SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
		recognition = new SpeechRecognitionType();
		recognition.lang = 'en';
		recognition.onresult = (event: SpeechRecognitionEvent) => {
			let speechInput = event.results[0][0].transcript;
			console.log(`You said: ${speechInput}, Confidence: ${event.results[0][0].confidence}`);

			speechInput = swapDigitsWithWords(speechInput);

			SpeechBufferStore.set(speechInput);
		};
	} else {
		recognition = null;
	}

	const handleTransmitMouseDown = () => {
		if (speechEnabled && enabled && !transmitting) {
			transmitButtonClasses = 'enabled active';
			transmitting = true;
			recognition?.start();
		}
	};

	const handleTransmitMouseUp = () => {
		if (speechEnabled && enabled && transmitting) {
			transmitButtonClasses = 'enabled';
			transmitting = false;
			recognition?.stop();
		}
	};

	const handleTransmitMouseLeave = () => {
		if (speechEnabled && enabled && transmitting) {
			transmitButtonClasses = 'enabled';
			transmitting = false;
			recognition?.stop();
		}
	};

	function onKeyDown(e: { keyCode: any }) {
		switch (e.keyCode) {
			case 32:
				if (speechEnabled) {
					if (enabled && !transmitting) {
						transmitButtonClasses = 'enabled active';
						transmitting = true;
						recognition?.start();
					}
				}
				break;
		}
	}

	function onKeyUp(e: { keyCode: any }) {
		switch (e.keyCode) {
			case 32:
				if (speechEnabled) {
					if (enabled && transmitting) {
						transmitButtonClasses = 'enabled';
						transmitting = false;
						recognition?.stop();
					}
					break;
				}
		}
	}

	onMount(() => {
		mounted = true;
	});
</script>

<div
	id="transmit-button"
	class="{$$props.class} {transmitButtonClasses} transmit-button rounded-full cursor-pointer"
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
