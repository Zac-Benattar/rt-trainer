<script lang="ts">
	export let offset = 0;
	let deleteButtonOffset: number = 865;
	export let contents: string = '';

	$: deleteButtonOffset = offset + 865;

	const handleKeypress = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		contents = inputBox.innerHTML;
	};

	const handleDelete = () => {
		clearBox();
	};

	const handleFocus = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		if (inputBox.innerHTML.includes('Make notes here.')) {
			inputBox.innerHTML = '';
		}
	};

	const handleFocusOut = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		if (!inputBox.textContent || !inputBox.textContent.replace(/\s/g, '').length) {
			resetBox();
		}
	};

	const clearBox = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		inputBox.innerHTML = '';
	};

	const resetBox = () => {
		const inputBox = document.getElementById('kneeboard-input') as HTMLInputElement;
		inputBox.innerHTML = 'Make notes here.';
	};
</script>

<div class="kneeboard-container">
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
	<img
		class="icon"
		style={"top: " + deleteButtonOffset + "px;"}
		src="/images/delete.png"
		on:click={handleDelete}
		on:keypress={handleDelete}
	/>
</div>

<style lang="postcss">
	.input-box {
		position: relative;
		width: 100%;
		min-width: 490px;
		height: 360px;
		background-color: #fff;
		padding: 20px;
		outline: solid 1px #ccc;
		border-radius: 5px;
		color: black;
	}

	:global(.icon) {
		width: 25px;
		position: absolute;
		bottom: 15px;
		right: 15px;
		cursor: pointer;
	}
</style>
