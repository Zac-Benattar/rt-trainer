<script lang="ts">
	import { onMount } from 'svelte';

	export let DisplayOn: boolean = false;
	export let mode: string = 'COM';
	export let DigitSelected: number = 0;
	export let radioSelectedFrequency: number = 126.410;
	export let radioAlternateFrequency: number = 123.170;
	export let radioTertiaryFrequency: number = 179.200;

	let mounted: boolean = false;
	let digitArr = [1, 0, 0, 0];

	$: showDisplayText = DisplayOn ? '' : 'displayoff';
	$: {
		if (!DisplayOn) {
			mode = 'COM';
		}
	}
	$: {
		let newDigitArr = `${radioSelectedFrequency}`.split('').map(Number);
		for (let i = 0; i < 4; i++) {
			if (newDigitArr[i] != null) {
				digitArr[i] = newDigitArr[i];
			} else {
				digitArr[i] = 0;
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
	<div class="sevenSEG flex flex-row flex-wrap">
		<div class="secondary-frequency flex flex-row">
			<div id="secondary-rdigit-0" class="rdigit">{digitArr[0]}</div>
			<div id="secondary-rdigit-1" class="rdigit">{digitArr[1]}</div>
			<div id="secondary-rdigit-2" class="rdigit">{digitArr[2]}</div>
			<div class="rdecimal-point">.</div>
			<div id="secondary-rdigit-dp-0" class="rdigit">{digitArr[0]}</div>
			<div id="secondary-rdigit-dp-1" class="rdigit">{digitArr[1]}</div>
			<div id="secondary-rdigit-dp-2" class="rdigit">{digitArr[2]}</div>
		</div>
		<div>
			<div class="divider-pipe">|</div>
		</div>
		<div class="primary-frequency flex flex-row">
			<div id="primary-rdigit-0" class="rdigit">{digitArr[0]}</div>
			<div id="primary-rdigit-1" class="rdigit">{digitArr[1]}</div>
			<div id="primary-rdigit-2" class="rdigit">{digitArr[2]}</div>
			<div class="rdecimal-point">.</div>
			<div id="primary-rdigit-dp-0" class="rdigit">{digitArr[0]}</div>
			<div id="primary-rdigit-dp-1" class="rdigit">{digitArr[1]}</div>
			<div id="primary-rdigit-dp-2" class="rdigit">{digitArr[2]}</div>
		</div>
		<div class="terniary-frequency flex flex-row">
			<div id="terniary-rdigit-0" class="rdigit">{digitArr[0]}</div>
			<div id="terniary-rdigit-1" class="rdigit">{digitArr[1]}</div>
			<div id="terniary-rdigit-2" class="rdigit">{digitArr[2]}</div>
			<div class="rdecimal-point">.</div>
			<div id="terniary-rdigit-dp-0" class="rdigit">{digitArr[0]}</div>
			<div id="terniary-rdigit-dp-1" class="rdigit">{digitArr[1]}</div>
			<div id="terniary-rdigit-dp-2" class="rdigit">{digitArr[2]}</div>
		</div>
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
		font-size: 35px;
		opacity: 1;
		margin-right: 40px;
		width:70%
	}

	.radio-segdisplay .rdigit {
		font-family: Segment7Standard;
		text-algin: right;
		padding: 8px 0px;
	}

	.radio-segdisplay .rdecimal-point {
		font-family: Segment7Standard;
		text-algin: right;
		padding: 8px 0px;
	}

	.radio-segdisplay .divider-pipe {
		margin-left: 30px;
		margin-right: 30px;
		text-algin: right;
		padding: 8px 0px;
	}
</style>
