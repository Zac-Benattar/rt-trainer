<script lang="ts">
	import { onMount } from 'svelte';

	export let DisplayOn: boolean = false;
	export let mode: string = 'COM';
	export let activeFrequency: number = 123.17;
	export let standbyFrequency: number = 126.41;
	export let tertiaryFrequency: number = 177.2;

	let mounted: boolean = false;
	
	// Digit arrays hold the digits of frequencies
	let SFDigitArr = ['0', '0', '0', '0', '0', '0']; // Standby frequency
	let AFDigitArr = ['0', '0', '0', '0', '0', '0']; // Active frequency
	let TFDigitArr = ['0', '0', '0', '0', '0', '0']; // Tertiary frequency

	$: showDisplayText = DisplayOn ? '' : 'displayoff';
	$: {
		if (!DisplayOn) {
			mode = 'COM';
		}
	}
	$: {
		let split = standbyFrequency.toString().split('.');
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
		SFDigitArr[0] = newDigitArrLeft[0];
		SFDigitArr[1] = newDigitArrLeft[1];
		SFDigitArr[2] = newDigitArrLeft[2];
		SFDigitArr[3] = newDigitArrRight[0];
		SFDigitArr[4] = newDigitArrRight[1];
		SFDigitArr[5] = newDigitArrRight[2];
	}
	$: {
		let split = activeFrequency.toString().split('.');
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
		let split = tertiaryFrequency.toString().split('.');
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
	class="radio-segdisplay {showDisplayText} card flex flex-row nowrap items-center place-content-between"
>
	<div>
		<div class="mode-icon">{mode}</div>
	</div>
	<div class="sevenSEG flex flex-row flex-wrap">
		<div class="alternate-frequency flex flex-row">
			<div id="alternate-rdigit-0" class="rdigit">{AFDigitArr[0]}</div>
			<div id="alternate-rdigit-1" class="rdigit">{AFDigitArr[1]}</div>
			<div id="alternate-rdigit-2" class="rdigit">{AFDigitArr[2]}</div>
			<div class="rdecimal-point">.</div>
			<div id="alternate-rdigit-dp-0" class="rdigit">{AFDigitArr[3]}</div>
			<div id="alternate-rdigit-dp-1" class="rdigit">{AFDigitArr[4]}</div>
			<div id="alternate-rdigit-dp-2" class="rdigit">{AFDigitArr[5]}</div>
		</div>
		<div>
			<div class="divider-pipe">|</div>
		</div>
		<div class="primary-frequency flex flex-row">
			<div id="primary-rdigit-0" class="rdigit">{SFDigitArr[0]}</div>
			<div id="primary-rdigit-1" class="rdigit">{SFDigitArr[1]}</div>
			<div id="primary-rdigit-2" class="rdigit">{SFDigitArr[2]}</div>
			<div class="rdecimal-point">.</div>
			<div id="primary-rdigit-dp-0" class="rdigit">{SFDigitArr[3]}</div>
			<div id="primary-rdigit-dp-1" class="rdigit">{SFDigitArr[4]}</div>
			<div id="primary-rdigit-dp-2" class="rdigit">{SFDigitArr[5]}</div>
		</div>
		<div class="tertiary-frequency flex flex-row">
			<div id="tertiary-rdigit-0" class="rdigit">{TFDigitArr[0]}</div>
			<div id="tertiary-rdigit-1" class="rdigit">{TFDigitArr[1]}</div>
			<div id="tertiary-rdigit-2" class="rdigit">{TFDigitArr[2]}</div>
			<div class="rdecimal-point">.</div>
			<div id="tertiary-rdigit-dp-0" class="rdigit">{TFDigitArr[3]}</div>
			<div id="tertiary-rdigit-dp-1" class="rdigit">{TFDigitArr[4]}</div>
			<div id="tertiary-rdigit-dp-2" class="rdigit">{TFDigitArr[5]}</div>
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
		font-size: 30px;
		opacity: 1;
		margin-right: 40px;
		width: 70%;
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
