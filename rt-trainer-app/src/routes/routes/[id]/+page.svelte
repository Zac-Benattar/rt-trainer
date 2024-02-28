<script lang="ts">
	import Map from '$lib/Components/Map.svelte';
	import { AwaitingServerResponseStore, ClearSimulationStores, WaypointsStore } from '$lib/stores';
	import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import type { PageData } from './$types';
	import { plainToInstance } from 'class-transformer';
	import { getModalStore, type ModalSettings, type ToastSettings } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	export let data: PageData;

	ClearSimulationStores();

	let routeName: string = data.userRoutes?.name ?? 'Unnamed Route';
	let routeDescription: string = data.userRoutes?.description ?? '';
	let waypoints: Waypoint[] = [];

	let routeNameClasses: string = '';

	let formEl: HTMLFormElement;
	let confirmedAction: boolean = false;

	const updatedRouteToast: ToastSettings = { message: 'Updated Route' };

	// Populate waypoints array and store
	if (data.userRoutes?.waypoints != undefined) {
		for (let i = 0; i < data.userRoutes?.waypoints.length; i++) {
			waypoints.push(
				plainToInstance(Waypoint, data.userRoutes?.waypoints[i] as unknown as Waypoint)
			);
		}
		WaypointsStore.set(waypoints);
	}

	function showConfirmDeleteModal() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please Confirm',
			body: 'Are you sure you wish to delete this route?',
			response: (r: boolean) => {
				if (r) {
					confirmedAction = true;
					formEl.action = '?/deleteRoute';
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
					const { routeName } = Object.fromEntries(formData);
					if (routeName.toString().length < 1) {
						// Show error message
						routeNameClasses = 'input-error';
						cancel();
						return;
					}

					if (!confirmedAction && action.href.includes('?/deleteRoute')) {
						cancel();
						showConfirmDeleteModal();
					}

					return async ({ result, update }) => {
						switch (result.type) {
							case 'error':
								console.log('Error:', result.error);
								break;
							case 'success':
								toastStore.trigger(updatedRouteToast);
								break;
						}
						await update({ reset: false });
					};
				}}
			>
				<div>
					<div class="h4 p-1">Route Name</div>
					<input name="routeId" value={data.userRoutes?.id} hidden />
					<input
						class="input {routeNameClasses}"
						name="routeName"
						type="text"
						placeholder="Unnamed Route"
						bind:value={routeName}
					/>
				</div>

				<div>
					<div class="h4 p-1">Description</div>
					<textarea
						class="textarea"
						rows="4"
						name="routeDescription"
						placeholder="No description"
						bind:value={routeDescription}
					/>
				</div>

				<div class="flex flex-row gap-2 mt-2">
					<button formaction="?/updateRoute" class="btn variant-filled">Update Route</button>
					<button
						formaction="?/deleteRoute"
						class="btn variant-filled-error"
						on:click={showConfirmDeleteModal}>Delete Route</button
					>
				</div>
			</form>
		</div>

		<div class="flex flex-col px-2 xs:pr-3">
			<div class="h4 p-1">Route Preview</div>
			<Map
				enabled={true}
				widthSmScreen={'600px'}
				heightSmScreen={'500px'}
				mode={MapMode.RoutePlan}
			/>
		</div>
	</div>
</div>
