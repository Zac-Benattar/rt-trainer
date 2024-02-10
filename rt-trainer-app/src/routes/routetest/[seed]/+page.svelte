<script lang="ts">
	import Map from "$lib/Components/Simulator/Map.svelte";
	import { ClearSimulationStores, OpenAIPHealthStore, RouteStore, WaypointsStore } from "$lib/stores";
	import { initiateRouteV2 } from "$lib/ts/Route";
	import type { Waypoint } from "$lib/ts/RouteTypes";

	ClearSimulationStores();

	initiateRouteV2();

	// Testing
	// setInterval(initiateRouteV2, 10000);

	// // Don't keep in actual route gen code/simulator, just do a single check
	// setInterval(checkSystemHealth, 10000);

	let openAIPHealth: string = "Unknown";

	OpenAIPHealthStore.subscribe((health) => {
		openAIPHealth = health;
	});

	let waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((route) => {
		waypoints = route;
	});

</script>

<div>OpenAIP Status: {openAIPHealth}</div>
<div>Route Test: {waypoints}</div>
<Map enabled={true} widthSmScreen={"w-full"} heightSmScreen={"800px"} initialZoomLevel={8}/>
