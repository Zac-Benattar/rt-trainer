<script lang="ts">
	import Map from "$lib/Components/Simulator/Map.svelte";
	import { ClearSimulationStores, OpenAIPHealthStore } from "$lib/stores";
	import { checkSystemHealth } from "$lib/ts/OpenAIPHandler";
	import { initiateScenario } from "$lib/ts/Route";

	ClearSimulationStores();

	initiateScenario();

	// Don't keep in actual route gen code/simulator, just do a single check
	setInterval(checkSystemHealth, 10000);

	let openAIPHealth: string = "Unknown";

	OpenAIPHealthStore.subscribe((health) => {
		openAIPHealth = health;
	});

</script>

<div>OpenAIP Status: {openAIPHealth}</div>
<Map enabled={true} widthSmScreen={"w-full"} heightSmScreen={"800px"} initialZoomLevel={8}/>
