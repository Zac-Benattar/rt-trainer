<script lang="ts">
    import { onMount } from 'svelte';

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
	export let CurrentModeIndex: number = 0;

	const handleDialClick = () => {
		const ModeDial = document.getElementById('mode-dial') as HTMLDivElement;
		if (ModeDial != null) {
			/* If there are only two modes no need to check the side of dial to 
            / determine rotation direction */
			if (Modes.length == 2) {
				if (CurrentModeIndex == 0) {
					CurrentModeIndex = 1;
					ModeDial.style.transform = 'rotate(0deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 20px -5px';
				} else {
					CurrentModeIndex = 0;
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
				if (CurrentModeIndex == 0) {
					CurrentModeIndex = 1;
					ModeDial.style.transform = 'rotate(0deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 20px -5px';
				} else {
					CurrentModeIndex = 0;
					ModeDial.style.transform = 'rotate(-150deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 0px';
				}
			} else {
				const ModeIndex = Modes.indexOf(mode);
				if (ModeIndex == 0) {
					ModeDial.style.transform = 'rotate(0deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 0px';
				} else {
					ModeDial.style.transform = 'rotate(' + ModeIndex * 30 + 'deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 20px -5px';
				}
			}
		}
	};

	const handleDialArrowClick = (side: string) => {
		const ModeDial = document.getElementById('mode-dial') as HTMLDivElement;
		if (ModeDial != null) {
			if (side == 'left') {
				if (CurrentModeIndex != 0) {
					ModeDial.style.transform = 'rotate(' + (CurrentModeIndex - 1) * 30 + 'deg)';
					if (CurrentModeIndex == 1)
						ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 0px';
					else ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 0px';
				}
			} else {
				if (CurrentModeIndex != 0) {
					ModeDial.style.transform = 'rotate(' + (CurrentModeIndex + 1) * 30 + 'deg)';
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
		// Add side based arrows if there are more than two modes
		if (Modes.length > 2) {
			var ModeDial = document.getElementById('mode-dial') as HTMLDivElement;

			// Add direction arrows
			var LeftArrow = document.createElement('div');
			var RightArrow = document.createElement('div');
			var LeftArrowImg = document.createElement('svg');
			var RightArrowImg = document.createElement('svg');
			LeftArrow.setAttribute(
				'style',
				'position: absolute; left: 8px; top: 30%; width: 30%; pointer-events: none;'
			);
			RightArrow.setAttribute(
				'style',
				'position: absolute; right: 8px; top: 30%; width: 30%; pointer-events: none;'
			);
			LeftArrowImg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			LeftArrowImg.setAttribute('viewBox', '0 0 2.7 6.25');
			RightArrowImg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			RightArrowImg.setAttribute('viewBox', '0 0 2.7 6.24');
			ModeDial.appendChild(LeftArrow);
			ModeDial.appendChild(RightArrow);
			LeftArrow.appendChild(LeftArrowImg);
			RightArrow.appendChild(RightArrowImg);

			// Add direction divs
			var LeftDiv = document.createElement('div');
			var RightDiv = document.createElement('div');
			LeftDiv.setAttribute('class', 'w-100 h-100');
			RightDiv.setAttribute('class', 'w-100 h-100');
			LeftDiv.setAttribute('style', 'width: 50%;');
			RightDiv.setAttribute('style', 'width: 50%;');
			LeftDiv.setAttribute('onclick', 'handleDialArrowClick(left)');
			RightDiv.setAttribute('onclick', 'handleDialArrowClick(right)');
			ModeDial.appendChild(LeftDiv);
			ModeDial.appendChild(RightDiv);
		}

		// Add mode labels around dial
		for (let i = 0; i < Modes.length; i++) {
			// Probably not a good fix but can't see how it will break until it does...
			if (Modes[i] != null) {
				addModeLabel(Modes[i] as string, i);
			}
		}
	}

	onMount(() => {
        addModes();
    });
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
