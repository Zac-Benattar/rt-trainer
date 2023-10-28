<script lang="ts">
	// Clears input box
	const handleDelete = () => {
		const inputBox = document.querySelector('.input-box') as HTMLInputElement;
        var deleteIcon = document.createElement('img');
		// Create new inner html
        deleteIcon.setAttribute('class', 'icon');
        deleteIcon.setAttribute('src', '/images/delete.png');
        deleteIcon.addEventListener('click', handleDelete);
		inputBox.innerHTML = ''; // Clear existing innerHTML
        inputBox.appendChild(deleteIcon); // Add new innerHTML
	};
</script>

<div class="kneeboard">
	<p contenteditable="true" class="input-box">
		Take notes here
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<!-- svelte-ignore a11y-missing-attribute -->
		<img class="icon" src="/images/delete.png" on:click={handleDelete} on:keypress={handleDelete}/>
	</p>
</div>

<style lang="postcss">
	.input-box {
		position: relative;
		width: 100%;
		min-width: 490px;
		min-height: 360px;
		max-height: 1000px;
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
