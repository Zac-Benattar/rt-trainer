<script lang="ts">
	import DoubleFrequencyDial from './DoubleFrequencyDial.svelte';
	import Dial from './ModeDial.svelte';
	import RadioDisplay from './RadioDisplay.svelte';
	type RadioMode = 'COM' | 'NAV';
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
	export let radioMode: RadioMode = 'COM';
	export let radioDialMode: string = 'OFF';
	export let radioSelectedFrequency: number = 126.410;
	export let radioAlternateFrequency: number = 123.170;
	export let radioTertiaryFrequency: number = 179.200;
	export let displayOn: boolean = false;
	export let frequencyDialEnabled: boolean = false;

	// Click handlers
	const handleCOMButtonClick = () => {
		if (radioDialMode != 'OFF') {
			const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
			if (COMModeButton != null) {
				if (radioMode != 'COM') {
					if (radioMode === 'NAV') {
						const NAVModeButton = document.getElementById('button-nav') as HTMLInputElement;
						NAVModeButton.classList.remove('active-button');
					}
					radioMode = 'COM';
					COMModeButton.classList.add('active-button');
				}
			}
		}
	};

	const handleNAVButtonClick = () => {
		if (radioDialMode != 'OFF') {
			const NAVModeButton = document.getElementById('button-nav') as HTMLInputElement;
			if (NAVModeButton != null) {
				if (radioMode != 'NAV') {
					if (radioMode === 'COM') {
						const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
						COMModeButton.classList.remove('active-button');
					}
					radioMode = 'NAV';
					NAVModeButton.classList.add('active-button');
				}
			}
		}
	};

	const handleSWAPButtonClick = () => {
		if (radioDialMode != 'OFF') {
			let tempFrequency = radioSelectedFrequency;
			radioSelectedFrequency = radioAlternateFrequency;
			radioAlternateFrequency = tempFrequency;
		}
	};

	function onDialModeChange(event: Event) {
		// Fix this hack
		var newDialModeIndex = (<any>event).detail;
		if (newDialModeIndex == 0) {
			if (radioMode === 'COM') {
				const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
				COMModeButton.classList.remove('active-button');
			} else if (radioMode === 'NAV') {
				const NAVModeButton = document.getElementById('button-nav') as HTMLInputElement;
				NAVModeButton.classList.remove('active-button');
				radioMode = 'COM';
			}
			displayOn = false;
			frequencyDialEnabled = false;
		} else {
			const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
			COMModeButton.classList.add('active-button');
			displayOn = true;
			frequencyDialEnabled = true;
		}
		radioDialMode = RadioDialModes[newDialModeIndex];
	}

	function onRadioFrequencyIncreaseLarge(event: Event) {
		radioSelectedFrequency += 1;
	}

	function onRadioFrequencyReduceLarge(event: Event) {
		radioSelectedFrequency -= 1;
	}

	function onRadioFrequencyIncreaseSmall(event: Event) {
		radioSelectedFrequency += 0.005;
	}

	function onRadioFrequencyReduceSmall(event: Event) {
		radioSelectedFrequency -= 0.005;
	}
</script>

<div class="radio-container-outer relative card">
	<div class="mode-selecter absolute inset-y-0 left-0">
		<Dial Modes={RadioDialModes} CurrentModeIndex={0} on:modeChange={onDialModeChange} />
	</div>

	<div class="display-panel flex flex-col justify-center items-center">
		<div class="active-standby-label-container flex flex-row">
			<div class="active-standby-label" style="margin-right:130px;">ACTIVE</div>
			<div class="active-standby-label">STANDBY</div>
		</div>
		<RadioDisplay
			DisplayOn={displayOn}
			mode={radioMode}
			radioPrimaryFrequency={radioSelectedFrequency}
			{radioAlternateFrequency}
			{radioTertiaryFrequency}
		/>
		<div class="display-buttons-container">
			<button class="button" id="button-com" on:click={handleCOMButtonClick}>COM</button>
			<button class="button" id="button-swap" on:click={handleSWAPButtonClick}>⇆</button>
			<button class="button" id="button-nav" on:click={handleNAVButtonClick}>NAV</button>
		</div>
	</div>

	<div class="frequency-selecter absolute inset-y-0 right-0">
		<DoubleFrequencyDial
			DialEnabled={frequencyDialEnabled}
			on:dialInnerAntiClockwiseTurn={onRadioFrequencyReduceLarge}
			on:dialInnerClockwiseTurn={onRadioFrequencyIncreaseLarge}
			on:dialOuterAntiClockwiseTurn={onRadioFrequencyReduceSmall}
			on:dialOuterClockwiseTurn={onRadioFrequencyIncreaseSmall}
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
		background-color: #afa548;
		color: black;
	}
</style>
