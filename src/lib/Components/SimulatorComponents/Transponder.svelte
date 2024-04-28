<script lang="ts">
	import { onMount } from 'svelte';
	import FrequencyDial from './FrequencyDial.svelte';
	import Dial from './ModeDial.svelte';
	import TransponderDisplay from './TransponderDisplay.svelte';
	import { TransponderStateStore } from '$lib/stores';
	import type { TransponderState } from '$lib/ts/SimulatorTypes';

	const transponderDialModes: ArrayMaxLength7MinLength2 = [
		'OFF',
		'SBY',
		'GND',
		'ON',
		'ALT',
		'TEST'
	];

	type ArrayMaxLength7MinLength2 = readonly [
		string,
		string,
		string?,
		string?,
		string?,
		string?,
		string?
	];

	// Holds current transponder state
	let transponderState: TransponderState = {
		dialMode: 'OFF',
		frequency: '7000',
		identEnabled: false,
		vfrHasExecuted: false
	};
	let dialModeIndex: number = 0;
	let displayOn: boolean = false;
	let digitArr = [7, 0, 0, 0];
	let frequency: string = '7000';
	let frequencyDialEnabled: boolean = false;
	let displayDigitSelected: number = 0;
	let mounted: boolean = false;

	$: TransponderStateStore.set(transponderState);

	$: if (mounted) {
		frequency = digitArr.join('');
		transponderState.frequency = frequency;
	}

	// Trigger onTransponderDialModeChange when transponderDialMode changes
	$: onTransponderDialModeChange(dialModeIndex);

	// Click handlers
	const handleIDENTButtonClick = () => {
		if (transponderState.dialMode != 'OFF') {
			const IDENTModeButton = document.getElementById('button-ident') as HTMLInputElement;
			// Make flash continuously when clicked, untill clicked again
			IDENTModeButton.classList.toggle('blink-continiously');
			transponderState.identEnabled = !transponderState.identEnabled;
		}
	};

	const handleVFRButtonClick = () => {
		if (transponderState.dialMode != 'OFF') {
			const VFRModeButton = document.getElementById('button-vfr') as HTMLInputElement;
			// Make flash on when pressed then remain off
			VFRModeButton.classList.toggle('blink-once');
			transponderState.identEnabled = true;
		}
	};

	const handleENTERButtonClick = () => {
		if (displayOn) {
			if (displayDigitSelected < 3) {
				displayDigitSelected += 1;
			} else {
				displayDigitSelected = 0;
			}
		}
	};

	const handleBACKButtonClick = () => {
		if (displayOn) {
			if (displayDigitSelected > 0) {
				displayDigitSelected -= 1;
			} else {
				displayDigitSelected = 3;
			}
		}
	};

	function onTransponderDialModeChange(newModeIndex: number) {
		if (newModeIndex == 0) {
			if (transponderState.identEnabled) {
				const IDENTModeButton = document.getElementById('button-ident') as HTMLInputElement;
				IDENTModeButton.classList.remove('active-button');
				transponderState.identEnabled = false;
			}
			transponderState.dialMode = 'OFF';
			displayOn = false;
			frequencyDialEnabled = false;
		} else {
			switch (newModeIndex) {
				case 1:
					transponderState.dialMode = 'SBY';
					break;
				case 2:
					transponderState.dialMode = 'GND';
					break;
				case 3:
					transponderState.dialMode = 'ON';
					break;
				case 4:
					transponderState.dialMode = 'ALT';
					break;
				case 5:
					transponderState.dialMode = 'TEST';
					break;
			}

			displayOn = true;
			frequencyDialEnabled = true;
		}

		// Shouldnt need to do this here as we have a reactive statement for this, but it seems to be necessary
		// for the store to update when the dail mode changes
		TransponderStateStore.set(transponderState);
	}

	function onTransponderFrequencyIncrease(event: Event) {
		if (digitArr[displayDigitSelected] == 7) {
			digitArr[displayDigitSelected] = 0;
		} else {
			digitArr[displayDigitSelected] += 1;
		}
	}

	function onTransponderFrequencyReduce(event: Event) {
		if (digitArr[displayDigitSelected] == 0) {
			digitArr[displayDigitSelected] = 7;
		} else {
			digitArr[displayDigitSelected] -= 1;
		}
	}

	onMount(() => {
		mounted = true;
	});
</script>

<div
	class="flex flex-row card gap-2 bg-neutral-600 text-white grow place-content-evenly p-3 max-w-screen-lg flex-wrap"
>
	<Dial
		Modes={transponderDialModes}
		id="transponder-mode-dial"
		bind:CurrentModeIndex={dialModeIndex}
	/>

	<div class="display-panel flex flex-col justify-center items-center grow order-first sm:order-2">
		<TransponderDisplay
			DisplayOn={displayOn}
			mode={transponderDialModes[dialModeIndex]}
			{digitArr}
			DigitSelected={displayDigitSelected}
		/>
		<div class="pt-1 flex flex-row items-center gap-2">
			<button class="button" id="button-ident" on:click={handleIDENTButtonClick}>IDENT</button>
			<button class="button" id="button-vfr" on:click={handleVFRButtonClick}>VFR</button>
			<button class="button" id="button-enter" on:click={handleENTERButtonClick}>ENT</button>
			<button class="button" id="button-back" on:click={handleBACKButtonClick}>BACK</button>
		</div>
	</div>

	<div class="flex flex-row mx-4 order-3">
		<FrequencyDial
			on:dialAntiClockwiseTurn={onTransponderFrequencyReduce}
			on:dialClockwiseTurn={onTransponderFrequencyIncrease}
			DialEnabled={frequencyDialEnabled}
			id="transponder-frequency-dial"
		/>
	</div>
</div>

<style lang="postcss">
	.display-panel {
		max-width: 600px;
		min-width: 200px;
	}

	.button {
		width: 50px;
	}

	/* Global flag required otherwise .active-button is unused at page load 
    and hence removed by the compiler */
	:global(.active-button) {
		background-color: rgb(175, 165, 72);
		color: black;
	}

	:global(.blink-continiouosly) {
		animation: blinker 2s linear infinite;
	}

	:global(.blink-once) {
		animation: blinker 2s linear 1;
	}

	@keyframes blinker {
		25% {
			background-color: rgb(175, 165, 72, 1);
		}
		50% {
			background-color: rgba(175, 165, 72, 0);
		}
		75% {
			background-color: rgba(175, 165, 72, 1);
		}
	}
</style>
