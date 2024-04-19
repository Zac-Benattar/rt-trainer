<script lang="ts">
	import { init } from '@paralleldrive/cuid2';
	import { getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	export let parent: any;

	let validSettings: boolean = false;

	const shortCUID = init({ length: 8 });

	$: if (
		formData.scenarioSeed &&
		formData.scenarioSeed.length > 0 &&
		formData.routeSeed &&
		formData.routeSeed.length > 0
	) {
		// enable save button
		validSettings = true;
	} else {
		// disable save button
		validSettings = false;
	}

	// Form Data
	const formData = {
		routeSeed: shortCUID(),
		scenarioSeed: shortCUID(),
		hasEmergencies: true
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
		<header class={cHeader}>Create Scenario</header>
		<form class="modal-form {cForm}">
			<label class="label"
				><span class="text-sm">Route Seed (required)</span>
				<input
					class="input"
					type="text"
					bind:value={formData.routeSeed}
					placeholder="My Route"
				/></label
			><label class="label"
				><span class="text-sm">Scenario Seed (required)</span>
				<input
					class="textarea"
					type="text"
					bind:value={formData.scenarioSeed}
					placeholder=""
				/></label
			><label class="label">
				<label class="flex items-center space-x-2">
					<input
						id="emergency-events-checkbox"
						class="checkbox"
						type="checkbox"
						checked
						on:change={() => (formData.hasEmergencies = !formData.hasEmergencies)}
					/>
					<p>Emergency Events</p>
				</label>
			</label>
		</form>
		<footer class="flex flex-row justify-between {parent.regionFooter}">
			<div class="flex flex-col place-content-center">
				<a href="/scenarioplanner" class="anchor">Scenario Planner</a>
			</div>
			<button
				class="btn text-sm {parent.buttonPositive}"
				disabled={!validSettings}
				on:click={onFormSubmit}>Submit</button
			>
		</footer>
	</div>
{/if}

<style lang="postcss">
</style>
