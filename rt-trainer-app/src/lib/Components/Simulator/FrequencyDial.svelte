<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	export let DialEnabled: boolean = false;
	let internalName = Math.random().toString(36).substring(7);
	let mounted: boolean = false;
	var intervalId: any;

	$: if (mounted) {
		const frequencyDial = document.getElementById(
			'frequency-dial-' + internalName
		) as HTMLDivElement;
		if (DialEnabled) {
			frequencyDial.classList.add('enabled');
		} else {
			frequencyDial.classList.remove('enabled');
		}
	}

	$: if (!DialEnabled) {
		clearInterval(intervalId);
	}

	const dispatch = createEventDispatcher();

	const onDialAntiClockwiseTurn = () => {
		dispatch('dialAntiClockwiseTurn');
	};

	const onDialClockwiseTurn = () => {
		dispatch('dialClockwiseTurn');
	};

	function startIncrementingAntiClockwiseHold() {
		onDialAntiClockwiseTurn();
		intervalId = setInterval(onDialAntiClockwiseTurn, 100);
	}

	function stopIncrementingAntiClockwiseHold() {
		clearInterval(intervalId);
	}

	function startIncrementingClockwiseHold() {
		onDialClockwiseTurn();
		intervalId = setInterval(onDialClockwiseTurn, 100);
	}

	function stopIncrementingClockwiseHold() {
		clearInterval(intervalId);
	}

	onMount(() => {
		mounted = true;
	});
</script>

<div class="flex flex-row order-3">
	<div
		id={'dial-and-frequency-container-' + internalName}
		class="flex flex-col place-content-center"
	>
		<div id={'dial-container-' + internalName} class="relative">
			<div
				id={'frequency-center-div-' + internalName}
				class="w-0 h-0 absolute"
				style="top: 50%; left: 50%; transform: rotate(0deg); position: absolute; margin: auto;"
			/>
			<button
				id={'frequency-dial-' + internalName}
				class="frequency-dial flex w-20 h-20 flex border-2 rounded-full"
			>
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
				<div
					class="absolute flex flex-row w-100 h-100"
					style="top: 0px; left: 0px; width: 100%; height: 100%;"
				>
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="w-100 h-100"
						style="width: 50%; height: 100%;"
						on:mousedown={startIncrementingAntiClockwiseHold}
						on:mouseup={stopIncrementingAntiClockwiseHold}
						on:mouseleave={stopIncrementingAntiClockwiseHold}
					/>
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="w-100 h-100"
						style="width: 50%; height: 100%;"
						on:mousedown={startIncrementingClockwiseHold}
						on:mouseup={stopIncrementingClockwiseHold}
						on:mouseleave={stopIncrementingClockwiseHold}
					/>
				</div>

				<div class="absolute w-0.5 h-10 bg-white center" />
			</button>
		</div>
	</div>
</div>

<style lang="postcss">
	.frequency-dial {
		transition: all 0.35s ease-in-out 0s;
		justify-content: center;
		boxshadow: rgb(255, 255, 255) 0px 0px 20px -5px;
	}

	:global(.enabled) {
		box-shadow: rgb(255, 255, 255) 0px 0px 20px -5px;
	}
</style>
