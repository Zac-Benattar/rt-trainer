<script lang="ts">
	const handleDelete = () => {
		resetBox();
	};

	const resetBox = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		inputBox.value = '';
	};
</script>

<div class="kneeboard-container flex flex-col grid-cols-1 gap-2 bg-surface-500">
	<div class="grow flex">
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

	<div class="flex flex-row gap-x-3 justify-end">
		<button class="clear-button btn bg-surface-400" on:click={handleDelete}>Clear</button>
	</div>
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

	.btn {
		height: 40px;
	}
</style>
