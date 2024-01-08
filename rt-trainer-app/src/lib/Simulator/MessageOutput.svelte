<script lang="ts">
	import type { COMFrequency } from '$lib/purets/States';
	import { simulatorCurrentTargetStore, simulatorATCMessageStore } from '$lib/stores';

	let simulatorCurrentTarget: COMFrequency;

	simulatorCurrentTargetStore.subscribe((value) => {
		simulatorCurrentTarget = value;
	});

	let atcMessage: string;

	simulatorATCMessageStore.subscribe((value) => {
		atcMessage = value;
	});
</script>

<div class="kneeboard flex flex-col grid-cols-1">
	<p class="output-box">{atcMessage}</p>
	<p class="output-box">
		Current Target: {simulatorCurrentTarget.callsign}<br />
		Frequency: {simulatorCurrentTarget.frequency} <br />
		Type: {simulatorCurrentTarget.frequency_type}
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
