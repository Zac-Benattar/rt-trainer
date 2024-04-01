<script lang="ts">
	import Map from '$lib/Components/Leaflet/Map.svelte';
	import {
		AllAirportsStore,
		OnRouteAirspacesStore,
		RouteDistanceStore,
		RouteDurationStore,
		SimDurationStore,
		WaypointPointsMapStore,
		WaypointsStore
	} from '$lib/stores';
	import Waypoint, { WaypointType } from '$lib/ts/AeronauticalClasses/Waypoint';
	import { init } from '@paralleldrive/cuid2';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import { fetchFRTOLRouteBySeed, loadFRTOLRouteBySeed } from '$lib/ts/Scenario';
	import { TrashBinOutline } from 'flowbite-svelte-icons';
	import { AllAirspacesStore } from '$lib/stores';
	import type { PageData } from './$types';
	import { plainToInstance } from 'class-transformer';
	import Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import Airport from '$lib/ts/AeronauticalClasses/Airport';
	import Marker from '$lib/Components/Leaflet/Marker.svelte';
	import Popup from '$lib/Components/Leaflet/Popup.svelte';
	import Polygon from '$lib/Components/Leaflet/Polygon.svelte';
	import { getNthPhoneticAlphabetLetter } from '$lib/ts/utils';
	import Polyline from '$lib/Components/Leaflet/Polyline.svelte';
	import { Icon } from 'svelte-icons-pack';
	import { BsAirplaneFill } from 'svelte-icons-pack/bs';
	import Control from '$lib/Components/Leaflet/Control.svelte';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import axios from 'axios';
	import { goto } from '$app/navigation';

	const routeCUID = init({ length: 8 });

	const modalStore = getModalStore();

	let showAllAirports: boolean = true;
	let showAllAirspaces: boolean = true;

	let routeSeed: string = routeCUID();
	let routeName: string = '';
	let routeDescription: string = '';

	let unnamedWaypointCount = 1;

	let blockingClick: boolean = false;

	export let data: PageData;

	const airspaces: Airspace[] = [];
	for (const airspace of data.airspaces) {
		airspaces.push(plainToInstance(Airspace, airspace as Airspace));
	}
	AllAirspacesStore.set(airspaces);

	const allAirspaces: Airport[] = [];
	for (const airport of data.airports) {
		allAirspaces.push(plainToInstance(Airport, airport as Airport));
	}
	AllAirportsStore.set(allAirspaces);

	const onRouteAirspaces: Airspace[] = [];
	OnRouteAirspacesStore.subscribe((value) => {
		onRouteAirspaces.length = 0;
		for (const airspace of value) {
			onRouteAirspaces.push(plainToInstance(Airspace, airspace as Airspace));
		}
	});

	let waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((value) => {
		waypoints = value;
	});

	let waypointPoints: number[][] = [];
	WaypointPointsMapStore.subscribe((value) => {
		waypointPoints = value;
	});

	let routeDistanceMeters = 0;
	RouteDistanceStore.subscribe((value) => {
		routeDistanceMeters = value;
	});

	let routeDurationSeconds = 0;
	RouteDurationStore.subscribe((value) => {
		routeDurationSeconds = value;
	});

	let simDurationSeconds = 0;
	SimDurationStore.subscribe((value) => {
		simDurationSeconds = value;
	});

	// Todo
	let airspaceIntersections = 0;

	// Add logic to choose units
	$: routeDistanceDisplay = routeDistanceMeters / 1852;

	$: routeDurationDisplay = routeDurationSeconds / 60;

	$: simDurationDisplay = simDurationSeconds / 60;

	function onMapClick(event: CustomEvent<{ latlng: { lat: number; lng: number } }>) {
		if (blockingClick) return;
		addWaypoint(
			+parseFloat(event.detail.latlng.lat.toFixed(6)),
			+parseFloat(event.detail.latlng.lng.toFixed(6))
		);
	}

	function addWaypoint(lat: number, lng: number) {
		const waypoint = new Waypoint(
			'Waypoint ' + getNthPhoneticAlphabetLetter(unnamedWaypointCount++),
			[lng, lat],
			WaypointType.Fix,
			waypoints.length
		);
		waypoints.push(waypoint);
		WaypointsStore.set(waypoints);
	}

	function onWaypointDrag(e: any) {
		const waypoint = waypoints.find((waypoint) => waypoint.id === e.detail.waypoint.id);
		if (waypoint) {
			waypoint.location = [
				parseFloat(e.detail.event.latlng.lng.toFixed(6)),
				parseFloat(e.detail.event.latlng.lat.toFixed(6))
			];
			WaypointsStore.set(waypoints);
		}
	}

	function deleteWaypoint(waypoint: Waypoint) {
		waypoints = waypoints.filter((w) => w.id !== waypoint.id);
		waypoints.forEach((waypoint, index) => {
			waypoint.index = index;
		});
		WaypointsStore.set(waypoints);
	}

	// TODO: Figure out how to only show save option when values have been changed
	function saveWaypointEdit(waypoint: Waypoint) {
		const nameElement = document.getElementById(
			`waypoint-${waypoint.id}-name`
		) as HTMLTextAreaElement;
		const latStringElement = document.getElementById(
			`waypoint-${waypoint.id}-lat`
		) as HTMLTextAreaElement;
		const lngStringElement = document.getElementById(
			`waypoint-${waypoint.id}-lng`
		) as HTMLTextAreaElement;
		if (
			nameElement &&
			nameElement.value &&
			latStringElement &&
			parseFloat(latStringElement.value) &&
			lngStringElement &&
			parseFloat(lngStringElement.value)
		) {
			waypoint.name = nameElement.value;
			waypoint.location[0] = +parseFloat(parseFloat(lngStringElement.value).toFixed(6));
			waypoint.location[1] = +parseFloat(parseFloat(latStringElement.value).toFixed(6));
			WaypointsStore.set(waypoints);
		}
	}

	function onSaveClick() {
		blockingClick = true;

		console.log(onRouteAirspaces);

		const modal: ModalSettings = {
			type: 'component',
			component: 'createRouteComponent',
			response: (r: any) => {
				console.log(r);
				if (r) {
					routeName = r.routeName;
					routeDescription = r.routeDescription;
					saveRoute();
				} else {
					blockingClick = false;
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function saveRoute() {
		try {
			const response = await axios.post('/api/routes', {
				routeName: routeName,
				routeDescription: routeDescription,
				createdBy: data.userId,
				waypoints: waypoints,
				type: 0,
				airspaceIds: airspaces.map((airspace) => {
					return {
						id: airspace.id
					};
				}),
				airportIds: allAirspaces.map((airport) => {
					return {
						id: airport.id
					};
				})
			});

			if (response.data.result === 'success') {
				goto(`/routes/${response.data.id}`);
			} else {
				// Add an error message modal
				blockingClick = false;
				console.log('Error: ', response);
			}
		} catch (error: unknown) {
			console.log('Error: ', error);
		}
	}
</script>

<div class="flex flex-col place-content-center w-full h-full">
	<div class="flex flex-col place-content-center sm:place-content-start w-full h-full">
		<div class="flex flex-col xs:pr-3 w-full h-full">
			<Map zoom={13} mode={MapMode.RoutePlan} on:click={onMapClick}>
				<Control position="topleft">
					<div>
						<button class="btn variant-filled border text-sm" on:click={onSaveClick}
							>Save Route</button
						>
					</div>
				</Control>

				{#each allAirspaces as airport}
					{#if showAllAirports || waypoints.some((waypoint) => waypoint.referenceObjectId === airport.id)}
						<Marker
							latLng={[airport.coordinates[1], airport.coordinates[0]]}
							width={30}
							height={30}
							aeroObject={airport}
							draggable={false}
						>
							{#if waypoints.some((waypoint) => waypoint.referenceObjectId === airport.id)}
								🛩️
							{:else}
								<Icon src={BsAirplaneFill} color="black" size="16" />
							{/if}

							<Popup><div>{airport.name}</div></Popup>
						</Marker>
					{/if}
				{/each}

				{#each airspaces as airspace}
					{#if showAllAirspaces}
						<Polygon latLngArray={airspace.coordinates[0].map((point) => [point[1], point[0]])} />
					{/if}
				{/each}

				{#each waypoints as waypoint (waypoint.index)}
					<Marker
						latLng={[waypoint.location[1], waypoint.location[0]]}
						width={50}
						height={50}
						aeroObject={waypoint}
						on:drag={onWaypointDrag}
						draggable={true}
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
								<textarea id="waypoint-{waypoint.id}-lat" class="textarea" rows="1"
									>{waypoint.name}</textarea
								><textarea class="textarea" rows="1">{waypoint.location[0]}</textarea><textarea
									id="waypoint-{waypoint.id}-lng"
									class="textarea"
									rows="1">{waypoint.location[1]}</textarea
								>
								<button
									class="btn varient-filled hidden"
									on:click={() => saveWaypointEdit(waypoint)}>Save</button
								>
								<button class="btn variant-filled" on:click={() => deleteWaypoint(waypoint)}
									><div class="grid grid-cols-4 gap-2 w-full">
										<div class="col-span-1 col-start-1"><TrashBinOutline /></div>
										<div class="col-span-3 col-start-2">Delete</div>
									</div></button
								>
							</div></Popup
						>
					</Marker>
				{/each}

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
			</Map>
		</div>
		<div class="flex flex-row w-full h-20">
			<div class="flex flex-row place-content-center p-4">
				<div class="flex flex-col place-content-center">
					<div class="text-sm">Est. Distance</div>
					<div class="text-xl">
						{routeDistanceDisplay.toFixed(2)} nm
					</div>
				</div>
			</div>
			<div class="vr h-full border border-surface-800" />
			<div class="flex flex-row place-content-center p-4">
				<div class="flex flex-col place-content-center">
					<div class="text-sm">Est. Sim Duration</div>
					<div class="text-xl">
						{simDurationDisplay} min
					</div>
				</div>
			</div>
			<div class="vr h-full border border-surface-800" />
			<div class="flex flex-row place-content-center p-4">
				<div class="flex flex-col place-content-center">
					<div class="text-sm">Est. Flight Duration</div>
					<div class="text-xl">
						{routeDurationDisplay} min
					</div>
				</div>
			</div>
			<div class="vr h-full border border-surface-800" />
			<div class="flex flex-row place-content-center p-4">
				<div class="flex flex-col place-content-center">
					<div class="text-sm">Airspace Crossings</div>
					<div class="text-xl">
						{airspaceIntersections}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	:global(.textarea) {
		resize: none;
	}
</style>
