<script lang="ts">
	import { page } from '$app/stores';
	import Map from '$lib/Components/Map.svelte';
	import { ClearSimulationStores, GenerationParametersStore, WaypointsStore } from '$lib/stores';
	import { generateRoute } from '$lib/ts/Route';
	import Seed from '$lib/ts/Seed';
	import type { Waypoint } from '$lib/ts/AeronauticalClasses/Waypoint';
	import axios from 'axios';

	import { init } from '@paralleldrive/cuid2';
	import { MapMode } from '$lib/ts/SimulatorTypes';

	const routeCUID = init({ length: 8 });

	let routeSeed: string = routeCUID();
	let routeName: string = '';
	let routeDescription: string = '';
	let seed: Seed = new Seed(routeSeed);

	$: {
		seed = new Seed(routeSeed);
		ClearSimulationStores();
		GenerationParametersStore.set({ seed, hasEmergency: true });
		generateRoute();
	}

	let waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((route) => {
		waypoints = route;
	});

	async function pushRouteToDB(): Promise<void> {
		try {
			const response = await axios.post(`/api/routes`, {
				name: routeName ? routeName : 'Unnamed Route',
				routeDescription: routeDescription,
				createdBy: $page.data.userId,
				waypointsObject: waypoints
			});

			if (response === undefined) {
				console.log('Failed to push route to DB');
			} else {
				if (response.data.result) console.log('Route pushed to DB');
				else {
					console.log('Failed to push route to DB');
					console.log(response.data.error);
				}
			}
		} catch (error: unknown) {
			if (error.message === 'Network Error') {
				console.log('Failed to push route to DB');
			} else {
				console.log('Error: ', error);
			}
		}
	}
</script>

<div class="flex flex-col place-content-center">
	<div class="flex flex-row p-3 place-content-center sm:place-content-start gap-5">
		<div class="flex flex-col px-2 xs:w-9/12 gap-2">
			<div class="h3 p-1">Generate a route</div>

			<div>
				<div class="h4 p-1">Route Name</div>
				<input
					class="input"
					name="routeName"
					type="text"
					placeholder="My route"
					bind:value={routeName}
				/>
				<div class="text-sm opacity-50 p-1">
					A memorable name such as "Dundee to Fife via Leuchars MATZ"
				</div>
			</div>

			<div>
				<div class="h4 p-1">Description</div>
				<textarea
					class="textarea"
					rows="4"
					name="routeDescription"
					placeholder="Take off from Dundee then left-hand turn over the Tay..."
					bind:value={routeDescription}
				/>
			</div>

			<div>
				<div class="h4 p-1">Route Seed</div>
				<input
					class="input"
					name="routeSeed"
					type="text"
					placeholder={routeSeed}
					bind:value={routeSeed}
				/>
				<div class="text-sm opacity-50 p-1">This seed will be used to generate the route</div>
			</div>

			<button class="btn variant-filled" on:click={pushRouteToDB}>Save Route</button>
		</div>

		<Map enabled={true} widthSmScreen={'600px'} heightSmScreen={'500px'} mode={MapMode.RoutePlan} />
	</div>
</div>
