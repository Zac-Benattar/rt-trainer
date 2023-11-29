<script lang="ts">
	import type { COMFrequency } from '$lib/lib/States';

	export let message: string = 'Radio messages will appear here.';
	export let currentTarget: COMFrequency;
</script>

<div class="kneeboard flex flex-col grid-cols-1">
	<p class="output-box">{message}</p>
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
		overflow: scroll;
	}
</style>
