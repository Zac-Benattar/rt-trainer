<script>
	import Map from "$lib/Components/Simulator/Map.svelte";
	import { ClearSimulationStores } from "$lib/stores";
	import { initiateScenario } from "$lib/ts/Route";

	ClearSimulationStores();

	initiateScenario();
</script>


<Map enabled={true} widthSmScreen={"w-full"} heightSmScreen={"800px"} initialZoomLevel={8}/>
