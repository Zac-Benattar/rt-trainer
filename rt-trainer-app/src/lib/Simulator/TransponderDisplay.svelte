<script lang="ts">
	import { onMount } from 'svelte';

	export let DisplayOn: boolean = false;
	export let mode: string = 'OFF';
	export let transponderFrequency: number = 2000;
	export let DigitSelected: number = 0;

	let mounted: boolean = false;
	let digitArr = [1, 0, 0, 0];

	$: showDisplayText = DisplayOn ? '' : 'displayoff';
	$: {
		let newDigitArr = `${transponderFrequency}`.split('').map(Number);
		for (let i = 0; i < 4; i++) {
			if (newDigitArr[i] != null) {
				digitArr[i] = newDigitArr[i];
			} else {
				digitArr[i] = 0;
			}
		}
	}
	$: {
		if (mounted) {
			let oldSelectedDigit = document.querySelector('.selected');
			if (oldSelectedDigit != null) {
				oldSelectedDigit.classList.remove('selected');
			}
			let NewSelectedDigit = document.getElementById('digit-' + DigitSelected) as HTMLDivElement;
			if (NewSelectedDigit != null) {
				NewSelectedDigit.classList.add('selected');
			}
		}
	}

	onMount(() => {
		mounted = true;
	});
</script>

<link
	rel="stylesheet"
	media="screen"
	href="https://fontlibrary.org//face/segment7"
	type="text/css"
/>

<div
	class="segdisplay {showDisplayText} card flex flex-row nowrap items-center place-content-between"
>
	<div>
		<div class="mode-icon">{mode}</div>
	</div>
	<div class="sevenSEG flex flex-row">
		<div id="digit-0" class="digit selected">{digitArr[0]}</div>
		<div id="digit-1" class="digit">{digitArr[1]}</div>
		<div id="digit-2" class="digit">{digitArr[2]}</div>
		<div id="digit-3" class="digit">{digitArr[3]}</div>
	</div>
</div>

<style lang="postcss">
	.segdisplay {
		border-style: solid;
		border-color: white;
		border-width: 1px;
		width: 100%;
		height: 90px;
		transition: all 0.4 ease-in-out 0s;
		background: rgba(var(--color-surface-900) / 1);
	}

	:global(.displayoff) {
		color: rgba(var(--color-surface-900) / 1);
	}

	.segdisplay .mode-icon {
		font-family: Segment7Standard;
		font-size: 20px;
		text-algin: left;
		padding: 2px;
		margin-left: 16px;
	}

	.segdisplay .sevenSEG {
		font-size: 50px;
		opacity: 1;
		margin-right: 40px;
	}

	.segdisplay .digit {
		font-family: Segment7Standard;
		text-algin: right;
		padding: 8px 0px;
	}

	.segdisplay .digit.selected {
		text-decoration-line: underline;
	}
</style>
