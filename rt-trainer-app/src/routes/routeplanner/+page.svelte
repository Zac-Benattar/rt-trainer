<script lang="ts">
	import Map from '$lib/Components/Leaflet/Map.svelte';
	import {
		AirportsStore,
		RouteDistanceStore,
		RouteDurationStore,
		SimDurationStore,
		WaypointsStore
	} from '$lib/stores';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import { init } from '@paralleldrive/cuid2';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import type { ActionData } from './$types';
	import { fetchFRTOLRouteBySeed, loadFRTOLRouteBySeed } from '$lib/ts/Scenario';
	import { RefreshOutline, CirclePlusOutline, CirclePlusSolid } from 'flowbite-svelte-icons';
	import { AirspacesStore } from '$lib/stores';
	import type { PageData } from './$types';
	import { plainToInstance } from 'class-transformer';
	import Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import Airport from '$lib/ts/AeronauticalClasses/Airport';
	import Marker from '$lib/Components/Leaflet/Marker.svelte';
	import Popup from '$lib/Components/Leaflet/Popup.svelte';
	import Polygon from '$lib/Components/Leaflet/Polygon.svelte';

	const routeCUID = init({ length: 8 });

	let showAllAirports: boolean = true;
	let showAllAirspaces: boolean = true;

	let routeSeed: string = routeCUID();
	let routeName: string = '';
	let routeDescription: string = '';

	let routeSeedDescription: string = 'This seed will be used to generate the route';

	let routeNameClasses: string = '';
	let routeSeedClasses: string = '';

	export let data: PageData;

	export let form: ActionData;

	if (form?.RouteNameMissing) {
		routeNameClasses = 'input-error';
	}

	if (form?.routeSeedMissing) {
		routeSeedDescription = 'Seed is required. Perhaps use the example';
		routeSeedClasses = 'input-error';
	}

	if (form?.routeGenerationError) {
		routeSeedDescription = 'Invalid seed';
		routeSeedClasses = 'input-error';
	}

	const airspaces: Airspace[] = [];
	for (const airspace of data.airspaces) {
		airspaces.push(plainToInstance(Airspace, airspace as Airspace));
	}
	AirspacesStore.set(airspaces);

	const airports: Airport[] = [];
	for (const airport of data.airports) {
		airports.push(plainToInstance(Airport, airport as Airport));
	}
	AirportsStore.set(airports);

	const waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((value) => {
		waypoints.length = 0;
		for (const waypoint of value) {
			waypoints.push(waypoint);
		}
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
</script>

<div class="flex flex-col place-content-center w-full h-full">
	<div class="flex flex-col place-content-center sm:place-content-start w-full h-full">
		<div class="flex flex-col xs:pr-3 w-full h-full">
			<Map zoom={13} mode={MapMode.RoutePlan}>
				{#each airports as airport}
					{#if showAllAirports || waypoints.some((waypoint) => waypoint.referenceObjectId === airport.id)}
						<Marker
							latLng={[airport.coordinates[1], airport.coordinates[0]]}
							width={30}
							height={30}
						>
							<CirclePlusSolid color="blue" size="sm" />

							<Popup>{airport.name}</Popup>
						</Marker>
					{/if}
				{/each}

				{#each airspaces as airspace}
					{#if showAllAirspaces}
						<Polygon latLngArray={airspace.coordinates[0].map((point) => [point[1], point[0]])} />
					{/if}
				{/each}

				{#each waypoints as waypoint}
					<Marker latLng={[waypoint.location[1], waypoint.location[0]]} width={30} height={30}>
						{#if waypoint.index == 0}
							🛩️
						{:else if waypoint.index == waypoints.length - 1}
							🏁
						{:else}
							🚩
						{/if}

						<Popup>{waypoint.name}</Popup>
					</Marker>
				{/each}
			</Map>
		</div>
		<div class="flex flex-row w-full h-20">
			<div class="flex flex-row place-content-center p-4">
				<div class="flex flex-col place-content-center">
					<div class="text-sm">Distance</div>
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
</style>
