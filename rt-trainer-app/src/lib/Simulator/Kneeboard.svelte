<script lang="ts">
	const handleDelete = () => {
		const inputBox = document.querySelector('.input-box') as HTMLInputElement;
        var deleteIcon = document.createElement('img');
        deleteIcon.setAttribute('class', 'icon');
        deleteIcon.setAttribute('src', '/images/delete.png');
        deleteIcon.addEventListener('click', handleDelete);
		inputBox.innerHTML = '';
        inputBox.appendChild(deleteIcon);
	};
</script>

<div class="kneeboard">
	<p contenteditable="true" class="input-box">
		Take notes here
		<img class="icon" src="/images/delete.png" on:click={handleDelete}/>
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
