<script lang="ts">
	import { onMount } from 'svelte';
	import FrequencyDial from './FrequencyDial.svelte';
	import Dial from './ModeDial.svelte';
	import TransponderDisplay from './TransponderDisplay.svelte';
	import { createEventDispatcher } from 'svelte';

	var TransponderDialModes: ArrayMaxLength7MinLength2 = [
		'OFF',
		'SBY',
		'GND',
		'STBY',
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
	export let identEnabled: boolean = false;
	export let transponderDialModeIndex: number = 0;
	export let displayOn: boolean = false;
	export let digitArr = [7, 0, 0, 0];
	export let frequency: number = 7000;
	export let frequencyDialEnabled: boolean = false;
	export let displayDigitSelected: number = 0;
	let mounted: boolean = false;

	const dispatch = createEventDispatcher();

	$: if (mounted) {
		frequency = parseInt(digitArr.join(''));
	}

	// Trigger onTransponderDialModeChange when transponderDialMode changes
	$: onTransponderDialModeChange(transponderDialModeIndex);

	// Click handlers
	const handleIDENTButtonClick = () => {
		if (transponderDialModeIndex != 0) {
			const IDENTModeButton = document.getElementById('button-ident') as HTMLInputElement;
			// Make flash continuously when clicked, untill clicked again
			IDENTModeButton.classList.toggle('blink-continiously');
			identEnabled = !identEnabled;
		}
	};

	const handleVFRButtonClick = () => {
		if (transponderDialModeIndex != 0) {
			const VFRModeButton = document.getElementById('button-vfr') as HTMLInputElement;
			// Make flash on when pressed then remain off
			VFRModeButton.classList.toggle('blink-once');
			dispatch('VFR Clicked');
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

	function onTransponderDialModeChange(newIndex: number) {
		if (newIndex == 0) {
			if (identEnabled) {
				const IDENTModeButton = document.getElementById('button-ident') as HTMLInputElement;
				IDENTModeButton.classList.remove('active-button');
				identEnabled = false;
			}
			displayOn = false;
			frequencyDialEnabled = false;
		} else {
			displayOn = true;
			frequencyDialEnabled = true;
		}
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

<div class="transponder-container-outer relative card">
	<div class="mode-selecter absolute inset-y-0 left-0">
		<Dial Modes={TransponderDialModes} bind:CurrentModeIndex={transponderDialModeIndex} />
	</div>

	<div class="display-panel flex flex-col justify-center items-center">
		<TransponderDisplay
			DisplayOn={displayOn}
			mode={TransponderDialModes[transponderDialModeIndex]}
			{digitArr}
			DigitSelected={displayDigitSelected}
		/>
		<div class="display-buttons-container">
			<button class="button" id="button-ident" on:click={handleIDENTButtonClick}>IDENT</button>
			<button class="button" id="button-vfr" on:click={handleVFRButtonClick}>VFR</button>
			<button class="button" id="button-enter" on:click={handleENTERButtonClick}>ENT</button>
			<button class="button" id="button-back" on:click={handleBACKButtonClick}>BACK</button>
		</div>
	</div>

	<div class="frequency-selecter absolute inset-y-0 right-0">
		<FrequencyDial
			on:dialAntiClockwiseTurn={onTransponderFrequencyReduce}
			on:dialClockwiseTurn={onTransponderFrequencyIncrease}
			DialEnabled={frequencyDialEnabled}
		/>
	</div>
</div>

<style lang="postcss">
	.transponder-container-outer {
		display: flex;
		flex-direction: row;
		justify-content: center;
		background-color: rgb(65, 65, 65);
		width: 1000px;
		height: 200px;
	}

	.mode-selecter {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: left;
		width: 200px;
		height: 200px;
	}

	.display-panel {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: center;
		width: 600px;
		height: 200px;
	}

	.display-buttons-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		object-position: center bottom;
	}

	.frequency-selecter {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: right;
		width: 200px;
		height: 200px;
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
