<script lang="ts">
	import { AllAirportsStore, AllAirspacesStore, fetchAirports, fetchAirspaces } from '$lib/stores';
	import type Airport from '$lib/ts/AeronauticalClasses/Airport';
	import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import { generateFRTOLRouteFromSeed } from '$lib/ts/RouteGeneration';
	import { loadRouteData } from '$lib/ts/Scenario';
	import { init } from '@paralleldrive/cuid2';
	import { getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	export let parent: any;

	let validSettings: boolean = false;

	const shortCUID = init({ length: 8 });

	// Load stores if not populated
	let airspaces: Airspace[] = [];
	AllAirspacesStore.subscribe((value) => {
		airspaces = value;
	});
	if (airspaces.length === 0) fetchAirspaces();

	let airports: Airport[] = [];
	AllAirportsStore.subscribe((value) => {
		airports = value;
	});
	if (airports.length === 0) fetchAirports();

	$: if (
		formData.scenarioSeed &&
		formData.scenarioSeed.length > 0 &&
		formData.routeSeed &&
		formData.routeSeed.length > 0
	) {
		// Enable save button
		validSettings = true;
	} else {
		// Disable save button
		validSettings = false;
	}

	// Form Data
	const formData = {
		routeSeed: shortCUID(),
		scenarioSeed: shortCUID(),
		hasEmergencies: true
	};

	function onFormSubmit() {
		if ($modalStore[0].response) {
			// Check route generated correctly
			const routeData = generateFRTOLRouteFromSeed(formData.routeSeed, airports, airspaces, 30);
			if (routeData) {
				// Eventually check the scenario itself can be generated, for now just pass the route data and let the page handle it
				loadRouteData(routeData);
				$modalStore[0].response(formData);
				modalStore.close();
			} else {
				// Show error - this is temp - should turn the seed input red and give an error message
				validSettings = false;
			}
		}
	}

	// Base Classes
	const cBase = 'card p-4 w-modal-slim shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'space-y-4 rounded-container-token';

	// Reactive classes
	let cRouteSeedInput = '';
	let cRouteSeedInputErrorMessage = 'hidden';
	$: {
		if (validSettings) {
			cRouteSeedInput = '';
			cRouteSeedInputErrorMessage = 'hidden';
		} else {
			cRouteSeedInput = 'input-error';
			cRouteSeedInputErrorMessage = '';
		}
	}
</script>

{#if $modalStore[0]}
	<div class={cBase} title="Quick Generation" aria-label="Quick Generation modal">
		<header class={cHeader} id="title">Quick Generation</header>
		<form class="modal-form {cForm}">
			<label class="label"
				><span class="text-sm">Route Seed (required)</span>
				<input
					class="input {cRouteSeedInput}"
					type="text"
					bind:value={formData.routeSeed}
					placeholder="My Route"
				/>
				<div class="text-sm text-red-500 {cRouteSeedInputErrorMessage}">
					Route generation failed, please try another seed.
				</div></label
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
				<div class="text-sm text-slate-500">Engine failure, other aircraft in distress, etc...</div>
			</label>
		</form>
		<footer class="flex flex-row justify-between {parent.regionFooter}">
			<div class="flex flex-col place-content-center">
				<a href="/scenario-planner" class="anchor">Scenario Planner</a>
			</div>
			<button
				class="btn text-sm {parent.buttonPositive}"
				disabled={!validSettings}
				on:click={onFormSubmit}>Submit</button
			>
		</footer>
	</div>
{/if}
