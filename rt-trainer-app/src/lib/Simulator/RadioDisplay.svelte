<script lang="ts">
	import { onMount } from 'svelte';

	export let DisplayOn: boolean = false;
	export let mode: string = 'OFF';
	export let RadioFrequency: number = 2000;
	export let DigitSelected: number = 0;

	let mounted: boolean = false;
	let digitArr = [0, 0, 0, 0];

	$: showDisplayText = DisplayOn ? '' : 'displayoff';
	$: {
		if (!DisplayOn) {
			DigitSelected = 0;
		}
	}
	$: {
		let newDigitArr = `${RadioFrequency}`.split('').map(Number);
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
			let oldSelectedDigit = document.querySelector('.rselected');
			if (oldSelectedDigit != null) {
				oldSelectedDigit.classList.remove('rselected');
			}
			let NewSelectedDigit = document.getElementById('rdigit-' + DigitSelected) as HTMLDivElement;
			if (NewSelectedDigit != null) {
				NewSelectedDigit.classList.add('rselected');
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
	class="radio-segdisplay {showDisplayText} card flex flex-row nowrap items-center place-content-between"
>
	<div>
		<div class="mode-icon">{mode}</div>
	</div>
	<div class="sevenSEG flex flex-row">
		<div id="rdigit-0" class="rdigit rselected">{digitArr[0]}</div>
		<div id="rdigit-1" class="rdigit">{digitArr[1]}</div>
		<div id="rdigit-2" class="rdigit">{digitArr[2]}</div>
		<div id="rdigit-3" class="rdigit">{digitArr[3]}</div>
	</div>
</div>

<style lang="postcss">
	.radio-segdisplay {
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

	.radio-segdisplay .mode-icon {
		font-family: Segment7Standard;
		font-size: 20px;
		text-algin: left;
		padding: 2px;
		margin-left: 16px;
	}

	.radio-segdisplay .sevenSEG {
		font-size: 50px;
		opacity: 1;
		margin-right: 40px;
	}

	.radio-segdisplay .rdigit {
		font-family: Segment7Standard;
		text-algin: right;
		padding: 8px 0px;
	}

	.radio-segdisplay .rdigit.rselected {
		text-decoration-line: underline;
	}
</style>
