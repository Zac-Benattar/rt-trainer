<script lang="ts">
	import DoubleFrequencyDial from './DoubleFrequencyDial.svelte';
	import Dial from './ModeDial.svelte';
	import RadioDisplay from './RadioDisplay.svelte';
	import TransmitButton from './TransmitButton.svelte';
	import { RadioStateStore } from '$lib/stores';
	import type { RadioState } from '$lib/ts/SimulatorTypes';

	var RadioDialModes: ArrayMaxLength7MinLength2 = ['OFF', 'SBY'];
	type ArrayMaxLength7MinLength2 = readonly [
		string,
		string,
		string?,
		string?,
		string?,
		string?,
		string?
	];

	// Holds current radio settings
	let radioState: RadioState = {
		mode: 'OFF',
		dialMode: 'OFF',
		activeFrequency: '121.800',
		standbyFrequency: '129.800',
		tertiaryFrequency: '177.200'
	};

	let activeFrequency: number = 121.8;
	let standbyFrequency: number = 129.8;
	let tertiaryFrequency: number = 177.2;

	let displayOn: boolean = false;
	let frequencyDialEnabled: boolean = false;
	let transmitButtonEnabled: boolean = false;
	let transmitting: boolean = false;

	$: RadioStateStore.set(radioState);

	// Click handlers
	const handleCOMButtonClick = () => {
		if (radioState.dialMode != 'OFF') {
			const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
			if (COMModeButton != null) {
				if (radioState.mode != 'COM') {
					if (radioState.mode === 'NAV') {
						const NAVModeButton = document.getElementById('button-nav') as HTMLInputElement;
						NAVModeButton.classList.remove('active-button');
					}
					radioState.mode = 'COM';
					COMModeButton.classList.add('active-button');
				}
			}
		}
	};

	const handleNAVButtonClick = () => {
		if (radioState.dialMode != 'OFF') {
			const NAVModeButton = document.getElementById('button-nav') as HTMLInputElement;
			if (NAVModeButton != null) {
				if (radioState.mode != 'NAV') {
					if (radioState.mode === 'COM') {
						const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
						COMModeButton.classList.remove('active-button');
					}
					radioState.mode = 'NAV';
					NAVModeButton.classList.add('active-button');
				}
			}
		}
	};

	const handleSWAPButtonClick = () => {
		if (radioState.dialMode != 'OFF') {
			let tempFrequency: number = activeFrequency;
			activeFrequency = standbyFrequency;
			standbyFrequency = tempFrequency;

			radioState.activeFrequency = activeFrequency.toFixed(3);
			radioState.standbyFrequency = standbyFrequency.toFixed(3);
		}
	};

	function onDialModeChange(event: Event) {
		// Fix this hack
		var newDialModeIndex = (<any>event).detail;
		if (newDialModeIndex == 0) {
			if (radioState.mode === 'COM') {
				const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
				COMModeButton.classList.remove('active-button');
			} else if (radioState.mode === 'NAV') {
				const NAVModeButton = document.getElementById('button-nav') as HTMLInputElement;
				NAVModeButton.classList.remove('active-button');
				radioState.mode = 'COM';
			}
			displayOn = false;
			frequencyDialEnabled = false;
			transmitButtonEnabled = false;
		} else {
			const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
			COMModeButton.classList.add('active-button');
			displayOn = true;
			frequencyDialEnabled = true;
			transmitButtonEnabled = true;
		}

		if (newDialModeIndex == 0) {
			radioState.dialMode = 'OFF';
		} else {
			radioState.dialMode = 'SBY';
		}

		// Shouldnt need to do this here as we have a reactive statement for this, but it seems to be necessary
		// for the store to update when the dail mode changes
		RadioStateStore.set(radioState);
	}

	function onRadioFrequencyIncreaseLarge() {
		standbyFrequency += 1;
		radioState.standbyFrequency = standbyFrequency.toFixed(3);
	}

	function onRadioFrequencyReduceLarge() {
		standbyFrequency -= 1;
		radioState.standbyFrequency = standbyFrequency.toFixed(3);
	}

	// Precision errors are a problem here
	function onRadioFrequencyIncreaseSmall() {
		standbyFrequency = parseFloat((standbyFrequency + 0.005).toPrecision(6));
		radioState.standbyFrequency = standbyFrequency.toFixed(3);
	}

	function onRadioFrequencyReduceSmall() {
		standbyFrequency = parseFloat((standbyFrequency - 0.005).toPrecision(6));
		radioState.standbyFrequency = standbyFrequency.toFixed(3);
	}
</script>

<div
	class="flex flex-row card gap-2 bg-neutral-600 text-white grow place-content-evenly p-3 max-w-screen-lg flex-wrap"
>
	<Dial Modes={RadioDialModes} CurrentModeIndex={0} on:modeChange={onDialModeChange} />

	<div class="flex flex-col place-content-end gap-1">
		<div class="flex flex-row place-content-center">
			<TransmitButton enabled={transmitButtonEnabled} {transmitting} />
		</div>
		<div class="flex flex-row place-content-center">Transmit</div>
	</div>

	<div class="display-panel flex flex-col w-full grow order-first sm:order-2">
		<div class="flex flex-row place-content-evenly grow">
			<div>ACTIVE</div>
			<div>STANDBY</div>
		</div>
		<RadioDisplay
			DisplayOn={displayOn}
			bind:mode={radioState.mode}
			bind:activeFrequency
			bind:standbyFrequency
			bind:tertiaryFrequency
		/>
		<div class="display-buttons-container flex flex-row grow place-content-center">
			<button class="button" id="button-com" on:click={handleCOMButtonClick}>COM</button>
			<button class="button" id="button-swap" on:click={handleSWAPButtonClick}>⇆</button>
			<button class="button" id="button-nav" on:click={handleNAVButtonClick}>NAV</button>
		</div>
	</div>
	<div class="flex flex-row mx-2 order-5">
		<DoubleFrequencyDial
			DialEnabled={frequencyDialEnabled}
			on:dialInnerAntiClockwiseTurn={onRadioFrequencyReduceSmall}
			on:dialInnerClockwiseTurn={onRadioFrequencyIncreaseSmall}
			on:dialOuterAntiClockwiseTurn={onRadioFrequencyReduceLarge}
			on:dialOuterClockwiseTurn={onRadioFrequencyIncreaseLarge}
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
		background-color: #afa548;
		color: black;
	}
</style>
