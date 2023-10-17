<script lang="ts">
	import Dial from './Dial.svelte';
	type RadioMode = 'NONE' | 'COM' | 'NAV';
	var RadioDialModes : ArrayMaxLength7MinLength2 = ['OFF', 'SBY'];
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
		const COMModeButton = document.getElementById('radio-button-com') as HTMLInputElement;
		if (COMModeButton != null) {
			if (radioMode != 'COM') {
				if (radioMode === 'NAV') {
					const NAVModeButton = document.getElementById('radio-button-nav') as HTMLInputElement;
					NAVModeButton.classList.remove('active-button');
				}
				radioMode = 'COM';
				COMModeButton.classList.add('active-button');
			}
		}
	};

	const handleNAVButtonClick = () => {
		const NAVModeButton = document.getElementById('radio-button-nav') as HTMLInputElement;
		if (NAVModeButton != null) {
			if (radioMode != 'NAV') {
				if (radioMode === 'COM') {
					const COMModeButton = document.getElementById('radio-button-com') as HTMLInputElement;
					COMModeButton.classList.remove('active-button');
				}
				radioMode = 'NAV';
				NAVModeButton.classList.add('active-button');
			}
		}
	};

	const handleRadioDialClick = () => {
		const RadioModeDial = document.getElementById('radio-mode-dial') as HTMLDivElement;
		if (RadioModeDial != null) {
			if (radioDialMode === 'OFF') {
				radioDialMode = 'SBY';
				RadioModeDial.style.transform = 'rotate(0deg)';
				RadioModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 20px -5px';
			} else {
				radioDialMode = 'OFF';
				RadioModeDial.style.transform = 'rotate(-150deg)';
				RadioModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 0px';
			}
		}
	};
</script>

<div class="radio-container-outer relative">
	<div class="mode-selecter absolute inset-y-0 left-0">
		<Dial Modes={RadioDialModes} CurrentModeIndex={0}/>
	</div>

	<div class="radio-display-panel relative">
		<div class="segmentdisplay radio-display-screen absolute inset-x-0 top-0" />
		<div class="radio-display-buttons-container absolute flex flex-row inset-x-0 bottom-0">
			<button class="radio-button" id="radio-button-com" on:click={handleCOMButtonClick}>COM</button
			>
			<button class="radio-button" id="radio-button-swap">⇆</button>
			<button class="radio-button" id="radio-button-nav" on:click={handleNAVButtonClick}>NAV</button
			>
		</div>
	</div>

	<div class="radio-frequency-selecter absolute inset-y-0 right-0">
		<div class="radio-frequency-dial">
			<div class="radio-frequency-dial-left-outer">
				<div class="radio-frequency-dial-left-inner" />
			</div>
			<div class="radio-frequency-dial-right-outer">
				<div class="radio-frequency-dial-right-inner" />
			</div>
		</div>
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

	.radio-modes-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: center;
	}

	.radio-display-panel {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: center;
		width: 600px;
		height: 240px;
	}

	.radio-display-buttons-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		object-position: center bottom;
	}

	.radio-frequency-selecter {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: right;
		width: 200px;
		height: 240px;
	}

	.radio-button {
		width: 50px;
	}

	/* Global flag required otherwise .active-button is unused at page load 
    and hence removed by the compiler */
	:global(.active-button) {
		background-color: #afa548;
		color: black;
	}
</style>
