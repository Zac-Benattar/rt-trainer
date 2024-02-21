<script lang="ts">
	import { page } from '$app/stores';
	import Map from '$lib/Components/Map.svelte';
	import { ClearSimulationStores, WaypointsStore } from '$lib/stores';
	import { generateRoute } from '$lib/ts/Scenario';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import axios from 'axios';
	import { init } from '@paralleldrive/cuid2';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import { goto } from '$app/navigation';

	const routeCUID = init({ length: 8 });

	let routeSeed: string = routeCUID();
	let routeName: string = '';
	let routeDescription: string = '';

	let routeSeedClasses: string = '';
	let routeSeedDescription: string = 'This seed will be used to generate the route';

	$: {
		ClearSimulationStores();
		generateRoute(routeSeed);
	}

	let waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((route) => {
		waypoints = route;

		if (route.length > 1) {
			routeName = route[0].name + ' to ' + route[route.length - 1].name;
		}
	});

	async function handleSaveRoute() {
		if (routeSeed === '') {
			// Set the style of the input to indicate an error
			routeSeedClasses = 'input-error';
			routeSeedDescription = 'Please enter a route seed';
			return;
		}

		if (routeName === '') {
			routeName = 'Unnamed Route';
		}

		await pushRouteToDB();

		goto('/myroutes');
	}

	async function pushRouteToDB(): Promise<void> {
		try {
			const response = await axios.post(`/api/routes`, {
				name: routeName,
				routeDescription: routeDescription,
				type: 1, // 1 = generated FRTOL route - safe for use in the simulator in its current state
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
	<div class="flex flex-col sm:flex-row p-3 place-content-center sm:place-content-start gap-5">
		<div class="flex flex-col px-2 sm:w-9/12 gap-2">
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
					class="input {routeSeedClasses}"
					name="routeSeed"
					type="text"
					placeholder={routeSeed}
					bind:value={routeSeed}
				/>
				<div class="text-sm opacity-50 p-1">{routeSeedDescription}</div>
			</div>

			<button class="btn variant-filled" on:click={handleSaveRoute}>Save Route</button>
		</div>

		<div class="flex flex-col xs:pr-3">
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
