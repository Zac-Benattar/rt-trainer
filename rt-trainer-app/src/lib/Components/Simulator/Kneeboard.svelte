<script lang="ts">
	const handleDelete = () => {
		resetBox();
	};

	const resetBox = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		inputBox.value = '';
	};
</script>

<div class="kneeboard-container flex flex-col grid-cols-1 items-end bg-surface-500">
	<div class="grow">
		<textarea
			class="textarea bg-secondary-500-50 text-secondary-50 bg-surface-500"
			id="kneeboard-input"
			name="kneeboard-input"
			rows="12"
			cols="50"
			maxlength="1000"
			placeholder="Make notes here."
		/>
	</div>

	<button class="clear-button btn self-end bg-surface-400" on:click={handleDelete}>Clear</button>
</div>

<style lang="postcss">
	.kneeboard-container {
		box-sizing: border-box;
		background-clip: padding-box;
		min-width: 490px;
		max-width: 490px;
		height: 390px;
		padding: 8px;
		border-radius: 5px;
	}

	.textarea {
		width: 100%;
		resize: none;
		overflow: auto;
	}
</style>
