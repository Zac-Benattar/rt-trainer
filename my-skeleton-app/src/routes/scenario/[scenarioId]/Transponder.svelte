<script lang="ts">
	import Dial from './Dial.svelte';
	type TransponderMode = 'NONE' | 'IDENT' | 'VFR';
	var TransponderDialModes : ArrayMaxLength7MinLength2 = ['OFF', 'SBY', 'GND', 'STBY', 'ON', 'ALT', 'TEST'];
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

	// Click handlers
	const handleIDENTButtonClick = () => {
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
	};

	const handleVFRButtonClick = () => {
		const VFRModeButton = document.getElementById('button-vfr') as HTMLInputElement;
		if (VFRModeButton != null) {
			if (transponderMode != 'VFR') {
				if (transponderMode === 'IDENT') {
					const IDENTModeButton = document.getElementById('radio-button-ident') as HTMLInputElement;
					IDENTModeButton.classList.remove('active-button');
				}
				transponderMode = 'VFR';
				VFRModeButton.classList.add('active-button');
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

</script>

<div class="container-outer">
	<div>
		<div class="controls-container">
			<div class="mode-selecter absolute inset-y-0 left-0">
				<Dial Modes={TransponderDialModes} CurrentModeIndex={0}/>
			</div>

			<div class="display-panel">
				<div class="segmentdisplay display-screen" />
				<div class="display-buttons-container">
					<div class="display-button-container">
						<button class="button" id="button-ident">IDENT</button>
					</div>
					<div class="display-button-container">
						<button class="button" id="button-vfr">VFR</button>
					</div>
					<div class="display-button-container">
						<button class="button" id="button-enter">ENT</button>
					</div>
					<div class="display-button-container">
						<button class="button" id="button-back">BACK</button>
					</div>
				</div>
			</div>

			<div class="frequency-selecter position-relative">
				<div class="frequency-dial">
					<div class="frequency-dial-left-outer">
						<div class="frequency-dial-left-inner" />
					</div>
					<div class="frequency-dial-right-outer">
						<div class="frequency-dial-right-inner" />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
```

<style lang="postcss">
	.container-outer {
		display: flex;
		flex-direction: row;
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

	.container-outer {
		background-color: rgb(65, 65, 65);
		width: 1000px;
		height: 240px;
	}
</style>
