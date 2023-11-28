<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	let mounted: boolean = false;
	export let message: string = '';

	$: if (mounted) {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		if (inputBox.textContent !== null && inputBox.textContent !== 'Enter your radio message here.') {
			message = inputBox.textContent;
		}
	}

	const dispatch = createEventDispatcher();

	const handleKeypress = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		message = inputBox.textContent ? inputBox.textContent : '';
	};

	const handleDelete = () => {
		resetBox();
	};

	const handleFocus = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		if (inputBox.textContent === 'Enter your radio message here.') {
			inputBox.textContent = '';
		}
	};

	const handleFocusOut = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		if (!inputBox.textContent || !inputBox.textContent.replace(/\s/g, '').length) {
			resetBox();
		}
	};

	const resetBox = () => {
		const inputBox = document.getElementById('message-input') as HTMLInputElement;
		inputBox.textContent = 'Enter your radio message here.';
	};

	const submit = () => {
		dispatch('submit', message);
	};

	onMount(() => {
		mounted = true;
	});
</script>

<div class="message-input-container">
	<p
		id="message-input"
		contenteditable="true"
		class="input-box"
		on:focus={handleFocus}
		on:focusout={handleFocusOut}
		on:change={handleFocus}
		on:keypress={handleKeypress}
		on:input={handleKeypress}
	>
		Enter your radio message here.
	</p>
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<!-- svelte-ignore a11y-missing-attribute -->
	<img
		class="delete-icon"
		src="/images/delete.png"
		on:click={handleDelete}
		on:keypress={handleDelete}
	/>

	<button
	class="submit-button btn variant-filled"
	on:click={submit}
>Submit</button>
</div>

<style lang="postcss">
	.input-box {
		position: relative;
		width: 100%;
		width: 600px;
		height: 200px;
		background-color: #fff;
		padding: 20px;
		outline: solid 1px #ccc;
		border-radius: 5px;
		color: black;
	}

	:global(.delete-icon) {
		width: 36px;
		position: absolute;
		bottom: 15px;
		right: 15px;
		top: 660px;
		cursor: pointer;
	}

	:global(.delete-icon:hover) {
		width: 40px;
	}

	:global(.submit-button) {
		position: absolute;
		bottom: 15px;
		right: 65px;
		top: 660px;
		height: 30px;
		cursor: pointer;
		color: black;
		background-color: #707070;
	}

	:global(.submit-button:hover) {
		background-color: #707070;
	}
</style>
