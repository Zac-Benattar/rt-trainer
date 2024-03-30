<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	export let parent: any;

	let validRouteName: boolean = false;

	$: if (formData.routeName && formData.routeName.length > 0) {
		// enable save button
		validRouteName = true;
	} else {
		// disable save button
		validRouteName = false;
	}

	// Form Data
	const formData = {
		routeName: '',
		routeDescription: ''
	};

	function onFormSubmit() {
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-96 shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'space-y-4 rounded-container-token';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>Create Route</header>
		<form class="modal-form {cForm}">
			<label class="label"
				><span class="text-sm">Route Name (required)</span>
				<input
					class="input"
					type="text"
					bind:value={formData.routeName}
					placeholder="My Route"
				/></label
			><label class="label"
				><span class="text-sm">Description</span>
				<textarea
					class="textarea"
					rows="5"
					bind:value={formData.routeDescription}
					placeholder="Enter some details about the route..."
				/></label
			>
		</form>
		<footer class="flex flex-row gap-2 {parent.regionFooter}">
			<button class="btn text-sm {parent.buttonNeutral}" on:click={parent.onClose}
				>Edit Route</button
			>
			<button class="btn text-sm grow {parent.buttonPositive}" disabled={!validRouteName} on:click={onFormSubmit}
				>Save to My Routes</button
			>
		</footer>
	</div>
{/if}

<style lang="postcss">
</style>
