<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

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
	let internalName = Math.random().toString(36).substring(7);

	const dispatch = createEventDispatcher();

	$: dispatch('modeChange', CurrentModeIndex);

	const handleDialClick = () => {
		console.log('Dial clicked');
		const ModeDial = document.getElementById('mode-dial-' + internalName) as HTMLDivElement;
		if (ModeDial != null) {
			/* If there are only two modes no need to check the side of dial to 
            / determine rotation direction */
			if (Modes.length == 2) {
				setMode(CurrentModeIndex == 0 ? 1 : 0);
			} else {
				// Implement this!
				console.log('Feature not implemented');
			}
		}
	};

	function handleModeClick(event: Event) {
		var tgt = event.target as HTMLDivElement;
		var mode = tgt.id.split('-')[1];
		const ModeLabel = document.getElementById('mode-' + mode) as HTMLDivElement;
		const ModeDial = document.getElementById('mode-dial') as HTMLDivElement;
		if (ModeLabel != null && ModeDial != null) {
			/* If there are only two modes no need to check the side of dial to 
            / determine rotation direction */
			if (Modes.length == 2) {
				setMode(CurrentModeIndex == 0 ? 1 : 0);
			} else {
				const ModeIndex = Modes.indexOf(mode);
				if (ModeIndex != -1) {
					setMode(ModeIndex);
				}
			}
		}
	}

	function handleDialArrowClick(event: Event) {
		var tgt = event.target as HTMLDivElement;
		if (tgt.id == 'left-arrow-div-' + internalName) {
			console.log('Left arrow clicked');
			if (CurrentModeIndex != 0) {
				setMode(CurrentModeIndex - 1);
			}
		} else {
			console.log('Right arrow clicked');
			if (CurrentModeIndex != Modes.length - 1) {
				setMode(CurrentModeIndex + 1);
			}
		}
	}

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
			ModeDiv.addEventListener('click', handleModeClick);
			ModeDiv.textContent = label;
			ContainingDiv.appendChild(ModeDiv);
		}
	}

	function addModes() {
		console.log('Adding modes');
		// Add side based arrows if there are more than two modes
		if (Modes.length > 2) {
			console.log('Adding arrows');
			var DialAndModesContainer = document.getElementById(
				'dial-and-modes-container-' + internalName
			) as HTMLDivElement;
			var ArrowContainer = document.getElementById(
				'arrow-container-' + internalName
			) as HTMLDivElement;

			// Add direction arrows
			var LeftArrow = document.createElement('div');
			var RightArrow = document.createElement('div');
			var LeftArrowImg = document.createElement('svg');
			var RightArrowImg = document.createElement('svg');
			var LeftArrowg = document.createElement('g');
			var RightArrowg = document.createElement('g');
			var LeftArrowLinePath = document.createElement('path');
			var RightArrowLinePath = document.createElement('path');
			var LeftArrowHeadPath = document.createElement('path');
			var RightArrowHeadPath = document.createElement('path');

			LeftArrow.setAttribute(
				'style',
				'position: absolute; left: 8px; top: 30%; width: 14px; pointer-events: none;'
			);
			RightArrow.setAttribute(
				'style',
				'position: absolute; right: 8px; top: 30%; width: 14px; pointer-events: none;'
			);

			LeftArrowg.setAttribute('opacity', '0.25');
			RightArrowg.setAttribute('opacity', '0.25');

			LeftArrowHeadPath.setAttribute('data-name', 'X jog left arrow');
			LeftArrowHeadPath.setAttribute('d', 'M2.7 3.55v2.7H0');
			LeftArrowHeadPath.setAttribute('fill', '#fff');

			RightArrowHeadPath.setAttribute('data-name', 'X jog right arrow');
			RightArrowHeadPath.setAttribute('d', 'M1.82.15a6.62 6.62 0 01-.47 5.12');
			RightArrowHeadPath.setAttribute('fill', 'none');
			RightArrowHeadPath.setAttribute('stroke', '#fff');
			RightArrowHeadPath.setAttribute('stroke-miterlimit', '10');

			LeftArrowLinePath.setAttribute('data-name', 'X jog left line');
			LeftArrowLinePath.setAttribute('d', 'M1.52 5.29A6.67 6.67 0 011.05.15');
			LeftArrowLinePath.setAttribute('fill', 'none');
			LeftArrowLinePath.setAttribute('stroke', '#fff');
			LeftArrowLinePath.setAttribute('stroke-miterlimit', '10');

			RightArrowLinePath.setAttribute('data-name', 'X jog right line');
			RightArrowLinePath.setAttribute('d', 'M2.7 6.24H0v-2.7');
			RightArrowLinePath.setAttribute('fill', '#fff');

			LeftArrowImg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			LeftArrowImg.setAttribute('viewBox', '0 0 2.7 6.25');

			RightArrowImg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			RightArrowImg.setAttribute('viewBox', '0 0 2.7 6.24');

			DialAndModesContainer.appendChild(LeftArrow);
			DialAndModesContainer.appendChild(RightArrow);
			LeftArrow.appendChild(LeftArrowImg);
			RightArrow.appendChild(RightArrowImg);
			LeftArrowImg.appendChild(LeftArrowg);
			RightArrowImg.appendChild(RightArrowg);
			LeftArrowg.appendChild(LeftArrowLinePath);
			LeftArrowg.appendChild(LeftArrowHeadPath);
			RightArrowg.appendChild(RightArrowLinePath);
			RightArrowg.appendChild(RightArrowHeadPath);

			// Add direction divs
			var LeftDiv = document.createElement('div');
			var RightDiv = document.createElement('div');

			LeftDiv.setAttribute('class', 'w-100 h-100');
			RightDiv.setAttribute('class', 'w-100 h-100');
			LeftDiv.setAttribute('style', 'width: 50%; height: 100%');
			RightDiv.setAttribute('style', 'width: 50%; height: 100%');
			LeftDiv.setAttribute('id', 'left-arrow-div-' + internalName);
			RightDiv.setAttribute('id', 'right-arrow-div-' + internalName);

			ArrowContainer.appendChild(LeftDiv);
			ArrowContainer.appendChild(RightDiv);

			LeftDiv.addEventListener('click', handleDialArrowClick);
			RightDiv.addEventListener('click', handleDialArrowClick);
		}

		// Add mode labels around dial
		for (let i = 0; i < Modes.length; i++) {
			// Probably not a good fix but can't see how it will break until it does...
			if (Modes[i] != null) {
				addModeLabel(Modes[i] as string, i);
			}
		}
	}

	function setMode(modeIndex: number) {
		// goes from -150 to 150
		const modesMultiplier = Math.round(300 / Modes.length);
		const ModeDial = document.getElementById('mode-dial-' + internalName) as HTMLDivElement;
		if (ModeDial != null) {
			if (Modes.length == 2) {
				if (modeIndex == 0) {
					ModeDial.style.transform = 'rotate(-150deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 0px';
				} else {
					ModeDial.style.transform = 'rotate(0deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 20px -5px';
				}
			} else {
				if (modeIndex == 0) {
					ModeDial.style.transform = 'rotate(-150deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 0px';
				} else {
					var newRotation = modeIndex * modesMultiplier - 150;
					ModeDial.style.transform = 'rotate(' + newRotation + 'deg)';
					ModeDial.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 20px -5px';
				}
			}
		}

		CurrentModeIndex = modeIndex;
	}

	onMount(() => {
		addModes();
	});
</script>

<div id={'dial-and-modes-container-' + internalName} class="relative">
	<div id={'dial-container-' + internalName} class="relative">
		<div
			id={'mode-dial-' + internalName}
			class="mode-dial flex"
			on:click={handleDialClick}
			on:keydown={handleDialClick}
			aria-label="Mode Dial"
			tabindex="0"
			role="button"
			style="transform: rotate(-150deg);"
		>
			<div
				id={'arrow-container-' + internalName}
				class="absolute flex flex-row w-100 h-100"
				style="top: 0px; left: 0px; width: 100%; height: 100%; transform: rotate(0deg);"
			/>
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
