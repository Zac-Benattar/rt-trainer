<script lang="ts">
	export let contents: string = '';

	const handleKeypress = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		contents = inputBox.textContent ? inputBox.textContent : '';
	};

	const handleDelete = () => {
		resetBox();
	};

	const handleFocus = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		if (inputBox.textContent === 'Make notes here.') {
			inputBox.textContent = '';
		}
	};

	const handleFocusOut = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		if (!inputBox.textContent || !inputBox.textContent.replace(/\s/g, '').length) {
			resetBox();
		}
	};

	const resetBox = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		inputBox.textContent = 'Make notes here.';
	};
</script>

<div class="kneeboard-container flex flex-col grid-cols-1 items-end">
	<p
		id="kneeboard-input"
		contenteditable="true"
		class="input-box"
		on:focus={handleFocus}
		on:focusout={handleFocusOut}
		on:keypress={handleKeypress}
	>
		Make notes here.
	</p>
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<!-- svelte-ignore a11y-missing-attribute -->
	<input class="delete-button btn" type="image" src="/images/delete.png" on:click={handleDelete} on:keypress={handleDelete}/>
</div>

<style lang="postcss">
	.kneeboard-container {
		box-sizing: border-box;
		padding: 10px;
		min-width: 490px;
		height: 390px;
		background-color: #fff;
		padding: 20px;
		outline: solid 1px #ccc;
		border-radius: 5px;
		color: black;
	}

	.input-box {
		width: 100%;
		height: 430px;
	}

	.input-box:focus {
		outline: none;
	}

	.delete-button {
		padding-right: 0px;
		padding-bottom: 0px;
		padding-top: 0px;
		padding-left: 10px;
		width: 60px;
		height: 40px;
	}
</style>
