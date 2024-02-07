<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let DialEnabled: boolean = false;
	let internalName = Math.random().toString(36).substring(7);
	var intervalId: any;
	let intervalDuration: number = 250;

	$: enabledClass = DialEnabled ? 'enabled' : 'disabled';

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

	function onAntiClockwiseTick() {
		onDialAntiClockwiseTurn();
		clearInterval(intervalId);
		intervalDuration = intervalDuration * 0.9 + 5;
		intervalId = setInterval(onAntiClockwiseTick, intervalDuration);
	}

	function startIncrementingAntiClockwiseHold() {
		intervalDuration = 250;
		onDialAntiClockwiseTurn();
		intervalId = setInterval(onAntiClockwiseTick, intervalDuration);
	}

	function stopIncrementingAntiClockwiseHold() {
		clearInterval(intervalId);
	}

	function onClockwiseTick() {
		onDialClockwiseTurn();
		clearInterval(intervalId);
		intervalDuration = intervalDuration * 0.9 + 5;
		intervalId = setInterval(onClockwiseTick, intervalDuration);
	}

	function startIncrementingClockwiseHold() {
		intervalDuration = 250;
		onDialClockwiseTurn();
		intervalId = setInterval(onClockwiseTick, intervalDuration);
	}

	function stopIncrementingClockwiseHold() {
		clearInterval(intervalId);
	}
</script>

<div class="flex flex-row {$$props.class}">
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
				class="frequency-dial flex w-20 h-20 flex border-2 rounded-full {enabledClass}"
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
						class="w-100 h-100 z-[3]"
						style="width: 50%; height: 100%;"
						on:mousedown={startIncrementingAntiClockwiseHold}
						on:mouseup={stopIncrementingAntiClockwiseHold}
						on:mouseleave={stopIncrementingAntiClockwiseHold}
					/>
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="w-100 h-100 z-[3]"
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
