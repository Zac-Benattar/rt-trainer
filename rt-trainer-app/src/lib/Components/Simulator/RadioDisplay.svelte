<script lang="ts">
	import { onMount } from 'svelte';

	export let DisplayOn: boolean = false;
	export let mode: string = 'COM';
	export let activeFrequency: number = 123.17;
	export let standbyFrequency: number = 126.41;
	export let tertiaryFrequency: number = 177.2;

	let mounted: boolean = false;

	$: showDisplayText = DisplayOn ? 'displayon' : 'displayoff';
	$: if (!DisplayOn) {
		mode = 'COM';
	}

	onMount(() => {
		mounted = true;
	});
</script>

<div
	class="radio-segdisplay {showDisplayText} card flex flex-row items-center place-content-evenly"
>
	<div class="flex flex-col place-content-center ml-2 sm:ml-4">
		<div class="mode-icon">{mode}</div>
	</div>
	<div class="sevenSEG flex flex-row flex-wrap sm:ml-8 sm:mr-10">
		<div class="alternate-frequency flex flex-row">
			<div id="alternate-rdigit-0" class="rdigit text-[23px] sm:text-md md:text-3xl/6">
				{activeFrequency.toFixed(3)}
			</div>
		</div>
		<div>
			<div class="divider-pipe text-[23px] sm:text-md md:text-3xl/6 mx-2 sm:mx-8">|</div>
		</div>
		<div class="primary-frequency flex flex-row">
			<div id="primary-rdigit-0" class="rdigit text-[23px] sm:text-md md:text-3xl/6">
				{standbyFrequency.toFixed(3)}
			</div>
		</div>
		<div class="tertiary-frequency flex flex-row">
			<div id="tertiary-rdigit-0" class="rdigit text-[23px] sm:text-md md:text-3xl/6">
				{tertiaryFrequency.toFixed(3)}
			</div>
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

	:global(.displayon) {
		color: #f74;
		text-shadow: 0 0 7px #f07c0765, 0 0 10px #f07c0765, 0 0 21px #f07c0765, 0 0 32px #f74;
	}

	:global(.displayoff) {
		color: rgba(var(--color-surface-900) / 1);
		text-shadow: none;
	}

	.radio-segdisplay .mode-icon {
		font-family: DSEG7ClassicMini;
		font-size: 23px;
		text-algin: left;
		padding: 2px;
	}

	.radio-segdisplay .rdigit {
		font-family: DSEG7ClassicMini;
		text-algin: right;
		padding: 8px 0px;
	}

	.radio-segdisplay .divider-pipe {
		text-algin: right;
		padding: 8px 0px;
	}
</style>
