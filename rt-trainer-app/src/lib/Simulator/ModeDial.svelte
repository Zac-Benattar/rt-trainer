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
	export let DialEnabled: boolean = false;
	let internalName = Math.random().toString(36).substring(7);
	let mounted: boolean = false;

	const dispatch = createEventDispatcher();

	$: dispatch('modeChange', CurrentModeIndex);

	$: if (mounted) {
		const modeDial = document.getElementById('mode-dial-' + internalName) as HTMLDivElement;
		if (DialEnabled) {
			modeDial.classList.add('enabled');
		} else {
			modeDial.classList.remove('enabled');
		}
	}

	const handleDialClick = () => {
		const ModeDial = document.getElementById('mode-dial-' + internalName) as HTMLDivElement;
		if (ModeDial != null) {
			/* If there are only two modes no need to check the side of dial to 
            / determine rotation direction */
			if (Modes.length == 2) {
				setMode(CurrentModeIndex == 0 ? 1 : 0);
			}
			// Otherwise the clickable divs either side of the dial line will handle rotation
		}
	};

	function handleModeClick(event: Event) {
		var tgt = event.target as HTMLDivElement;
		var mode = tgt.id.split('-')[1];
		const ModeLabel = document.getElementById('mode-' + mode) as HTMLDivElement;
		const ModeDial = document.getElementById('mode-dial-' + internalName) as HTMLDivElement;
		if (ModeLabel != null && ModeDial != null) {
			const ModeIndex = Modes.indexOf(mode);
			if (ModeIndex > -1 && ModeIndex < Modes.length) {
				setMode(ModeIndex);
			}
		}
	}

	const incrementMode = () => {
		if (CurrentModeIndex != Modes.length - 1) {
			setMode(CurrentModeIndex + 1);
		}
	};

	const decrementMode = () => {
		if (CurrentModeIndex != 0) {
			setMode(CurrentModeIndex - 1);
		}
	};

	function addModes() {
		// Add mode clickable labels around dial from -150 to 150 degrees
		var centerDiv = document.getElementById('mode-center-div-' + internalName) as HTMLDivElement;
		var angle = 0.33 * Math.PI;
		var step = (0.83 * 2 * Math.PI) / Modes.length;
		var radius = 60;
		if (centerDiv != null) {
			for (let i = 0; i < Modes.length; i++) {
				if (Modes[i] != null) {
					addMode(
						Modes[i],
						radius * Math.sin(angle),
						(radius + Modes[i].length) * -Math.cos(angle),
						centerDiv
					);
					angle -= step;
				}
			}
		}
	}

	// Add mode label to dial at given x and y coordinates
	function addMode(mode: string, x: number, y: number, centerDiv: HTMLDivElement) {
		var ModeDiv = document.createElement('div');
		ModeDiv.setAttribute('style', 'top:' + x + 'px; left:' + y + 'px;');
		ModeDiv.setAttribute('class', 'dial-label absolute');
		ModeDiv.setAttribute('id', 'mode-' + mode);
		ModeDiv.addEventListener('click', handleModeClick);
		ModeDiv.textContent = mode;
		centerDiv.appendChild(ModeDiv);
	}

	function setMode(modeIndex: number) {
		// goes from -150 to 150
		const modesMultiplier = Math.round(300 / Modes.length);
		const ModeDial = document.getElementById('mode-dial-' + internalName) as HTMLDivElement;
		if (ModeDial != null) {
			if (Modes.length == 2) {
				console.log('Setting mode' + modeIndex);
				if (modeIndex == 0) {
					ModeDial.style.transform = 'rotate(-150deg)';
					DialEnabled = false;
				} else {
					ModeDial.style.transform = 'rotate(0deg)';
					DialEnabled = true;
				}
			} else {
				if (modeIndex == 0) {
					ModeDial.style.transform = 'rotate(-150deg)';
					DialEnabled = false;
				} else {
					var newRotation = modeIndex * modesMultiplier - 150;
					ModeDial.style.transform = 'rotate(' + newRotation + 'deg)';
					DialEnabled = true;
				}
			}
		}

		CurrentModeIndex = modeIndex;
	}

	onMount(() => {
		mounted = true;
		addModes();
	});
</script>

<div
	id={'dial-and-modes-container-' + internalName}
	class="flex items-center justify-center"
	style="height:180px; justify-content: center;"
>
	<div id={'dial-container-' + internalName} class="relative">
		<div
			id={'mode-center-div-' + internalName}
			class="w-0 h-0"
			style="top: 50%; left: 50%; transform: rotate(0deg); position: absolute; margin: auto;"
		/>
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
			{#if Modes.length > 2}
				<div style="position: absolute; left: 8px; top: 30%; width: 14px; pointer-events: none;">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2.7 6.25"
						><g opacity="0.25"
							><path
								data-name="X jog left line"
								d="M1.52 5.29A6.67 6.67 0 011.05.15"
								fill="none"
								stroke="#fff"
								stroke-miterlimit="10"
							/><path data-name="X jog left arrow" fill="#fff" d="M2.7 3.55v2.7H0" /></g
						></svg
					>
				</div>
				<div style="position: absolute; right: 8px; top: 30%; width: 14px; pointer-events: none;">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2.7 6.24"
						><g opacity="0.25"
							><path
								data-name="X jog right arrow"
								d="M1.82.15a6.62 6.62 0 01-.47 5.12"
								fill="none"
								stroke="#fff"
								stroke-miterlimit="10"
							/><path data-name="X jog right line" fill="#fff" d="M2.7 6.24H0v-2.7" /></g
						></svg
					>
				</div>

				<div class="flex w-100 h-100" style="top: 0px; left: 0px; width: 100%; height: 100%;">
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="w-100 h-100"
						style="width: 50%; height: 100%;"
						on:click={decrementMode}
						on:keypress={decrementMode}
					/>

					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="w-100 h-100"
						style="width: 50%; height: 100%"
						on:click={incrementMode}
						on:keypress={incrementMode}
					/>
				</div>
				<div class="Transponder__ModeLine-bmz734-5 fsAVmj" />
			{/if}
			<div class="absolute mode-dial-line center" />
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

	:global(.dial-label) {
		position: absolute;
		width: 40px;
		height: 30px;
		text-align: right;
		display: flex;
		-moz-box-pack: center;
		justify-content: center;
		-moz-box-align: center;
		align-items: center;
		transform: translateX(-50%) translateY(-50%);
		cursor: pointer;
	}

	:globa(.mode-dial .enabled) {
		box-shadow: rgb(255, 255, 255) 0px 0px 20px -5px;
	}
</style>
