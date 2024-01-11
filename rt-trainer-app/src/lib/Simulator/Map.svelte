<script lang="ts">
	/* This file is not correctly typed due to the way SvelteKit builds its production
	bundle and how Leaflet depends on the window object. This presented issues with loading
	leaflet but the compromise is to not import Leaflet with an import statement at the 
	top of the file. Read more here about the issue and solution in the blog post by 
	Stanislav Khromov below.
	https://khromov.se/using-leaflet-with-sveltekit/ */

	import { PoseStore, RouteStore } from '$lib/stores';
	import type { Pose, Waypoint } from '$lib/ts/States';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let enabled: boolean = true;
	let leaflet: any;
	let rotated_marker: any;
	let targetPose: Pose;
	let mounted: boolean = false;
	let currentLocationMarker: any;
	let waypoints: Waypoint[] = [];
	let markers: any[] = [];
	let zoomLevel: number = 13;
	let map: any;
	let planeIcon: any;
	let flightInformationOverlay: HTMLDivElement;
	let FlightInformationTextBox: any;

	PoseStore.subscribe((value) => {
		targetPose = value;

		if (mounted) {
			updateMap();
		}
	});

	RouteStore.subscribe((value) => {
		waypoints = value;

		if (mounted) {
			updateMap();
		}
	});

	async function loadMapScenario() {
		FlightInformationTextBox = L.Control.extend({
			onAdd: function () {
				var text = L.DomUtil.create('div');
				text.id = 'heading_text';
				text.className = 'h6 px-2 py-1 rounded border-1 border-solid border-black';
				text.style.color = 'black';
				text.style.backgroundColor = 'white';
				text.innerHTML =
					'<p> Heading: ' +
					targetPose.heading +
					'<br> Altitude: ' +
					targetPose.altitude +
					'<br> Airspeed: ' +
					targetPose.airspeed +
					'</p>';
				return text;
			}
		});

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

		// Adds all waypoints to the map
		waypoints.forEach((waypoint) => {
			addMarker(waypoint.location.lat, waypoint.location.long, waypoint.name);
		});

		connectMarkers();

		// Sets the current location marker, done last to make sure it is on top
		currentLocationMarker = L.marker([targetPose.location.lat, targetPose.location.long], {
			icon: planeIcon,
			rotationAngle: targetPose.heading,
			rotationOrigin: 'center'
		}).addTo(map);

		flightInformationOverlay = new FlightInformationTextBox({ position: 'topright' }).addTo(map);
	}

	async function updateMap() {
		if (mounted) {
			await map;

			map.setView([targetPose?.location.lat, targetPose?.location.long], zoomLevel);

			removeMarkers();

			// Adds all waypoints to the map
			waypoints.forEach((waypoint) => {
				addMarker(waypoint.location.lat, waypoint.location.long, waypoint.name);
			});

			connectMarkers();

			// Updates the current location marker, done last to make sure it is on top
			currentLocationMarker = L.marker([targetPose.location.lat, targetPose.location.long], {
				icon: planeIcon,
				rotationAngle: targetPose.heading,
				rotationOrigin: 'center'
			}).addTo(map);

			flightInformationOverlay.remove();

			flightInformationOverlay = new FlightInformationTextBox({ position: 'topright' }).addTo(map);
		}
		else {
			console.log('Map not mounted');
		}
	}

	async function addMarker(lat: number, long: number, name: string) {
		markers.push(L.marker([lat, long]).bindPopup(name).addTo(map));
	}

	async function removeMarkers() {
		markers.forEach((marker) => {
			map.removeLayer(marker);
		});
		markers = [];
	}

	async function connectMarkers() {
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

	onMount(async () => {
		if (enabled && browser) {
			leaflet = await import('leaflet');
			rotated_marker = await import('leaflet-rotatedmarker');

			await loadMapScenario();
			mounted = true;
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
