<script lang="ts">
	// Used to limit number of modes so that the dial doesn't get too crowded
	type ArrayMaxLength7MinLength2 = readonly [
		string,
		string,
		string?,
		string?,
		string?,
		string?,
		string?
	];
	export let Modes: ArrayMaxLength7MinLength2;
	export let CurrentMode: string;

	const handleDialClick = () => {
		const ModeDial = document.getElementById('mode-dial') as HTMLDivElement;
		if (ModeDial != null) {
			/* If there are only two modes no need to check the side of dial to 
            / determine rotation direction */
			if (Modes.length == 2) {
				if (CurrentMode == Modes[0]) {
					CurrentMode = Modes[1];
					ModeDial.style.transform = 'rotate(0deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 20px -5px';
				} else {
					CurrentMode = Modes[0];
					ModeDial.style.transform = 'rotate(-150deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 0px';
				}
			} else {

			}
		}
	};

	const handleModeClick = (mode: string) => {
		const ModeLabel = document.getElementById('mode-' + mode) as HTMLDivElement;
		const ModeDial = document.getElementById('mode-dial') as HTMLDivElement;
		if (ModeLabel != null && ModeDial != null) {
			/* If there are only two modes no need to check the side of dial to 
            / determine rotation direction */
			if (Modes.length == 2) {
				if (CurrentMode == Modes[0]) {
					CurrentMode = Modes[1];
					ModeDial.style.transform = 'rotate(0deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 20px -5px';
				} else {
					CurrentMode = Modes[0];
					ModeDial.style.transform = 'rotate(-150deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 0px';
				}
			}
            else {
                const ModeIndex = Modes.indexOf(mode);
                if (ModeIndex == 0) {
                    ModeDial.style.transform = 'rotate(0deg)';
                    ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 0px';
                }
                else {
                    ModeDial.style.transform = 'rotate(' + (ModeIndex * 30) + 'deg)';
                    ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 20px -5px';
                }

            }
		}
	};

	function addModeLabel(label: string, index: number = 0) {
		var ContainingDiv = document.getElementById('mode-selecter-container') as HTMLDivElement;
		if (ContainingDiv != null) {
			var ModeDiv = document.createElement('div');
			var topMultiplier = Math.round(4 / Modes.length);
			var leftMultiplier = Math.round(3 / Modes.length);
			ModeDiv.setAttribute(
				'class',
				'dial-label relative top-' + index * topMultiplier + ' left-' + index * leftMultiplier
			);
			ModeDiv.setAttribute('id', 'mode-' + label);
			ModeDiv.setAttribute('onclick', 'handleModeClick(' + label + ')');
			ModeDiv.textContent = label;
			ContainingDiv.appendChild(ModeDiv);
		}
	}

	function addModes() {
		for (let i = 0; i < Modes.length; i++) {
			// Probably not a good fix but can't see how it will break until it does...
			if (Modes[i] != null) {
				addModeLabel(Modes[i] as string, i);
			}
		}
	}
</script>

<div class="mode-selecter-container relative">
	<div class="position-relative">
		<div
			id="mode-dial"
			class="mode-dial flex"
			on:click={handleDialClick}
			on:keydown={handleDialClick}
			aria-label="Mode Dial"
			tabindex="0"
			role="button"
			style="transform: rotate(-150deg);"
		>
			<div class="mode-dial-line center" />
		</div>
	</div>
</div>

<style lang="postcss">
	.mode-dial {
		width: 80px;
		height: 80px;
		border: 2px solid #fff;
		border-radius: 50%;
		transition: all 0.35s ease-in-out 0s;
		justify-content: center;
		display: flex;
	}

	.mode-dial-line {
		width: 2px;
		height: 40px;
		background: #fff;
	}
</style>
