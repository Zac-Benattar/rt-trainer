<script lang="ts">
	import { ListBox, ListBoxItem, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { init } from '@paralleldrive/cuid2';
	import {
		RefreshOutline,
		WandMagicSparklesOutline,
		DotsHorizontalOutline
	} from 'flowbite-svelte-icons';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import {
		AllAirportsStore,
		AllAirspacesStore,
		AwaitingServerResponseStore,
		ClearSimulationStores,
		HasEmergencyEventsStore,
		maxFlightLevelStore,
		RouteDistanceDisplayUnitStore,
		ScenarioSeedStore,
		WaypointsStore
	} from '$lib/stores';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import { flip } from 'svelte/animate';
	import { loadRouteData } from '$lib/ts/Scenario';
	import { generateFRTOLRouteFromSeed } from '$lib/ts/RouteGeneration';
	import type Airport from '$lib/ts/AeronauticalClasses/Airport';
	import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';

	ClearSimulationStores();

	// Random seed generation function
	const shortCUID = init({ length: 8 });

	// Scenario data
	let scenarioSeed: string = shortCUID();
	ScenarioSeedStore.set(scenarioSeed); // Set initial value
	let hasEmergencyEvents: boolean = true;
	HasEmergencyEventsStore.set(hasEmergencyEvents); // Set initial value

	// Route data
	let routeSeed: string = ''; // Only used for seeding the route generator
	let waypoints: Waypoint[] = []; // Stores all the waypoints in the route

	// Aeronautical data
	let airports: Airport[] = [];
	let airspaces: Airspace[] = [];

	// Route preferences
	let distanceUnit: string = 'Nautical Miles';
	let maxFL: number = 30;

	// Blocking new inputs during route generation
	let awaitingServerResponse: boolean = false;
	AwaitingServerResponseStore.subscribe((value) => {
		awaitingServerResponse = value;
	});

	$: {
		if (routeSeed !== '') {
			loadSeededRoute();
		}
	}

	$: ScenarioSeedStore.set(scenarioSeed);

	$: HasEmergencyEventsStore.set(hasEmergencyEvents);

	$: RouteDistanceDisplayUnitStore.set(distanceUnit);

	$: {
		maxFL = Math.max(15, maxFL);
		maxFlightLevelStore.set(maxFL);
	}

	WaypointsStore.subscribe((value) => {
		waypoints = value;
	});

	AllAirportsStore.subscribe((value) => {
		airports = value;
	});

	AllAirspacesStore.subscribe((value) => {
		airspaces = value;
	});

	const distanceUnitsPopupCombobox: PopupSettings = {
		event: 'click',
		target: 'distance-unit-popup',
		placement: 'bottom',
		closeQuery: '.listbox-item'
	};

	async function loadSeededRoute() {
		AwaitingServerResponseStore.set(true);
		const routeData = await generateFRTOLRouteFromSeed(
			routeSeed,
			airports,
			airspaces,
			maxFL
		);
		if (routeData) loadRouteData(routeData);
		AwaitingServerResponseStore.set(false);
	}

	const dragDuration: number = 200;
	let draggingWaypoint: Waypoint | undefined = undefined;
	let animatingWaypoints = new Set();

	function swapWith(waypoint: Waypoint): void {
		if (draggingWaypoint === waypoint || animatingWaypoints.has(waypoint)) return;
		animatingWaypoints.add(waypoint);
		setTimeout((): boolean => animatingWaypoints.delete(waypoint), dragDuration);
		const cardAIndex = waypoints.indexOf(draggingWaypoint);
		const cardBIndex = waypoints.indexOf(waypoint);
		waypoints[cardAIndex] = waypoint;
		waypoints[cardBIndex] = draggingWaypoint;
		waypoints.forEach((waypoint, index) => {
			waypoint.index = index;
		});
		WaypointsStore.set(waypoints);
	}
</script>

<div class="sidebar-container flex flex-col grow py-0 gap-1 overflow-clip">
	<div class="flex flex-col sticky top-0 p-3 bg-surface-900 z-50">
		<div class="flex flex-row ml-[-14px]">
			<strong><a href="/" class="btn text-xl sm:text-2xl uppercase">RT Trainer</a></strong>
		</div>

		<div class="flex flex-row mt-[-10px] ml-[6px] pb-2 pb-4">
			<ol class="flex flex-row gap-2">
				<li class="crumb"><a class="anchor" href="/">Home</a></li>
				<li class="crumb-separator" aria-hidden>/</li>
				<li class="">Scenario Planner</li>
			</ol>
		</div>

		<hr />
	</div>

	<div
		class="snap-y scroll-py-4 snap-mandatory scroll-smooth sidebar-contents-container overflow-auto px-3 pb-2"
	>
		<div class="flex flex-col gap-2 p-2">
			<div><strong>Route Waypoints</strong></div>
			{#if waypoints.length == 0}
				<div class="px-1">
					<p class="text-slate-600 text-sm">
						Add a waypoint by clicking on an airport or any other spot on the map. Or use the <b
							>Auto-generate</b
						> Tool below.
					</p>
				</div>
			{/if}
			<!-- for some reason the key (waypoint.index) has duplicates when coming from the route generator -->
			{#each waypoints as waypoint (waypoint.index)}
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="card p-2 flex flex-row gap-2 place-content-center"
					draggable="true"
					animate:flip={{ duration: dragDuration }}
					on:dragstart={() => {
						draggingWaypoint = waypoint;
					}}
					on:dragend={() => {
						draggingWaypoint = undefined;
					}}
					on:dragenter={() => {
						swapWith(waypoint);
					}}
					on:dragover={(e) => {
						e.preventDefault();
					}}
				>
					<div class="flex flex-col place-content-center">
						{#if waypoint.index == 0}
							🛩️{:else if waypoint.index == waypoints.length - 1}🏁{:else}🚩{/if}
					</div>
					<div class="flex flex-col place-content-center">
						<textarea class="textarea" rows="1" placeholder={waypoint.name} />
					</div>
					<button
						class="flex flex-col place-content-center"
						use:popup={{
							event: 'click',
							target: waypoint.name + '-waypoint-details-popup',
							placement: 'bottom'
						}}><DotsHorizontalOutline /></button
					>

					<div
						id={waypoint.name + '-waypoint-details-popup'}
						class="card p-4 w-auto shadow-xl z-50"
						data-popup={waypoint.name + '-waypoint-details-popup'}
					>
						<div>
							<button
								on:click={() => {
									WaypointsStore.update((waypoints) => {
										waypoints = waypoints.filter((w) => w.id !== waypoint.id);
										waypoints.forEach((waypoint, index) => {
											waypoint.index = index;
										});
										return waypoints;
									});
								}}>Delete</button
							>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="flex flex-col gap-2 p-2">
			<div>
				<strong>Scenario Settings</strong>
			</div>
			<div class="flex flex-col gap-1">
				<div class="label text-sm">Scenario Seed</div>
				<div class="flex flex-row gap-2">
					<textarea
						id="scenario-seed-input"
						class="textarea"
						rows="1"
						maxlength="20"
						placeholder="Enter a seed"
						bind:value={scenarioSeed}
					/>
					<button
						type="button"
						class="btn variant-filled w-10"
						on:click={() => {
							if (awaitingServerResponse) return;

							scenarioSeed = shortCUID();

							const element = document.getElementById('scenario-seed-input');
							if (element) {
								element.value = routeSeed;
							}
						}}><RefreshOutline /></button
					>
				</div>
			</div>

			<label class="flex items-center space-x-2">
				<input
					id="emergency-events-checkbox"
					class="checkbox"
					type="checkbox"
					checked
					on:change={() => (hasEmergencyEvents = !hasEmergencyEvents)}
				/>
				<p>Emergency Events</p>
			</label>
		</div>

		<div class="flex flex-col gap-2 p-2">
			<div>
				<strong>Preferences</strong>
			</div>
			<div>
				<div class="flex flex-col gap-1">
					<div class="label text-sm">Distance Units</div>
					<button
						class="btn textarea w-full justify-between"
						use:popup={distanceUnitsPopupCombobox}
					>
						<span class="ml-[-6px]">{distanceUnit ?? 'Distance Unit'}</span>
						<span>↓</span>
					</button>
				</div>

				<div class="card shadow-xl w-[250px] py-2" data-popup="distance-unit-popup">
					<ListBox rounded="rounded-none">
						<ListBoxItem bind:group={distanceUnit} name="medium" value="Nautical Miles"
							>Nautical Miles</ListBoxItem
						>
						<ListBoxItem bind:group={distanceUnit} name="medium" value="Miles">Miles</ListBoxItem>
						<ListBoxItem bind:group={distanceUnit} name="medium" value="Kilometers"
							>Kilometers</ListBoxItem
						>
					</ListBox>
					<div class="arrow bg-surface-100-800-token" />
				</div>
			</div>

			<div class="flex flex-col gap-1">
				<div class="label text-sm">Maximum Flight Level (100 ft)</div>
				<textarea id="fl-input" class="textarea" rows="1" maxlength="4" bind:value={maxFL} />
			</div>
		</div>

		<div class="flex flex-col gap-2 p-2">
			<div>
				<strong>Tools</strong>
			</div>

			<Accordion>
				<AccordionItem>
					<svelte:fragment slot="lead"><WandMagicSparklesOutline /></svelte:fragment>
					<svelte:fragment slot="summary">Auto-generate Route</svelte:fragment>
					<svelte:fragment slot="content"
						><div class="flex flex-col gap-2">
							<div class="label">Route Seed</div>
							<div class="flex flex-row gap-2">
								<textarea
									id="route-seed-input"
									class="textarea"
									rows="1"
									maxlength="20"
									placeholder="Enter a seed"
									bind:value={routeSeed}
								/>
								<button
									type="button"
									class="btn variant-filled w-10"
									on:click={() => {
										if (awaitingServerResponse) return;

										routeSeed = shortCUID();

										const element = document.getElementById('route-seed-input');
										if (element) {
											element.value = routeSeed;
										}
									}}><RefreshOutline /></button
								>
							</div>
						</div></svelte:fragment
					>
				</AccordionItem>
			</Accordion>
		</div>
	</div>
</div>

<style lang="postcss">
	textarea {
		resize: none;
	}
</style>
