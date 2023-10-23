<script lang="ts">
	import { onMount } from 'svelte';

	export let DisplayOn: boolean = false;
	export let mode: string = 'COM';
	export let transponderPrimaryFrequency: number = 126.41;
	export let transponderAlternateFrequency: number = 123.17;
	export let transponderTertiaryFrequency: number = 179.2;

	let mounted: boolean = false;
	let PFDigitArr = ['0', '0', '0', '0', '0', '0'];
	let AFDigitArr = ['0', '0', '0', '0', '0', '0'];
	let TFDigitArr = ['0', '0', '0', '0', '0', '0'];

	$: showDisplayText = DisplayOn ? '' : 'displayoff';
	$: {
		if (!DisplayOn) {
			mode = 'COM';
		}
	}
	$: {
		let split = transponderPrimaryFrequency.toString().split('.');
		let newDigitArrLeft = split[0].split('');
		let newDigitArrRight = split[1].split('');
		for (let i = 0; i < 4; i++) {
			if (newDigitArrLeft[i] == null) {
				newDigitArrLeft[i] = '0';
			}
			if (newDigitArrRight[i] == null) {
				newDigitArrRight[i] = '0';
			}
		}
		PFDigitArr[0] = newDigitArrLeft[0];
		PFDigitArr[1] = newDigitArrLeft[1];
		PFDigitArr[2] = newDigitArrLeft[2];
		PFDigitArr[3] = newDigitArrRight[0];
		PFDigitArr[4] = newDigitArrRight[1];
		PFDigitArr[5] = newDigitArrRight[2];
	}
	$: {
		let split = transponderAlternateFrequency.toString().split('.');
		let newDigitArrLeft = split[0].split('');
		let newDigitArrRight = split[1].split('');
		for (let i = 0; i < 4; i++) {
			if (newDigitArrLeft[i] == null) {
				newDigitArrLeft[i] = '0';
			}
			if (newDigitArrRight[i] == null) {
				newDigitArrRight[i] = '0';
			}
		}
		AFDigitArr[0] = newDigitArrLeft[0];
		AFDigitArr[1] = newDigitArrLeft[1];
		AFDigitArr[2] = newDigitArrLeft[2];
		AFDigitArr[3] = newDigitArrRight[0];
		AFDigitArr[4] = newDigitArrRight[1];
		AFDigitArr[5] = newDigitArrRight[2];
	}
	$: {
		let split = transponderTertiaryFrequency.toString().split('.');
		let newDigitArrLeft = split[0].split('');
		let newDigitArrRight = split[1].split('');
		for (let i = 0; i < 4; i++) {
			if (newDigitArrLeft[i] == null) {
				newDigitArrLeft[i] = '0';
			}
			if (newDigitArrRight[i] == null) {
				newDigitArrRight[i] = '0';
			}
		}
		TFDigitArr[0] = newDigitArrLeft[0];
		TFDigitArr[1] = newDigitArrLeft[1];
		TFDigitArr[2] = newDigitArrLeft[2];
		TFDigitArr[3] = newDigitArrRight[0];
		TFDigitArr[4] = newDigitArrRight[1];
		TFDigitArr[5] = newDigitArrRight[2];
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
	class="transponder-segdisplay {showDisplayText} card flex flex-row nowrap items-center place-content-between"
>
	<div>
		<div class="mode-icon">{mode}</div>
	</div>
	<div class="sevenSEG flex flex-row flex-wrap">
		<div class="alternate-frequency flex flex-row">
			<div id="alternate-tdigit-0" class="tdigit">{AFDigitArr[0]}</div>
			<div id="alternate-tdigit-1" class="tdigit">{AFDigitArr[1]}</div>
			<div id="alternate-tdigit-2" class="tdigit">{AFDigitArr[2]}</div>
			<div class="tdecimal-point">.</div>
			<div id="alternate-tdigit-dp-0" class="tdigit">{AFDigitArr[3]}</div>
			<div id="alternate-tdigit-dp-1" class="tdigit">{AFDigitArr[4]}</div>
			<div id="alternate-tdigit-dp-2" class="tdigit">0</div>
		</div>
		<div>
			<div class="divider-pipe">|</div>
		</div>
		<div class="primary-frequency flex flex-row">
			<div id="primary-tdigit-0" class="tdigit">{PFDigitArr[0]}</div>
			<div id="primary-tdigit-1" class="tdigit">{PFDigitArr[1]}</div>
			<div id="primary-tdigit-2" class="tdigit">{PFDigitArr[2]}</div>
			<div class="tdecimal-point">.</div>
			<div id="primary-tdigit-dp-0" class="tdigit">{PFDigitArr[3]}</div>
			<div id="primary-tdigit-dp-1" class="tdigit">{PFDigitArr[4]}</div>
			<div id="primary-tdigit-dp-2" class="tdigit">0</div>
		</div>
		<div class="tertiary-frequency flex flex-row">
			<div id="tertiary-tdigit-0" class="tdigit">{TFDigitArr[0]}</div>
			<div id="tertiary-tdigit-1" class="tdigit">{TFDigitArr[1]}</div>
			<div id="tertiary-tdigit-2" class="tdigit">{TFDigitArr[2]}</div>
			<div class="tdecimal-point">.</div>
			<div id="tertiary-tdigit-dp-0" class="tdigit">{TFDigitArr[3]}</div>
			<div id="tertiary-tdigit-dp-1" class="tdigit">{TFDigitArr[4]}</div>
			<div id="tertiary-tdigit-dp-2" class="tdigit">0</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.transponder-segdisplay {
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

	.transponder-segdisplay .mode-icon {
		font-family: Segment7Standard;
		font-size: 20px;
		text-algin: left;
		padding: 2px;
		margin-left: 16px;
	}

	.transponder-segdisplay .sevenSEG {
		font-size: 30px;
		opacity: 1;
		margin-right: 40px;
		width: 70%;
	}

	.transponder-segdisplay .tdigit {
		font-family: Segment7Standard;
		text-algin: right;
		padding: 8px 0px;
	}

	.transponder-segdisplay .tdecimal-point {
		font-family: Segment7Standard;
		text-algin: right;
		padding: 8px 0px;
	}

	.transponder-segdisplay .divider-pipe {
		margin-left: 30px;
		margin-right: 30px;
		text-algin: right;
		padding: 8px 0px;
	}
</style>
