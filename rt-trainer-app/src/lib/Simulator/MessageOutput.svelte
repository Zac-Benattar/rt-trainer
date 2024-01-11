<script lang="ts">
	import type { COMFrequency } from '$lib/ts/States';
	import { CurrentTargetStore, ATCMessageStore } from '$lib/stores';

	let currentTarget: COMFrequency;

	CurrentTargetStore.subscribe((value) => {
		currentTarget = value;
	});

	let atcMessage: string;

	ATCMessageStore.subscribe((value) => {
		atcMessage = value;
	});
</script>

<div class="kneeboard flex flex-col grid-cols-1">
	<p class="output-box">{atcMessage}</p>
	<p class="output-box">
		Current Target: {currentTarget.callsign}<br />
		Frequency: {currentTarget.frequency} <br />
		Type: {currentTarget.frequency_type}
	</p>
</div>

<style lang="postcss">
	.kneeboard {
		box-sizing: border-box;
		padding: 10px;
		min-width: 490px;
		max-width: 490px;
		height: 200px;
		background-color: #fff;
		padding: 20px;
		outline: solid 1px #ccc;
		border-radius: 5px;
		color: black;
	}

	.output-box {
		width: 100%;
		height: 120px;
		resize: none;
		overflow: auto;
	}
</style>
