<script lang="ts">
	import FrequencyDial from './FrequencyDial.svelte';
	import Dial from './ModeDial.svelte';
	import TransponderDisplay from './TransponderDisplay.svelte';
	type TransponderMode = 'COM' | 'NAV';
	var transponderDialModes: ArrayMaxLength7MinLength2 = ['OFF', 'SBY'];
	type ArrayMaxLength7MinLength2 = readonly [
		string,
		string,
		string?,
		string?,
		string?,
		string?,
		string?
	];
	export let transponderMode: TransponderMode = 'COM';
	export let transponderDialMode: string = 'OFF';
	export let transponderSelectedFrequency: number = 126.410;
	export let transponderAlternateFrequency: number = 123.170;
	export let transponderTertiaryFrequency: number = 179.200;
	export let displayOn: boolean = false;
	export let frequencyDialEnabled: boolean = false;

	// Click handlers
	const handleCOMButtonClick = () => {
		if (transponderDialMode != 'OFF') {
			const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
			if (COMModeButton != null) {
				if (transponderMode != 'COM') {
					if (transponderMode === 'NAV') {
						const NAVModeButton = document.getElementById('button-nav') as HTMLInputElement;
						NAVModeButton.classList.remove('active-button');
					}
					transponderMode = 'COM';
					COMModeButton.classList.add('active-button');
				}
			}
		}
	};

	const handleNAVButtonClick = () => {
		if (transponderDialMode != 'OFF') {
			const NAVModeButton = document.getElementById('button-nav') as HTMLInputElement;
			if (NAVModeButton != null) {
				if (transponderMode != 'NAV') {
					if (transponderMode === 'COM') {
						const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
						COMModeButton.classList.remove('active-button');
					}
					transponderMode = 'NAV';
					NAVModeButton.classList.add('active-button');
				}
			}
		}
	};

	const handleSWAPButtonClick = () => {
		if (transponderDialMode != 'OFF') {
			let tempFrequency = transponderSelectedFrequency;
			transponderSelectedFrequency = transponderAlternateFrequency;
			transponderAlternateFrequency = tempFrequency;
		}
	}

	function onDialModeChange(event: Event) {
		// Fix this hack
		var newDialModeIndex = (<any>event).detail;
		if (newDialModeIndex == 0) {
			if (transponderMode === 'COM') {
				const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
				COMModeButton.classList.remove('active-button');
			} else if (transponderMode === 'NAV') {
				const NAVModeButton = document.getElementById('button-nav') as HTMLInputElement;
				NAVModeButton.classList.remove('active-button');
				transponderMode = 'COM';
			}
			displayOn = false;
		} else {
			const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
			COMModeButton.classList.add('active-button');
			displayOn = true;
		}
		transponderDialMode = transponderDialModes[newDialModeIndex];
	}

	function ontransponderFrequencyIncrease(event: Event) {
		transponderSelectedFrequency += 1;
	}

	function ontransponderFrequencyReduce(event: Event) {
		transponderSelectedFrequency -= 1;
	}
</script>

<div class="transponder-container-outer relative">
	<div class="mode-selecter absolute inset-y-0 left-0">
		<Dial Modes={transponderDialModes} CurrentModeIndex={0} on:modeChange={onDialModeChange} />
	</div>

	<div class="display-panel flex flex-col justify-center items-center">
		<div class="active-standby-label-container flex flex-row">
			<div class="active-standby-label" style="margin-right:130px;">STBY</div>
			<div class="active-standby-label">ACTIVE</div>
		</div>
		<TransponderDisplay
			DisplayOn={displayOn}
			mode={transponderMode}
			transponderPrimaryFrequency={transponderSelectedFrequency}
			{transponderAlternateFrequency}
			{transponderTertiaryFrequency}
		/>
		<div class="display-buttons-container">
			<button class="button" id="button-com" on:click={handleCOMButtonClick}>COM</button>
			<button class="button" id="button-swap" on:click={handleSWAPButtonClick}>⇆</button>
			<button class="button" id="button-nav" on:click={handleNAVButtonClick}>NAV</button>
		</div>
	</div>

	<div class="frequency-selecter absolute inset-y-0 right-0">
		<FrequencyDial
			on:dialAntiClockwiseTurn={ontransponderFrequencyReduce}
			on:dialClockwiseTurn={ontransponderFrequencyIncrease}
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
