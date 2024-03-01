<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import Map from '$lib/Components/Map.svelte';
	import { GlobeOutline, EditOutline } from 'flowbite-svelte-icons';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { init } from '@paralleldrive/cuid2';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import axios from 'axios';
	import {
		AirspacesStore,
		AwaitingServerResponseStore,
		ClearSimulationStores,
		NullRouteStore,
		WaypointsStore
	} from '$lib/stores';
	import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import { plainToInstance } from 'class-transformer';
	import Airspace from '$lib/ts/AeronauticalClasses/Airspace';

	const scenarioSeedCUID = init({ length: 6 });

	let selectedRouteId: string = '';
	let scenarioSeed: string = scenarioSeedCUID();
	let emergency: boolean = true;

	let routesClass: string = '';

	ClearSimulationStores();

	export let data: PageData;
	export let form: ActionData;

	if (form?.missing) {
		routesClass = 'input-error';
	} else {
		routesClass = '';
	}

	async function handleRouteIdChange(event: Event) {
		selectedRouteId = (event.target as HTMLInputElement).value;
		loadRoute(selectedRouteId);
	}

	async function loadRoute(routeId: string) {
		AwaitingServerResponseStore.set(true);

		try {
			const response = await axios.get(`/api/routes/${routeId}`);
			console.log(response);

			if (response === undefined) {
				console.log('Failed to load route from DB');
			} else {
				const waypoints: Waypoint[] = [];
				for (const waypoint of response.data.waypoints) {
					waypoints.push(plainToInstance(Waypoint, waypoint as Waypoint));
				}

				const airspaces: Airspace[] = [];
				for (const airspace of response.data.airspaces) {
					airspaces.push(plainToInstance(Airspace, airspace as Airspace));
				}

				WaypointsStore.set(waypoints);
				AirspacesStore.set(airspaces);
				AwaitingServerResponseStore.set(false);
				NullRouteStore.set(false);
			}
		} catch (error: unknown) {
			console.log('Error: ', error);
		}
	}
</script>

<!-- Put a map on the right so the route can be previewed - maybe show where the emergency will be and other info -->
<div class="flex flex-col place-content-center">
	<div class="flex flex-col sm:flex-row p-3 place-content-center sm:place-content-start gap-5">
		{#if form?.notFound}<p class="error">Route not found</p>{/if}
		<div class="flex flex-col px-2 sm:w-9/12 gap-2">
			<div class="h3 p-1">Create a scenario</div>

			<form class="flex flex-col gap-1" method="POST" action="?/createScenario">
				<div>
					<div class="h4 p-1">Scenario Name</div>
					<input class="input" name="scenarioName" type="text" placeholder="My scenario" />
					<div class="text-sm opacity-50 p-1">
						A memorable name such as "Dundee to Fife via Leuchars MATZ"
					</div>
				</div>

				<div>
					<div class="h4 p-1">Description</div>
					<textarea
						class="textarea"
						rows="4"
						name="scenarioDescription"
						placeholder="Take off from Dundee then left-hand turn over the Tay..."
					/>
				</div>

				<span class="h4 p-1">Route</span>
				<div>
					<span class="h5 p-1">Your Routes</span>

					<ListBox class="card {routesClass}">
						{#each data.userRecentRoutes as route}
							<ListBoxItem
								bind:group={selectedRouteId}
								name="routeId"
								value={route.id}
								on:click={handleRouteIdChange}
							>
								<svelte:fragment slot="lead">
									<span class="badge-icon p-4 variant-soft-secondary">
										<GlobeOutline />
									</span>
								</svelte:fragment>
								<div class="flex flex-row gap-2">
									<div class="flex-col place-content-center">
										<dt class="font-bold">{route.name}</dt>
										{#if route.description == null}
											<div class="text-sm opacity-50">No description</div>
										{:else if route.description.length > 200}
											<div class="text-sm opacity-50">
												{route.description?.substring(0, 200)}...
											</div>
										{:else}
											<div class="text-sm opacity-50">
												{route.description?.substring(0, 200)}
											</div>
										{/if}
									</div>
								</div>

								<svelte:fragment slot="trail">
									<button on:click={() => goto(`/routes/${route.id}`)}><EditOutline /></button>
								</svelte:fragment>
							</ListBoxItem>
						{/each}
					</ListBox>
					{#if form?.missing}<p class="error text-sm text-red-500 p-1">
							Please select a route for the scenario
						</p>{/if}
				</div>

				<div>
					<div class="h4 p-1">Scenario Seed</div>
					<input class="input" name="scenarioSeed" type="text" placeholder={scenarioSeed} />
					<div class="text-sm opacity-50 p-1">
						This seed will be used to generate the weather conditions, choose runways, determine
						where the emergency event is if enabled, and affect other variables.
					</div>
				</div>

				<div>
					<label class="flex items-center space-x-2 mb-3">
						<input class="checkbox" type="checkbox" name="hasEmergency" checked={emergency} />
						<p>Include Emergency</p>
					</label>
				</div>

				<button class="btn variant-filled">Create Scenario</button>
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
