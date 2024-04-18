<script lang="ts">
	import Map from '$lib/Components/Leaflet/Map.svelte';
	import {
		AllAirportsStore,
		AwaitingServerResponseStore,
		ClearSimulationStores,
		FilteredAirspacesStore,
		GenerationParametersStore,
		OnRouteAirspacesStore,
		RouteDistanceDisplayStore,
		RouteDistanceMetersStore,
		WaypointPointsMapStore,
		WaypointsStore
	} from '$lib/stores';
	import Waypoint, { WaypointType } from '$lib/ts/AeronauticalClasses/Waypoint';
	import { TrashBinOutline } from 'flowbite-svelte-icons';
	import { AllAirspacesStore } from '$lib/stores';
	import { plainToInstance } from 'class-transformer';
	import Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import Airport from '$lib/ts/AeronauticalClasses/Airport';
	import Marker from '$lib/Components/Leaflet/Marker.svelte';
	import Popup from '$lib/Components/Leaflet/Popup.svelte';
	import Polygon from '$lib/Components/Leaflet/Polygon.svelte';
	import { getNthPhoneticAlphabetLetter, wellesbourneMountfordCoords } from '$lib/ts/utils';
	import Polyline from '$lib/Components/Leaflet/Polyline.svelte';
	import { Icon } from 'svelte-icons-pack';
	import { BsAirplaneFill } from 'svelte-icons-pack/bs';
	import Control from '$lib/Components/Leaflet/Control.svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import type { AirportData, AirspaceData } from '$lib/ts/AeronauticalClasses/OpenAIPTypes';
	import type { GenerationParameters } from '$lib/ts/ServerClientTypes';

	ClearSimulationStores();

	let showAllAirports: boolean = true;
	let showAllAirspaces: boolean = true;

	let generationParameters: GenerationParameters = {
		seed: '',
		hasEmergency: true
	};
	GenerationParametersStore.subscribe((value) => {
		generationParameters = value;
	});

	let unnamedWaypointCount = 1;

	let draggedWaypoint: Waypoint | undefined;

	let awaitingServerResponse: boolean = false;
	AwaitingServerResponseStore.subscribe((value) => {
		awaitingServerResponse = value;
	});

	let blockingClick: boolean = false;

	async function fetchAirports() {
		const response = await axios.get('/api/airports');

		// Turn into instances of Airport class and set in store
		AllAirportsStore.set(
			response.data.map((airport: AirportData) => plainToInstance(Airport, airport as AirportData))
		);
	}

	const airports: Airport[] = [];
	AllAirportsStore.subscribe((value) => {
		airports.length = 0;
		for (const airport of value) {
			airports.push(plainToInstance(Airport, airport as Airport));
		}
	});
	if (airports.length === 0) fetchAirports();

	async function fetchAirspaces() {
		const response = await axios.get('/api/airspaces');

		// Turn into instances of Airspace class and set in store
		AllAirspacesStore.set(
			response.data.map((airspace: AirspaceData) =>
				plainToInstance(Airspace, airspace as AirspaceData)
			)
		);
	}

	const airspaces: Airspace[] = [];
	AllAirspacesStore.subscribe((value) => {
		airspaces.length = 0;
		for (const airspace of value) {
			airspaces.push(plainToInstance(Airspace, airspace as Airspace));
		}
	});
	if (airspaces.length === 0) fetchAirspaces();

	const filteredAirspaces: Airspace[] = [];
	FilteredAirspacesStore.subscribe((value) => {
		filteredAirspaces.length = 0;
		for (const airspace of value) {
			filteredAirspaces.push(plainToInstance(Airspace, airspace as Airspace));
		}
	});

	const onRouteAirspaces: Airspace[] = [];
	OnRouteAirspacesStore.subscribe((value) => {
		onRouteAirspaces.length = 0;
		for (const airspace of value) {
			onRouteAirspaces.push(plainToInstance(Airspace, airspace as Airspace));
		}
	});

	$: durationEstimate = onRouteAirports.length * 8 + onRouteAirspaces.length * 5;

	const onRouteAirports: Airport[] = [];

	let waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((value) => {
		waypoints = value;
	});

	let waypointPoints: number[][] = [];
	WaypointPointsMapStore.subscribe((value) => {
		waypointPoints = value;
	});

	let routeDistanceMeters = 0;
	RouteDistanceMetersStore.subscribe((value) => {
		routeDistanceMeters = value;
	});

	let routeDistanceDisplayValue: string = '0 nm';
	RouteDistanceDisplayStore.subscribe((value) => {
		routeDistanceDisplayValue = value;
	});

	function onMapClick(event: CustomEvent<{ latlng: { lat: number; lng: number } }>) {
		// If user is clicking on the button controls or awaiting routegen ignore map click
		if (awaitingServerResponse) return;

		if (blockingClick) {
			blockingClick = false;
			return;
		}

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

	function addAirportWaypoint(airport: Airport) {
		const waypoint = new Waypoint(
			airport.name,
			airport.coordinates,
			WaypointType.Airport,
			waypoints.length,
			airport.id
		);
		waypoints.push(waypoint);
		WaypointsStore.set(waypoints);

		onRouteAirports.push(airport);
	}

	function onWaypointDrag(e: any) {
		const waypoint = waypoints.find((waypoint) => waypoint.id === e.detail.aeroObject.id);
		draggedWaypoint = waypoint;
	}

	function onWaypointMouseUp(e: any) {
		const waypoint = waypoints.find((waypoint) => waypoint.id === e.detail.aeroObject.id);
		if (draggedWaypoint == waypoint) {
			if (waypoint) {
				waypoint.location = [
					parseFloat(e.detail.event.latlng.lng.toFixed(6)),
					parseFloat(e.detail.event.latlng.lat.toFixed(6))
				];
				WaypointsStore.set(waypoints);
			}
		}
	}

	function deleteWaypoint(waypoint: Waypoint) {
		if (waypoint.type === WaypointType.Airport) {
			onRouteAirports.splice(
				onRouteAirports.findIndex((airport) => airport.id === waypoint.referenceObjectId),
				1
			);
		}

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
			waypoint.location[1] = +parseFloat(parseFloat(lngStringElement.value).toFixed(6));
			waypoint.location[0] = +parseFloat(parseFloat(latStringElement.value).toFixed(6));
			WaypointsStore.set(waypoints);
		}
	}

	function onPracticeClick() {
		blockingClick = true;

		// Check for route validity, then redirect to scenario page with the scenario data in the URL
		// May need to look into URL shortening for this, which would basically be a lookup table of scenario data
		// and a short URL that redirects to the full URL/fetches the scenario data if using own DB/key-value store

		// Check for at least 2 waypoints
		if (waypoints.length < 2) {
			alert('Please add at least 2 waypoints to create a scenario.');
			return;
		}

		// Check for no more than 2 airports
		if (onRouteAirports.length > 2) {
			alert(
				'Please add no more than 2 airports to create a scenario. More airports are not yet supported.'
			);
			return;
		}

		// Ensure airports are at the start or end of the route
		if (onRouteAirports.length > 0) {
			if (
				waypoints[0].type !== WaypointType.Airport &&
				waypoints[waypoints.length - 1].type !== WaypointType.Airport
			) {
				alert(
					'Please ensure airports are at the start or end of the route. Airports at other points of the route are not yet supported.'
				);
				return;
			}
		}

		const scenarioURLString: string =
			'/simulator/seed=' +
			generationParameters.seed +
			'&hasEmergency=' +
			generationParameters.hasEmergency +
			'&waypoints=' +
			JSON.stringify(waypoints) +
			'&airports=' +
			JSON.stringify(onRouteAirports);

		goto(scenarioURLString);
	}
</script>

<div class="flex flex-col place-content-center w-full h-full">
	<div class="flex flex-col place-content-center sm:place-content-start w-full h-full">
		<div class="flex flex-col xs:pr-3 w-full h-full">
			<Map view={wellesbourneMountfordCoords} zoom={9} on:click={onMapClick}>
				<Control position="topleft">
					<div>
						<button
							class="btn text-black bg-white border-2 border-neutral-800/30 text-sm"
							on:click={onPracticeClick}>Practice</button
						>
					</div>
				</Control>

				{#each airports as airport}
					{#if showAllAirports || waypoints.some((waypoint) => waypoint.referenceObjectId === airport.id)}
						<Marker
							latLng={[airport.coordinates[1], airport.coordinates[0]]}
							width={30}
							height={30}
							aeroObject={airport}
							draggable={false}
							on:click={(e) => {
								e.preventDefault();
								addAirportWaypoint(e.detail.aeroObject);
							}}
							on:mouseover={(e) => {
								e.detail.marker.openPopup();
							}}
							on:mouseout={(e) => {
								e.detail.marker.closePopup();
							}}
						>
							{#if !waypoints.some((waypoint) => waypoint.referenceObjectId === airport.id)}
								<Icon src={BsAirplaneFill} color="black" size="16" />
							{/if}

							<Popup><div>{airport.name}</div></Popup>
						</Marker>
					{/if}
				{/each}

				{#each filteredAirspaces as airspace}
					{#if showAllAirspaces}
						{#if airspace.type == 14}
							<Polygon
								latLngArray={airspace.coordinates[0].map((point) => [point[1], point[0]])}
								color={'red'}
								fillOpacity={0.2}
								weight={1}
								aeroObject={airspace}
								on:click={(e) => {
									e.preventDefault();
									addWaypoint(
										+parseFloat(e.detail.event.latlng.lat.toFixed(6)),
										+parseFloat(e.detail.event.latlng.lng.toFixed(6))
									);
								}}
								on:mouseover={(e) => {
									e.detail.polygon.openPopup();
								}}
								on:mouseout={(e) => {
									e.detail.polygon.closePopup();
								}}
							>
								<Popup>
									<div>{airspace.name} MATZ</div>
								</Popup>
							</Polygon>
						{:else}
							<Polygon
								latLngArray={airspace.coordinates[0].map((point) => [point[1], point[0]])}
								color={'blue'}
								fillOpacity={0.2}
								weight={1}
								aeroObject={airspace}
								on:click={(e) => {
									e.preventDefault();
									addWaypoint(
										+parseFloat(e.detail.event.latlng.lat.toFixed(6)),
										+parseFloat(e.detail.event.latlng.lng.toFixed(6))
									);
								}}
								on:mouseover={(e) => {
									e.detail.polygon.openPopup();
								}}
								on:mouseout={(e) => {
									e.detail.polygon.closePopup();
								}}
							>
								<Popup>
									<div>{airspace.name}</div>
								</Popup></Polygon
							>
						{/if}
					{/if}
				{/each}

				{#each waypoints as waypoint (waypoint.index)}
					{#key waypoint.id}
						{#key waypoint.location}
							{#if waypoint.type == WaypointType.Airport}<Marker
									latLng={[waypoint.location[1], waypoint.location[0]]}
									width={50}
									height={50}
									aeroObject={waypoint}
								>
									{#if waypoint.index == waypoints.length - 1}
										<div class="text-2xl">🏁</div>
									{:else}
										<div class="text-2xl">🛫</div>
									{/if}

									<Popup
										><div class="flex flex-col gap-2">
											<div class="flex flex-col gap-2">
												<div id="waypoint-{waypoint.id}-name">{waypoint.name}</div>
												<div id="waypoint-{waypoint.id}-lat">{waypoint.location[0]}</div>
												<div id="waypoint-{waypoint.id}-lng">{waypoint.location[1]}</div>
											</div>

											<button class="btn variant-filled" on:click={() => deleteWaypoint(waypoint)}
												><div class="grid grid-cols-4 gap-2 w-full">
													<div class="col-span-1 col-start-1"><TrashBinOutline /></div>
													<div class="col-span-3 col-start-2">Delete</div>
												</div></button
											>
										</div></Popup
									>
								</Marker>{:else}
								<Marker
									latLng={[waypoint.location[1], waypoint.location[0]]}
									width={50}
									height={50}
									aeroObject={waypoint}
									on:drag={onWaypointDrag}
									on:mouseup={onWaypointMouseUp}
									draggable={true}
								>
									{#if waypoint.index == waypoints.length - 1}
										<div class="text-2xl">🏁</div>
									{:else}
										<div class="text-2xl">🚩</div>
									{/if}

									<Popup
										><div class="flex flex-col gap-2">
											<textarea id="waypoint-{waypoint.id}-name" class="textarea" rows="1"
												>{waypoint.name}</textarea
											><textarea id="waypoint-{waypoint.id}-lat" class="textarea" rows="1"
												>{waypoint.location[0]}</textarea
											><textarea id="waypoint-{waypoint.id}-lng" class="textarea" rows="1"
												>{waypoint.location[1]}</textarea
											>
											<button class="btn varient-filled" on:click={() => saveWaypointEdit(waypoint)}
												>Save</button
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
							{/if}
						{/key}
					{/key}
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
			<div class="vr h-full border border-surface-800" />
			<div class="flex flex-row place-content-center p-4">
				<div class="flex flex-col place-content-center">
					<div class="text-sm">Est. Distance</div>
					<div class="text-xl">
						{routeDistanceDisplayValue}
					</div>
				</div>
			</div>
			<div class="vr h-full border border-surface-800" />
			<div class="flex flex-row place-content-center p-4">
				<div class="flex flex-col place-content-center">
					<div class="text-sm">Unique Airspaces</div>
					<div class="text-xl">
						{onRouteAirspaces.length}
					</div>
				</div>
			</div>
			<div class="vr h-full border border-surface-800" />
			<div class="flex flex-row place-content-center p-4">
				<div class="flex flex-col place-content-center">
					<div class="text-sm">Est. Scenario Duration</div>
					<div class="text-xl">
						{durationEstimate} mins
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
