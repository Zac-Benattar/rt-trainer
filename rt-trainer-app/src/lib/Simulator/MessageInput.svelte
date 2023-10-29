<script lang="ts">
	const handleDelete = () => {
		clearBox();
	};

	const handleFocus = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		if (inputBox.innerHTML.includes('Enter your radio message here.')) {
			inputBox.innerHTML = '';
		}
	};

	const handleFocusOut = () => {
        const inputBox = document.getElementById('message-input') as HTMLInputElement;
		if (inputBox.innerHTML === '' || inputBox.innerHTML.replace(/\s/g, '').length) {
			resetBox();
		}
	};

	const clearBox = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		inputBox.innerHTML = '';
	};

	const resetBox = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		inputBox.innerHTML = 'Enter your radio message here.';
	};
</script>

<div class="message-input-container">
	<p id="message-input" contenteditable="true" class="input-box" on:focus={handleFocus} on:focusout={handleFocusOut}>
		Enter your radio message here.
	</p>
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<!-- svelte-ignore a11y-missing-attribute -->
	<img
		class="icon"
		style="top: 710px;"
		src="/images/delete.png"
		on:click={handleDelete}
		on:keypress={handleDelete}
	/>
</div>

<style lang="postcss">
	.input-box {
		position: relative;
		width: 100%;
		min-width: 1000px;
		height: 200px;
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
