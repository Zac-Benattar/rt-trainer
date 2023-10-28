<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let enabled: boolean = false;
	export let transmitting: boolean = false;
	let mounted: boolean = false;

	$: if (mounted) {
		const transmitButton = document.getElementById('transmit-button') as HTMLDivElement;
		if (enabled) {
			transmitButton.classList.add('enabled');
		} else {
			transmitButton.classList.remove('enabled');
		}
	}

	const handleTransmitMouseDown = () => {
		if (enabled) {
			const transmitButton = document.getElementById('transmit-button') as HTMLDivElement;
			if (transmitButton != null) {
				transmitButton.classList.add('active');
				transmitting = true;
			}
		}
	};

	const handleTransmitMouseUp = () => {
		if (enabled) {
			const transmitButton = document.getElementById('transmit-button') as HTMLDivElement;
			if (transmitButton != null) {
				transmitButton.classList.remove('active');
				transmitting = false;
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
	aria-label="Transmit Button"
	tabindex="0"
	role="button"
/>

<style lang="postcss">
	.transmit-button {
		width: 55px;
		height: 55px;
		border-radius: 50%;
		background-color: rgb(255, 65, 65, 0.5);
	}

	:global(.transmit-button.enabled.active) {
		background-color: rgb(255, 0, 0, 1);
	}

	:global(.transmit-button.enabled) {
		background-color: rgb(255, 65, 65, 0.8);
	}
</style>
