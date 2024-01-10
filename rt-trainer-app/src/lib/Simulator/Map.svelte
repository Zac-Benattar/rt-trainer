<script lang="ts">
	/* This file is not correctly typed due to the way SvelteKit builds its production
	bundle and how Leaflet depends on the window object. Read more here about the issue 
	and solution in the blog post by Stanislav Khromov below.
	https://khromov.se/using-leaflet-with-sveltekit/ */

	import { simulatorPoseStore } from '$lib/stores';
	import type { Pose } from '$lib/purets/States';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let enabled: boolean = true;
	let leaflet: any;
	let rotated_marker: any;
	let targetPose: Pose;
	let mounted: boolean = false;
	let currentLocationMarker: any;
	let markers: any[] = [];
	let zoomLevel: number = 13;
	let map: any;
	let planeIcon: any;

	simulatorPoseStore.subscribe((value) => {
		targetPose = value;

		if (mounted) {
			updateMap();
		}
	});

	function loadMapScenario() {
		map = L.map('myMap').setView([targetPose?.location.lat, targetPose?.location.long], zoomLevel);

		planeIcon = L.icon({
			iconUrl: '/images/plane.png',

			iconSize: [40, 40], // size of the icon
			iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor: [20, 20] // point from which the popup should open relative to the iconAnchor
		});

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 17,
			attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		// Removes any existing marker and sets new one
		currentLocationMarker = L.marker([targetPose.location.lat, targetPose.location.long], {
			icon: planeIcon,
			rotationAngle: targetPose.heading,
			rotationOrigin: 'center'
		}).addTo(map);
	}

	function updateMap() {
		if (!map) loadMapScenario();
		else {
			map.setView([targetPose?.location.lat, targetPose?.location.long], zoomLevel);

			// Removes any existing marker and sets new one
			currentLocationMarker = L.marker([targetPose.location.lat, targetPose.location.long], {
				icon: planeIcon,
				rotationAngle: targetPose.heading,
				rotationOrigin: 'center'
			}).addTo(map);
		}
	}

	function addMarker(lat: number, long: number, name: string) {
		markers.push(L.marker([lat, long]).bindPopup(name).addTo(map));
	}

	function removeMarkers() {
		markers.forEach((marker) => {
			map.removeLayer(marker);
		});
		markers = [];
	}

	function connectMarkers() {
		if (markers.length > 1) {
			for (let i = 0; i < markers.length - 1; i++) {
				L.polyline([markers[i].getLatLng(), markers[i + 1].getLatLng()], {
					color: 'red',
					weight: 3,
					opacity: 0.5,
					smoothFactor: 1
				}).addTo(map);
			}
		}
	}

	function clearMap() {
		removeMarkers();
		connectMarkers();
	}

	onMount(async () => {
		if (enabled && browser) {
			mounted = true;

			leaflet = await import('leaflet');
			rotated_marker = await import('leaflet-rotatedmarker');

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
	{/if}
</svelte:head>

<div class="map-container">
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
		height: 100%;
		min-width: 490px;
		min-height: 390px;
		background-color: #fff;
		padding: 20px;
		outline: solid 1px #ccc;
		border-radius: 5px;
		color: black;
	}
</style>
