<script lang="ts">
	import { page } from '$app/stores';
	import Map from '$lib/Components/Map.svelte';
	import { AwaitingServerResponseStore, ClearSimulationStores, WaypointsStore } from '$lib/stores';
	import Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import axios from 'axios';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import type { PageData } from './$types';
	import { plainToInstance } from 'class-transformer';

	export let data: PageData;

	let routeName: string = data.userRoutes?.name ?? 'Unnamed Route';
	let routeDescription: string = data.userRoutes?.description ?? '';
	let waypoints: Waypoint[] = [];

    // Populate waypoints arrya and store
	if (data.userRoutes?.waypoints != undefined) {
		for (let i = 0; i < data.userRoutes?.waypoints.length; i++) {
			waypoints.push(
				plainToInstance(Waypoint, data.userRoutes?.waypoints[i] as unknown as Waypoint)
			);
		}
		WaypointsStore.set(waypoints);
	}

	async function handleSaveRoute() {
		if (routeName === '') {
			routeName = 'Unnamed Route';
		}

		await updateRouteInDB();
	}

	async function updateRouteInDB(): Promise<void> {
		try {
			const response = await axios.patch(`/api/routes`, {
				name: routeName,
				routeDescription: routeDescription,
				type: 1, // 1 = generated FRTOL route - safe for use in the simulator in its current state
				createdBy: $page.data.userId,
				waypointsObject: waypoints
			});

			if (response === undefined) {
				console.log('Failed to push route to DB');
			} else {
				if (response.data.result) console.log('Route updated in DB');
				else {
					console.log('Failed to update route in DB');
					console.log(response.data.error);
				}
			}
		} catch (error: unknown) {
			console.log('Error: ', error);
		}
	}
</script>

<div class="flex flex-col place-content-center">
	<div class="flex flex-col sm:flex-row p-3 place-content-center sm:place-content-start gap-5">
		<div class="flex flex-col px-2 sm:w-9/12 gap-2">
			<div>
				<div class="h4 p-1">Route Name</div>
				<input
					class="input"
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

			<button class="btn variant-filled" on:click={handleSaveRoute} disabled>Update Route</button>
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
