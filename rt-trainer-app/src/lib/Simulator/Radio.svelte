<script lang="ts">
	import FrequencyDial from './FrequencyDial.svelte';
	import Dial from './ModeDial.svelte';
	import RadioDisplay from './RadioDisplay.svelte';
	type RadioMode = 'NONE' | 'IDENT' | 'VFR';
	var radioDialModes: ArrayMaxLength7MinLength2 = [
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
	let radioMode: RadioMode = 'NONE';
	let radioDialModeIndex: number = 0;
	let displayOn: boolean = false;
	let RadioFrequency: number = 1000;
	let frequencyDialEnabled: boolean = false;
	let displayDigitSelected: number = 0;

	// Trigger onradioDialModeChange when radioDialMode changes
	$: onRadioDialModeChange(radioDialModeIndex);

	// Click handlers
	const handleIDENTButtonClick = () => {
		if (radioDialModeIndex != 0) {
			const IDENTModeButton = document.getElementById('button-ident') as HTMLInputElement;
			if (IDENTModeButton != null) {
				if (radioMode != 'IDENT') {
					if (radioMode === 'VFR') {
						const VFRModeButton = document.getElementById('button-vfr') as HTMLInputElement;
						VFRModeButton.classList.remove('active-button');
					}
					radioMode = 'IDENT';
					IDENTModeButton.classList.add('active-button');
				}
			}
		}
	};

	const handleVFRButtonClick = () => {
		if (radioDialModeIndex != 0) {
			const VFRModeButton = document.getElementById('button-vfr') as HTMLInputElement;
			if (VFRModeButton != null) {
				if (radioMode != 'VFR') {
					if (radioMode === 'IDENT') {
						const IDENTModeButton = document.getElementById('button-ident') as HTMLInputElement;
						IDENTModeButton.classList.remove('active-button');
					}
					radioMode = 'VFR';
					VFRModeButton.classList.add('active-button');
				}
			}
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
			if (displayDigitSelected < 3) {
				displayDigitSelected += 1;
			} else {
				displayDigitSelected = 0;
			}
		}
	};

	function onRadioDialModeChange(newIndex: number) {
		if (newIndex == 0) {
			if (radioMode != 'NONE') {
				if (radioMode === 'IDENT') {
					const IDENTModeButton = document.getElementById('button-ident') as HTMLInputElement;
					IDENTModeButton.classList.remove('active-button');
				} else if (radioMode === 'VFR') {
					const VFRModeButton = document.getElementById('button-vfr') as HTMLInputElement;
					VFRModeButton.classList.remove('active-button');
				}
			}
			radioMode = 'NONE';
			displayOn = false;
			frequencyDialEnabled = false;
			displayDigitSelected = 0;
		} else {
			displayOn = true;
			frequencyDialEnabled = true;
		}
	}

	function onRadioFrequencyIncrease(event: Event) {
		let newRadioFrequency = RadioFrequency + 10 ** (3 - displayDigitSelected);
		if (newRadioFrequency < 10000) {
			RadioFrequency = newRadioFrequency;
		}
		else {
			RadioFrequency = 0;
		}
	}

	function onRadioFrequencyReduce(event: Event) {
		let newRadioFrequency = RadioFrequency - 10 ** (3 - displayDigitSelected);
		if (newRadioFrequency >= 0) {
			RadioFrequency = newRadioFrequency;
		}
		else {
			RadioFrequency = 9000;
		}
	}
</script>

<div class="radio-container-outer relative">
	<div class="mode-selecter absolute inset-y-0 left-0">
		<Dial Modes={radioDialModes} bind:CurrentModeIndex={radioDialModeIndex} />
	</div>

	<div class="display-panel flex flex-col justify-center items-center">
		<RadioDisplay
			DisplayOn={displayOn}
			mode={radioDialModes[radioDialModeIndex]}
			{RadioFrequency}
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
			on:dialAntiClockwiseTurn={onRadioFrequencyReduce}
			on:dialClockwiseTurn={onRadioFrequencyIncrease}
			DialEnabled={frequencyDialEnabled}
		/>
	</div>
</div>

<style lang="postcss">
	.radio-container-outer {
		display: flex;
		flex-direction: row;
		justify-content: center;
		background-color: rgb(65, 65, 65);
		width: 1000px;
		height: 240px;
	}

	.mode-selecter {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: left;
		width: 200px;
		height: 240px;
	}

	.display-panel {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: center;
		width: 600px;
		height: 240px;
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
		height: 240px;
	}

	.button {
		width: 50px;
	}

	/* Global flag required otherwise .active-button is unused at page load 
    and hence removed by the compiler */
	:global(.active-button) {
		background-color: #afa548;
		color: black;
	}
</style>
