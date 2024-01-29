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
		activeFrequency: 121.8,
		standbyFrequency: 124.03,
		tertiaryFrequency: 177.2
	};
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
			let tempFrequency = radioState.activeFrequency;
			radioState.activeFrequency = radioState.standbyFrequency;
			radioState.standbyFrequency = tempFrequency;
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
	}

	function onRadioFrequencyIncreaseLarge() {
		radioState.standbyFrequency += 1;
	}

	function onRadioFrequencyReduceLarge() {
		radioState.standbyFrequency -= 1;
	}

	// Precision errors are a problem here
	function onRadioFrequencyIncreaseSmall() {
		radioState.standbyFrequency = parseFloat((radioState.standbyFrequency + 0.005).toPrecision(6));
	}

	function onRadioFrequencyReduceSmall() {
		radioState.standbyFrequency = parseFloat((radioState.standbyFrequency - 0.005).toPrecision(6));
	}
</script>

<div class="radio-container-outer relative card">
	<div class="left-container absolute inset-y-0 left-0">
		<div class="power-selector-container content-center">
			<Dial Modes={RadioDialModes} CurrentModeIndex={0} on:modeChange={onDialModeChange} />
		</div>
		<div
			class="transmit-button-container absolute"
			style="width: 55px; height: 55px; left: 130px; top: 85px;"
		>
			<TransmitButton enabled={transmitButtonEnabled} {transmitting} />
		</div>
	</div>

	<div class="center-container flex flex-col justify-center items-center">
		<div class="active-standby-label-container flex flex-row">
			<div class="active-standby-label" style="margin-right:130px;">ACTIVE</div>
			<div class="active-standby-label">STANDBY</div>
		</div>
		<RadioDisplay
			DisplayOn={displayOn}
			bind:mode={radioState.mode}
			bind:activeFrequency={radioState.activeFrequency}
			bind:standbyFrequency={radioState.standbyFrequency}
			bind:tertiaryFrequency={radioState.tertiaryFrequency}
		/>
		<div class="display-buttons-container">
			<button class="button" id="button-com" on:click={handleCOMButtonClick}>COM</button>
			<button class="button" id="button-swap" on:click={handleSWAPButtonClick}>⇆</button>
			<button class="button" id="button-nav" on:click={handleNAVButtonClick}>NAV</button>
		</div>
	</div>

	<div class="right-container absolute inset-y-0 right-0">
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
	.radio-container-outer {
		display: flex;
		flex-direction: row;
		justify-content: center;
		background-color: rgb(65, 65, 65);
		width: 1000px;
		height: 160px;
	}

	.left-container {
		display: flex;
		flex-direction: row;
		object-position: left;
		width: 200px;
		height: 160px;
	}

	.power-selector-container {
		width: 75%;
		height: 100%;
		justify-content: center;
	}

	.transmit-button-container {
		width: 30%;
		height: 100%;
	}

	.center-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: center;
		width: 600px;
		height: 160px;
	}

	.display-buttons-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		object-position: center bottom;
	}

	.right-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: right;
		width: 200px;
		height: 160px;
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
