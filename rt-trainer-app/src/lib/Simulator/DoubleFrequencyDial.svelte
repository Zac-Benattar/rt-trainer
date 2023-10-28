<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	export let DialEnabled: boolean = false; // Dial not interactive if disabled
	let internalName = Math.random().toString(36).substring(7); // like a uuid, useful if more than one instance used
	let mounted: boolean = false;

	// Ensures that dial is mounted before modifying its properties
	$: if (mounted) {
		const frequencyDial = document.getElementById(
			'double-frequency-dial-outer-' + internalName
		) as HTMLDivElement;
		if (DialEnabled) {
			frequencyDial.classList.add('enabled');
		} else {
			frequencyDial.classList.remove('enabled');
		}
	}

	const dispatch = createEventDispatcher();

	const onDialOuterAntiClockwiseTurn = () => {
		dispatch('dialOuterAntiClockwiseTurn');
	};

	const onDialOuterClockwiseTurn = () => {
		dispatch('dialOuterClockwiseTurn');
	};

	const onDialInnerAntiClockwiseTurn = () => {
		dispatch('dialInnerAntiClockwiseTurn');
	};

	const onDialInnerClockwiseTurn = () => {
		dispatch('dialInnerClockwiseTurn');
	};

	onMount(() => {
		mounted = true;
	});
</script>

<div
	id={'dial-and-frequency-container-' + internalName}
	class="flex items-center justify-center"
	style="width: 200px; height: 200px; justify-content: center;"
>
	<div id={'dial-container-' + internalName} class="relative">
		<div
			id={'frequency-center-div-' + internalName}
			class="absolute"
			style="top: 50%; left: 50%; position: absolute; margin: auto;"
		/>
		<button id={'double-frequency-dial-outer-' + internalName} class="double-frequency-dial-outer flex">
			<div class="absolute" style="left: 8px; top: 30%; width: 12px; pointer-events: none;">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2.97 9.43"
					><g opacity="0.25"
						><path
							data-name="rad jog left out line"
							d="M1.65 8.25A11.22 11.22 0 011.48.17"
							fill="none"
							stroke="#fff"
							stroke-miterlimit="10"
						/><path data-name="rad jog left out arrow" fill="#fff" d="M2.97 6.45v2.98H0" /></g
					></svg
				>
			</div>
			<div class="absolute" style="right: 8px; top: 30%; width: 12px; pointer-events: none;">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2.97 9.43"
					><g opacity="0.25"
						><path
							data-name="rad jog right out arrow"
							d="M1.54.17a11.25 11.25 0 01-.17 8.09"
							fill="none"
							stroke="#fff"
							stroke-miterlimit="10"
						/><path data-name="rad jog right out line" fill="#fff" d="M2.97 9.43H0V6.45" /></g
					></svg
				>
			</div>
			<div
				id={'click-container-' + internalName}
				class="absolute flex flex-row"
				style="top: 0px; left: 0px; width: 100%; height: 100%;"
			>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="relative"
					style="width: 50%;"
					on:click={onDialOuterAntiClockwiseTurn}
				/>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div style="width: 50%;" on:click={onDialOuterClockwiseTurn} />
			</div>
			<button
				id={'double-frequency-dial-inner-' + internalName}
				class="double-frequency-dial-inner absolute flex"
			>
				<div class="absolute" style="left: 8px; top: 26%; width: 12px; pointer-events: none;">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2.7 5.92"
						><g opacity="0.25"
							><path
								data-name="rad jog left in line"
								d="M1.48 4.85a4.12 4.12 0 01-.81-2.46A4.06 4.06 0 011.26.26"
								fill="none"
								stroke="#fff"
								stroke-miterlimit="10"
							/><path data-name="rad jog left in arrow" fill="#fff" d="M2.7 3.23v2.69H0" /></g
						></svg
					>
				</div>
				<div class="absolute" style="right: 8px; top: 26%; width: 12px; pointer-events: none;">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2.7 5.92"
						><g opacity="0.25"
							><path
								data-name="rad jog right in line"
								d="M1.57.26a4.07 4.07 0 01.6 2.13 4.13 4.13 0 01-.82 2.46"
								fill="none"
								stroke="#fff"
								stroke-miterlimit="10"
							/><path data-name="rad jog right in line" fill="#fff" d="M2.7 5.92H0V3.23" /></g
						></svg
					>
				</div>
				<div
					class="absolute flex flex-row"
					style="top: 0px; left: 0px; width:100%; height:100%;"
				>
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="relative"
						style="width: 50%;"
						on:click={onDialInnerAntiClockwiseTurn}
						on:keypress={onDialInnerAntiClockwiseTurn}
					/>
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="relative"
						style="width: 50%;"
						on:click={onDialInnerClockwiseTurn}
						on:keypress={onDialInnerClockwiseTurn}
					/>
				</div></button
			>
		</button>
	</div>
</div>

<style lang="postcss">
	.double-frequency-dial-outer {
		width: 100px;
		height: 100px;
		border: 2px solid #fff;
		border-radius: 50%;
		transition: all 0.35s ease-in-out 0s;
		justify-content: center;
		display: flex;
	}

	.double-frequency-dial-inner {
		width: 50px;
		height: 50px;
		top: 25%;
		border: 2px solid #fff;
		border-radius: 50%;
		transition: all 0.35s ease-in-out 0s;
		justify-content: center;
		display: flex;
	}

	:global(.enabled) {
		box-shadow: rgb(255, 255, 255) 0px 0px 20px -5px;
	}
</style>
