<script lang="ts">
	import { simulatorLocationStore } from '$lib/stores';
	import type { Location } from '$lib/purets/States';
	import { onMount } from 'svelte';

	export let enabled: boolean = true;
	let target: Location;
	let mounted: boolean = false;
	var map: any;

	simulatorLocationStore.subscribe((value) => {
		target = value;

		if (mounted) {
			// If it's already defined, call the initializeMap function immediately
			updateMap();
		}
	});

	function loadMapScenario() {
		console.log(target);
		// map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
		// 	credentials: BING_MAPS_API_KEY,
		// 	center: new Microsoft.Maps.Location(target?.lat, target?.long),
		// 	zoom: 12
		// });

		map = L.map('myMap').setView([target?.lat, target?.long], 13);
	}

	function updateMap() {
		if (!map) loadMapScenario();
		else {
			map.setView([target?.lat, target?.long], 13);
		}
	}

	onMount(() => {
		mounted = true;

		if (enabled && !map && target) {
			// // await microsoft loading then call loadMapScenario
			// const script = document.createElement('script');
			// script.type = 'text/javascript';
			// script.src = `https://www.bing.com/api/maps/mapcontrol?key=${BING_MAPS_API_KEY}`;

			// script.onload = () => {
			// 	loadMapScenario();
			// };

			loadMapScenario();
		}
	});
</script>

<reference path="types/MicrosoftMaps/Microsoft.Maps.All.d.ts" />

<svelte:head>
	{#if enabled}
	<script src="https://unpkg.com/leaflet@1.9.2/dist/leaflet.js"
	integrity="sha256-o9N1jGDZrf5tS+Ft4gbIK7mYMipq9lqpVJ91xHSyKhg="
	crossorigin=""></script>
	{/if}
</svelte:head>

<div class="map-container">
	<h1>Map</h1>
	{#if enabled}
		<div id="myMap" style="position: relative; width: 100%; height: 100%;" />
	{/if}
	{#if !enabled}
		<p>Map is disabled</p>
	{/if}
</div>

<style lang="postcss">
	.map-container {
		position: relative;
		width: 100%;
		min-width: 490px;
		min-height: 390px;
		background-color: #fff;
		padding: 20px;
		outline: solid 1px #ccc;
		border-radius: 5px;
		color: black;
	}
</style>
