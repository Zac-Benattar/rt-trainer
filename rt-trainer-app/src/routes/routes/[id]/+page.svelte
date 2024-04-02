<script lang="ts">
	import Map from '$lib/Components/Leaflet/Map.svelte';
	import { ClearSimulationStores, OnRouteAirspacesStore, WaypointPointsMapStore, WaypointsStore } from '$lib/stores';
	import type { PageData } from './$types';
	import { getModalStore, type ModalSettings, type ToastSettings } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { loadRouteDataById } from '$lib/ts/Scenario';
	import * as turf from '@turf/turf';
	import L from 'leaflet';
	import Marker from '$lib/Components/Leaflet/Marker.svelte';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import Popup from '$lib/Components/Leaflet/Popup.svelte';
	import Polyline from '$lib/Components/Leaflet/Polyline.svelte';
	import { wellesbourneMountfordCoords } from '$lib/ts/utils';
	import Polygon from '$lib/Components/Leaflet/Polygon.svelte';
	import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	export let data: PageData;

	ClearSimulationStores();

	let routeName: string = data.routeRow?.name ?? 'Unnamed Route';
	let routeDescription: string = data.routeRow?.description ?? '';

	let routeNameClasses: string = '';

	let formEl: HTMLFormElement;
	let confirmedAction: boolean = false;

	const updatedRouteToast: ToastSettings = { message: 'Updated Route' };

	let bounds: L.LatLngBounds;

	// Populate waypoints array and store
	if (data.routeRow) {
		loadRouteDataById(data.routeRow.id);

		const bbox = turf.bbox(
			turf.lineString(data.routeRow.waypoints.map((waypoint) => [waypoint.lat, waypoint.lng]))
		);
		bounds = new L.LatLngBounds([
			[bbox[0], bbox[1]],
			[bbox[2], bbox[3]]
		]);
	}

	const waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((value) => {
		waypoints.length = 0;
		waypoints.push(...value);
	});

	let waypointPoints: number[][] = [];
	WaypointPointsMapStore.subscribe((value) => {
		waypointPoints = value;
	});

	const filteredAirspaces: Airspace[] = [];
	OnRouteAirspacesStore.subscribe((value) => {
		filteredAirspaces.length = 0;
		filteredAirspaces.push(...value);
	});

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

<div class="flex flex-col place-content-center w-full h-full">
	<div
		class="flex flex-col sm:flex-row p-3 place-content-center sm:place-content-start gap-5 w-full h-full"
	>
		<div class="flex flex-col px-2 w-[500px] gap-2">
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
					<input name="routeId" value={data.routeRow?.id} hidden />
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

				<div class="flex flex-row gap-3 mt-2">
					<button formaction="?/updateRoute" class="btn variant-filled">Update Route</button>
					<button
						formaction="?/deleteRoute"
						class="btn variant-filled-error"
						on:click={showConfirmDeleteModal}>Delete Route</button
					>
				</div>
			</form>
		</div>

		<div class="flex flex-col px-2 xs:pr-3 w-[700px] h-[600px]">
			<div class="h4 p-1">Route Preview</div>
			<Map view={wellesbourneMountfordCoords} zoom={9} {bounds}>
				{#if data.routeRow}
					{#each waypoints as waypoint (waypoint.index)}
						<Marker
							latLng={[waypoint.location[1], waypoint.location[0]]}
							width={50}
							height={50}
							aeroObject={waypoint}
						>
							{#if waypoint.index == 0}
								<div class="text-2xl">🛩️</div>
							{:else if waypoint.index == waypoints.length - 1}
								<div class="text-2xl">🏁</div>
							{:else}
								<div class="text-2xl">🚩</div>
							{/if}

							<Popup
								><div class="flex flex-col gap-2">
									<div>{waypoint.name}</div>
								</div></Popup
							></Marker
						>
					{/each}
				{/if}

				{#each waypointPoints as waypointPoint, index}
					{#if index > 0}
						<!-- Force redraw if either waypoint of the line changes location -->
						{#key [waypointPoints[index - 1], waypointPoints[index]]}
							<Polyline
								latLngArray={[waypointPoints[index - 1], waypointPoints[index]]}
								colour="#FF69B4"
								fillOpacity={1}
								weight={7}
							/>
						{/key}
					{/if}
				{/each}

				{#each filteredAirspaces as airspace}
					{#if airspace.type == 14}
						<Polygon
							latLngArray={airspace.coordinates[0].map((point) => [point[1], point[0]])}
							color={'red'}
							fillOpacity={0.2}
							weight={1}
						/>
					{:else}
						<Polygon
							latLngArray={airspace.coordinates[0].map((point) => [point[1], point[0]])}
							color={'blue'}
							fillOpacity={0.2}
							weight={1}
						/>
					{/if}
				{/each}
			</Map>
		</div>
	</div>
</div>
