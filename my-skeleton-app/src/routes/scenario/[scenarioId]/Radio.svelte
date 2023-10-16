<script lang="ts">
	let COMMode: boolean = false;
	let NAVMode: boolean = false;
	const handleCOMButtonClick = () => {
		const COMModeButton = document.getElementById('radio-button-com') as HTMLInputElement;
		if (COMModeButton != null) {
			if (!COMMode) {
				COMMode = true;
				COMModeButton.classList.add('active-button');
				if (NAVMode) {
					NAVMode = false;
					const NAVModeButton = document.getElementById('radio-button-nav') as HTMLInputElement;
					NAVModeButton.classList.remove('active-button');
				}
			}
		}
	};

	const handleNAVButtonClick = () => {
		const NAVModeButton = document.getElementById('radio-button-nav') as HTMLInputElement;
		if (NAVModeButton != null) {
			if (!NAVMode) {
				NAVMode = true;
				NAVModeButton.classList.add('active-button');
				if (COMMode) {
					COMMode = false;
					const COMModeButton = document.getElementById('radio-button-com') as HTMLInputElement;
					COMModeButton.classList.remove('active-button');
				}
			}
		}
	};
</script>

<div class="radio-container-outer">
	<div class="mode-selecter">
		<div class="radio-modes-container">
			<div class="dial-label relative top-0">SBY</div>
			<div class="position-relative">
				<div class="mode-dial">
					<div class="mode-dial-line" />
				</div>
			</div>
			<div class="dial-label relative left-0 bottom-0">OFF</div>
		</div>
	</div>

	<div class="radio-display-panel">
		<div class="segmentdisplay radio-display-screen" />
		<div class="radio-display-buttons-container">
			<div class="radio-display-button-container">
				<button class="radio-button" id="radio-button-com" on:click={handleCOMButtonClick}
					>COM</button
				>
			</div>
			<div class="radio-display-button-container">
				<button class="radio-button" id="radio-button-swap">⇆</button>
			</div>
			<div class="radio-display-button-container">
				<button class="radio-button" id="radio-button-nav" on:click={handleNAVButtonClick}
					>NAV</button
				>
			</div>
		</div>
	</div>

	<div class="radio-frequency-selecter position-relative">
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
	}

	.mode-selecter {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: left;
	}

	.radio-display-panel {
		display: flex;
		flex-direction: column;
		justify-content: center;
		object-position: center;
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

	.radio-container-outer {
		background-color: rgb(65, 65, 65);
		width: 800px;
		height: 240px;
	}

	.mode-dial {
		width: 80px;
		height: 80px;
		border: 2px solid #fff;
		border-radius: 50%;
		transform: rotate(0deg);
		transition: all 0.35s ease-in-out 0s;
	}

	.mode-dial-line {
		width: 2px;
		height: 40px;
		background: #fff;
	}
</style>