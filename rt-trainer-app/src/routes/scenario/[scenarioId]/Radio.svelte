<script lang="ts">
	import Dial from './Dial.svelte';
	type RadioMode = 'NONE' | 'COM' | 'NAV';
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
	let radioMode: RadioMode = 'NONE';
	let radioDialMode: string = 'OFF';

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

	function onDialModeChange(event: Event) {
		// Fix this hack
		var newDialModeIndex = (<any>event).detail;
		if (newDialModeIndex == 0) {
			console.log('Dial set to off');
			if (radioMode != 'NONE') {
				if (radioMode === 'COM') {
					const COMModeButton = document.getElementById('button-com') as HTMLInputElement;
					COMModeButton.classList.remove('active-button');
				} else if (radioMode === 'NAV') {
					const NAVModeButton = document.getElementById('button-nav') as HTMLInputElement;
					NAVModeButton.classList.remove('active-button');
				}
			}
			radioMode = 'NONE';
		}
		radioDialMode = RadioDialModes[newDialModeIndex];
	}
</script>

<div class="radio-container-outer relative">
	<div class="mode-selecter absolute inset-y-0 left-0">
		<Dial Modes={RadioDialModes} CurrentModeIndex={0} on:modeChange={onDialModeChange} />
	</div>

	<div class="display-panel relative">
		<div class="segmentdisplay display-screen absolute inset-x-0 top-0" />
		<div class="display-buttons-container absolute flex flex-row inset-x-0 bottom-0">
			<button class="button" id="button-com" on:click={handleCOMButtonClick}>COM</button>
			<button class="button" id="button-swap">⇆</button>
			<button class="button" id="button-nav" on:click={handleNAVButtonClick}>NAV</button>
		</div>
	</div>

	<div class="frequency-selecter absolute inset-y-0 right-0">
		<!-- <Dial /> -->
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
