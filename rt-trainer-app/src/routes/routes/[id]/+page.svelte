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

	ClearSimulationStores();

	let routeName: string = data.userRoutes?.name ?? 'Unnamed Route';
	let routeDescription: string = data.userRoutes?.description ?? '';
	let waypoints: Waypoint[] = [];

	// Populate waypoints array and store
	if (data.userRoutes?.waypoints != undefined) {
		for (let i = 0; i < data.userRoutes?.waypoints.length; i++) {
			waypoints.push(
				plainToInstance(Waypoint, data.userRoutes?.waypoints[i] as unknown as Waypoint)
			);
		}
		WaypointsStore.set(waypoints);
	}
</script>

<div class="flex flex-col place-content-center">
	<div class="flex flex-col sm:flex-row p-3 place-content-center sm:place-content-start gap-5">
		<div class="flex flex-col px-2 sm:w-9/12 gap-2">
			<form class="flex flex-col gap-1" method="POST" action="?/updateRoute">
				<div>
					<div class="h4 p-1">Route Name</div>
					<input name="routeId" value={data.userRoutes?.id} hidden />
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

				<button class="btn variant-filled">Update Route</button>
			</form>
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
