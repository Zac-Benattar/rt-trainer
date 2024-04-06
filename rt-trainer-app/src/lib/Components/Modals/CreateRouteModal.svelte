<script lang="ts">
	import { Visibility } from '$lib/db/schema';
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
		routeDescription: '',
		routeVisibility: Visibility.PRIVATE
	};

	function onFormSubmit() {
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-[430px] shadow-xl space-y-4';
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
			><label class="label"
				><span class="h4 p-1">Visibility</span>

				<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
					<div class="w-full">
						<div class="flex items-center">
							<input
								id="horizontal-list-radio-visibility-public"
								class="radio"
								type="radio"
								name="radio-visibility"
								value="3"
								on:click={() => (formData.routeVisibility = Visibility.PUBLIC)}
							/>
							<label
								for="horizontal-list-radio-visibility-public"
								class="w-full py-3 ms-2 text-sm font-medium">Public</label
							>
						</div>
					</div>
					<div class="w-full">
						<div class="flex items-center">
							<input
								id="horizontal-list-radio-visibility-unlisted"
								class="radio"
								type="radio"
								name="radio-visibility"
								value="2"
								on:click={() => (formData.routeVisibility = Visibility.UNLISTED)}
							/>
							<label
								for="horizontal-list-radio-visibility-unlisted"
								class="w-full py-3 ms-2 text-sm font-medium">Unlisted</label
							>
						</div>
					</div>
					<div class="w-full">
						<div class="flex items-center">
							<input
								id="horizontal-list-radio-visibility-private"
								class="radio"
								type="radio"
								name="radio-visibility"
								value="1"
								checked
								on:click={() => (formData.routeVisibility = Visibility.PRIVATE)}
							/>
							<label
								for="horizontal-list-radio-visibility-private"
								class="w-full py-3 ms-2 text-sm font-medium">Private</label
							>
						</div>
					</div>
				</div>
			</label>
		</form>
		<footer class="flex flex-row gap-2 {parent.regionFooter}">
			<button class="btn text-sm {parent.buttonNeutral}" on:click={parent.onClose}
				>Edit Route</button
			>
			<button
				class="btn text-sm grow {parent.buttonPositive}"
				disabled={!validRouteName}
				on:click={onFormSubmit}>Save to My Routes</button
			>
		</footer>
	</div>
{/if}

<style lang="postcss">
</style>
