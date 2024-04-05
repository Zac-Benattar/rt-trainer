<script lang="ts">
	import Map from '$lib/Components/Leaflet/Map.svelte';
	import {
		AllAirportsStore,
		AllAirspacesStore,
		ClearSimulationStores,
		CurrentScenarioPointStore,
		OnRouteAirspacesStore,
		ScenarioStore,
		WaypointPointsMapStore,
		WaypointsStore
	} from '$lib/stores';
	import type { PageData } from './$types';
	import { plainToInstance } from 'class-transformer';
	import { getModalStore, type ModalSettings, type ToastSettings } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import Scenario from '$lib/ts/Scenario';
	import ScenarioPointPreviewListBox from '$lib/Components/ScenarioPointPreviewListBox.svelte';
	import Polyline from '$lib/Components/Leaflet/Polyline.svelte';
	import Polygon from '$lib/Components/Leaflet/Polygon.svelte';
	import Popup from '$lib/Components/Leaflet/Popup.svelte';
	import Marker from '$lib/Components/Leaflet/Marker.svelte';
	import { wellesbourneMountfordCoords } from '$lib/ts/utils';
	import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import * as turf from '@turf/turf';
	import L from 'leaflet';
	import { WaypointType } from '$lib/ts/AeronauticalClasses/Waypoint';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	export let data: PageData;

	ClearSimulationStores();

	const scenario = plainToInstance(Scenario, data.scenario as Scenario);
	ScenarioStore.set(scenario);
	AllAirspacesStore.set(scenario.airspaces);
	AllAirportsStore.set(scenario.airports);
	WaypointsStore.set(scenario.waypoints);

	let scenarioName: string = scenario.name ?? 'Unnamed Scenario';
	let scenarioDescription: string = scenario.description ?? '';
	let scenarioSeed: string = scenario.seed ?? '';

	const waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((value) => {
		waypoints.length = 0;
		waypoints.push(...value);
	});

	let position: number[] = [0, 0];
	let displayHeading: number = 0;
	let altitude: number = 0;
	let airSpeed: number = 0;

	CurrentScenarioPointStore.subscribe((value) => {
		position = value?.pose.position.reverse() ?? [0, 0];
		displayHeading = value?.pose.trueHeading ? value?.pose.trueHeading - 45 : 0;
		altitude = value?.pose.altitude ?? 0;
		airSpeed = value?.pose.airSpeed ?? 0;
	});

	let waypointPoints: number[][] = [];
	let bounds: L.LatLngBounds;
	let bbox: number[] = [];
	WaypointPointsMapStore.subscribe((value) => {
		waypointPoints = value;

		if (waypointPoints.length > 1) {
			bbox = turf.bbox(turf.lineString(waypointPoints));
			bounds = new L.LatLngBounds([
				[bbox[0], bbox[1]],
				[bbox[2], bbox[3]]
			]);
		}
	});

	const onRouteAirspaces: Airspace[] = [];
	OnRouteAirspacesStore.subscribe((value) => {
		onRouteAirspaces.length = 0;
		onRouteAirspaces.push(...value);
	});

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

<div class="flex flex-col place-content-center w-full h-full">
	<div
		class="flex flex-col sm:flex-row p-3 place-content-center sm:place-content-start gap-5 w-full h-full"
	>
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

		<div class="flex flex-col px-2 xs:pr-3 w-full h-full">
			<div class="h4 p-1">Scenario Preview</div>
			<div class="w-full h-full">
				<Map view={wellesbourneMountfordCoords} zoom={9} {bounds}>
					{#if waypointPoints.length > 0}
						{#each waypoints as waypoint (waypoint.index)}
							{#key waypoint.index}
								<Marker
									latLng={[waypoint.location[1], waypoint.location[0]]}
									width={50}
									height={50}
									aeroObject={waypoint}
									on:click={(e) => {
										e.preventDefault();
									}}
									on:mouseover={(e) => {
										e.detail.marker.openPopup();
									}}
									on:mouseout={(e) => {
										e.detail.marker.closePopup();
									}}
								>
									{#if waypoint.index == waypoints.length - 1}
										<div class="text-2xl">🏁</div>
									{:else if waypoint.type == WaypointType.Airport}
										<div class="text-2xl">🛫</div>
									{:else}
										<div class="text-2xl">🚩</div>
									{/if}

									<Popup
										><div class="flex flex-col gap-2">
											<div>{waypoint.name}</div>
										</div></Popup
									></Marker
								>
							{/key}
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

					{#each onRouteAirspaces as airspace}
						{#if airspace.type == 14}
							<Polygon
								latLngArray={airspace.coordinates[0].map((point) => [point[1], point[0]])}
								color={'red'}
								fillOpacity={0.2}
								weight={1}
								on:click={(e) => {
									e.preventDefault();
								}}
								on:mouseover={(e) => {
									e.detail.polygon.openPopup();
								}}
								on:mouseout={(e) => {
									e.detail.polygon.closePopup();
								}}
							/>
						{:else}
							<Polygon
								latLngArray={airspace.coordinates[0].map((point) => [point[1], point[0]])}
								color={'blue'}
								fillOpacity={0.2}
								weight={1}
								on:click={(e) => {
									e.preventDefault();
								}}
								on:mouseover={(e) => {
									e.detail.polygon.openPopup();
								}}
								on:mouseout={(e) => {
									e.detail.polygon.closePopup();
								}}
							/>
						{/if}
					{/each}

					{#key position}
						<Marker latLng={position} width={50} height={50} rotation={displayHeading}>
							<div class="text-2xl">🛩️</div>

							<Popup
								><div class="flex flex-col gap-2">
									<div>{position}</div>
								</div></Popup
							>
						</Marker>
					{/key}
				</Map>
			</div>

			<div class="w-full h-full">
				<div class="h4 p-1">Scenario Points</div>
				<ScenarioPointPreviewListBox {scenario} />
			</div>
		</div>
	</div>
</div>
