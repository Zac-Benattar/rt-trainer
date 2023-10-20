<script lang="ts">
	import Dial from './Dial.svelte';
	import TransponderDisplay from './TransponderDisplay.svelte';
	type TransponderMode = 'NONE' | 'IDENT' | 'VFR';
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
	let transponderMode: TransponderMode = 'NONE';
	let transponderDialMode: string = 'OFF';
	let displayOn: boolean = false;

	// Click handlers
	const handleIDENTButtonClick = () => {
		if (transponderDialMode != 'OFF') {
			const IDENTModeButton = document.getElementById('button-ident') as HTMLInputElement;
			if (IDENTModeButton != null) {
				if (transponderMode != 'IDENT') {
					if (transponderMode === 'VFR') {
						const VFRModeButton = document.getElementById('button-vfr') as HTMLInputElement;
						VFRModeButton.classList.remove('active-button');
					}
					transponderMode = 'IDENT';
					IDENTModeButton.classList.add('active-button');
				}
			}
		}
	};

	const handleVFRButtonClick = () => {
		if (transponderDialMode != 'OFF') {
			const VFRModeButton = document.getElementById('button-vfr') as HTMLInputElement;
			if (VFRModeButton != null) {
				if (transponderMode != 'VFR') {
					if (transponderMode === 'IDENT') {
						const IDENTModeButton = document.getElementById('button-ident') as HTMLInputElement;
						IDENTModeButton.classList.remove('active-button');
					}
					transponderMode = 'VFR';
					VFRModeButton.classList.add('active-button');
				}
			}
		}
	};

	const handleENTERButtonClick = () => {
		const ENTERButton = document.getElementById('button-enter') as HTMLInputElement;
		const Display = document.getElementById('display-screen') as HTMLInputElement;
	};

	const handleBACKButtonClick = () => {
		const BACKButton = document.getElementById('button-back') as HTMLInputElement;
		const Display = document.getElementById('display-screen') as HTMLInputElement;
	};

	function onTransponderDialModeChange(event: Event) {
		var newDialModeIndex = (<any>event).detail; // Fix this hack
		if (newDialModeIndex == 0) {
			console.log('Dial set to off');
			if (transponderMode != 'NONE') {
				if (transponderMode === 'IDENT') {
					const IDENTModeButton = document.getElementById('button-ident') as HTMLInputElement;
					IDENTModeButton.classList.remove('active-button');
				} else if (transponderMode === 'VFR') {
					const VFRModeButton = document.getElementById('button-vfr') as HTMLInputElement;
					VFRModeButton.classList.remove('active-button');
				}
			}
			transponderMode = 'NONE';
			displayOn = false;
		}
		else {
			displayOn = true;
		}
		transponderDialMode = TransponderDialModes[newDialModeIndex];
	}
</script>

<div class="transponder-container-outer relative">
	<div class="mode-selecter absolute inset-y-0 left-0">
		<Dial
			Modes={TransponderDialModes}
			CurrentModeIndex={0}
			on:modeChange={onTransponderDialModeChange}
		/>
	</div>

	<div class="display-panel flex flex-col justify-center items-center">
		<TransponderDisplay {displayOn} mode={transponderDialMode} /> 
		<div class="display-buttons-container">
			<button class="button" id="button-ident" on:click={handleIDENTButtonClick}>IDENT</button>
			<button class="button" id="button-vfr" on:click={handleVFRButtonClick}>VFR</button>
			<button class="button" id="button-enter">ENT</button>
			<button class="button" id="button-back">BACK</button>
		</div>
	</div>

	<div class="frequency-selecter absolute inset-y-0 right-0">
		<!-- <Dial /> -->
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
