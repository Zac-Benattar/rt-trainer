<script lang="ts">
	import { simulatorLocationStore } from '$lib/stores';
	import type { Location } from '$lib/purets/States';
	import { onMount } from 'svelte';

	export let enabled: boolean = true;
	let target: Location;
	let mounted: boolean = false;
	let marker: any;
	let zoomLevel: number = 13;
	var map: any;

	simulatorLocationStore.subscribe((value) => {
		target = value;

		if (mounted) {
			// If it's already defined, call the initializeMap function immediately
			updateMap();
		}
	});

	function loadMapScenario() {
		map = L.map('myMap').setView([target?.lat, target?.long], zoomLevel);
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 17,
			attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		// Removes any existing marker and sets new one
		marker = L.marker([target.lat, target.long]).addTo(map);
	}

	function updateMap() {
		if (!map) loadMapScenario();
		else {
			map.setView([target?.lat, target?.long], zoomLevel);

			// Removes any existing marker and sets new one
			marker = L.marker([target.lat, target.long]).addTo(map);
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

<svelte:head>
	{#if enabled}
		<link
			rel="stylesheet"
			href="https://unpkg.com/leaflet@1.9.2/dist/leaflet.css"
			integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14="
			crossorigin=""
		/>
		<script
			src="https://unpkg.com/leaflet@1.9.2/dist/leaflet.js"
			integrity="sha256-o9N1jGDZrf5tS+Ft4gbIK7mYMipq9lqpVJ91xHSyKhg="
			crossorigin=""
		></script>
	{/if}
</svelte:head>

<div class="map-container">
	<h1>Map</h1>
	{#if enabled}
		<div id="myMap" style="position: relative; width: 450px; height: 350px;" />
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
