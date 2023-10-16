<script lang="ts">
</script>

<div class="transponder-container-outer">
	<div>
		<div class="controls-container">
			<div class="transponder-mode-selecter">
				<div class="position-relative">
					<div class="transponder-mode-dial">
						<div class="transponder-mode-dial-line" />
					</div>
				</div>
				<div class="transponder-modes-container">
					<div class="transponder-mode-off">OFF</div>
					<div class="transponder-mode-standby">SBY</div>
					<div class="transponder-mode-ground">GND</div>
					<div class="transponder-mode-on">ON</div>
					<div class="transponder-mode-altitude">ALT</div>
				</div>
			</div>

			<div class="transponder-display-panel">
				<div class="segmentdisplay transponder-display-screen" />
				<div class="transponder-display-buttons-container">
					<div class="transponder-display-button-container">
						<button class="transponder-button" id="transponder-button-com">IDENT</button>
					</div>
					<div class="transponder-display-button-container">
						<button class="transponder-button" id="transponder-button-swap">VFR</button>
					</div>
					<div class="transponder-display-button-container">
						<button class="transponder-button" id="transponder-button-nav">ENT</button>
					</div>
					<div class="transponder-display-button-container">
						<button class="transponder-button" id="transponder-button-nav">BACK</button>
					</div>
				</div>
			</div>

			<div class="transponder-frequency-selecter position-relative">
				<div class="transponder-frequency-dial">
					<div class="transponder-frequency-dial-left-outer">
						<div class="transponder-frequency-dial-left-inner" />
					</div>
					<div class="transponder-frequency-dial-right-outer">
						<div class="transponder-frequency-dial-right-inner" />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
```

<style lang="postcss">
	.transponder-container-outer {
		display: flex;
		flex-direction: row;
	}

	.transponder-button {
		width: 50px;
	}

	/* Global flag required otherwise .active-button is unused at page load 
    and hence removed by the compiler */
	:global(.active-button) {
		background-color: #afa548;
		color: black;
	}

	.transponder-container-outer {
		background-color: rgb(65, 65, 65);
		width: 1000px;
		height: 240px;
	}

	.transponder-mode-dial {
		width: 80px;
		height: 80px;
		border: 2px solid #fff;
		border-radius: 50%;
		transform: rotate(0deg);
		transition: all 0.35s ease-in-out 0s;
	}

	.transponder-mode-dial-line {
		width: 2px;
		height: 40px;
		background: #fff;
	}
</style>
