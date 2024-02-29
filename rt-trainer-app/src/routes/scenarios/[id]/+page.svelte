<script lang="ts">
	import Map from '$lib/Components/Map.svelte';
	import {
		AirportsStore,
		AirspacesStore,
		ClearSimulationStores,
		WaypointsStore
	} from '$lib/stores';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import type { PageData } from './$types';
	import { plainToInstance } from 'class-transformer';
	import { getModalStore, type ModalSettings, type ToastSettings } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import Scenario from '$lib/ts/Scenario';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	export let data: PageData;

	ClearSimulationStores();

	const scenario = plainToInstance(Scenario, data.scenario as Scenario);
	AirspacesStore.set(scenario.airspaces);
	AirportsStore.set(scenario.airports);
	WaypointsStore.set(scenario.waypoints);

	let scenarioName: string = scenario.name ?? 'Unnamed Scenario';
	let scenarioDescription: string = scenario.description ?? '';
	let scenarioSeed: string = scenario.seed ?? '';

	let scenarioNameClasses: string = '';
	let scenarioSeedClasses: string = '';

	let formEl: HTMLFormElement;
	let confirmedAction: boolean = false;

	const updatedScenarioToast: ToastSettings = { message: 'Updated Scenario' };

	function showConfirmDeleteModal() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please Confirm',
			body: 'Are you sure you wish to delete this scenario?',
			response: (r: boolean) => {
				if (r) {
					confirmedAction = true;
					formEl.action = '?/deleteScenario';
					formEl.requestSubmit();
					modalStore.clear();
				}
			}
		};
		modalStore.trigger(modal);
	}
</script>

<div class="flex flex-col place-content-center">
	<div class="flex flex-col sm:flex-row p-3 place-content-center sm:place-content-start gap-5">
		<div class="flex flex-col px-2 grow sm:max-w-xl gap-2">
			<form
				class="flex flex-col gap-1"
				method="POST"
				bind:this={formEl}
				use:enhance={({ formElement, formData, action, cancel, submitter }) => {
					const { scenarioName } = Object.fromEntries(formData);
					if (scenarioName.toString().length < 1) {
						// Show error message
						scenarioNameClasses = 'input-error';
						cancel();
						return;
					}

					if (!confirmedAction && action.href.includes('?/deleteScenario')) {
						cancel();
						showConfirmDeleteModal();
					}

					return async ({ result, update }) => {
						switch (result.type) {
							case 'error':
								console.log('Error:', result.error);
								break;
							case 'success':
								toastStore.trigger(updatedScenarioToast);
								break;
						}
						await update({ reset: false });
					};
				}}
			>
				<div>
					<div class="h4 p-1">Scenario Name</div>
					<input name="scenarioId" value={scenario.id} hidden />
					<input
						class="input {scenarioNameClasses}"
						name="scenarioName"
						type="text"
						placeholder="Unnamed Scenario"
						bind:value={scenarioName}
					/>
				</div>

				<div>
					<div class="h4 p-1">Description</div>
					<textarea
						class="textarea"
						rows="4"
						name="scenarioDescription"
						placeholder="No description"
						bind:value={scenarioDescription}
					/>
				</div>

				<div>
					<div class="h4 p-1">Scenario Seed</div>
					<input
						class="input {scenarioSeedClasses}"
						name="scenarioSeed"
						type="text"
						bind:value={scenarioSeed}
					/>
				</div>

				<div class="flex flex-row gap-3 mt-2">
					<button formaction="?/updateScenario" class="btn variant-filled">Update Scenario</button>
					<button
						formaction="?/deleteScenario"
						class="btn variant-filled-error"
						on:click={showConfirmDeleteModal}>Delete Scenario</button
					>
					<button formaction="?/redirectToSimulator" class="btn variant-filled">Practice</button>
				</div>
			</form>
		</div>

		<div class="flex flex-col px-2 xs:pr-3">
			<div class="h4 p-1">Scenario Preview</div>
			<Map
				enabled={true}
				widthSmScreen={'600px'}
				heightSmScreen={'500px'}
				mode={MapMode.ScenarioPlan}
			/>
		</div>
	</div>
</div>
