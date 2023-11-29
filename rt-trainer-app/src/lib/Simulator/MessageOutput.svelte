<script lang="ts">
	export let message: string = 'Radio messages will appear here.';
</script>

<div class="kneeboard">
	<p class="output-box">{message}</p>
</div>

<style lang="postcss">
	.output-box {
		position: relative;
		width: 100%;
		min-width: 490px;
		max-width: 490px;
		height: 200px;
		background-color: #fff;
		padding: 20px;
		outline: solid 1px #ccc;
		border-radius: 5px;
		color: black;
		resize: none;
		overflow: scroll;
	}
</style>
