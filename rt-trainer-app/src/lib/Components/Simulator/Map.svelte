<script lang="ts">
	/* This file is not correctly typed due to the way SvelteKit builds its production
	bundle and how Leaflet depends on the window object. This presented issues with loading
	leaflet but the compromise is to not import Leaflet with an import statement at the 
	top of the file. Read more here about the issue and solution in the blog post by 
	Stanislav Khromov below.
	https://khromov.se/using-leaflet-with-sveltekit/ */

	import { CurrentRoutePointStore, RouteStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { WaypointType, type Pose } from '$lib/ts/RouteTypes';

	type MapWaypoint = {
		lat: number;
		long: number;
		name: string;
	};

	export let enabled: boolean = true;
	let leaflet: any;
	let rotated_marker: any;
	let targetPose: Pose;
	let mounted: boolean = false;
	let currentLocationMarker: any;
	let waypoints: MapWaypoint[] = [];
	let markers: any[] = [];
	let zoomLevel: number = 13;
	let map: any;
	let planeIcon: any;
	let flightInformationOverlay: HTMLDivElement;
	let FlightInformationTextBox: any;

	RouteStore.subscribe((routePoints) => {
		// Get all waypoints from the route
		waypoints = [];
		for (let i = 0; i < routePoints.length; i++) {
			if (
				routePoints[i].waypoint &&
				routePoints[i].waypoint.waypointType != WaypointType.Emergency &&
				!waypoints.find((waypoint) => waypoint.name === routePoints[i].waypoint.name)
			) {
				waypoints.push({
					lat: routePoints[i].waypoint.lat,
					long: routePoints[i].waypoint.long,
					name: routePoints[i].waypoint.name
				});
			}
		}
	});

	CurrentRoutePointStore.subscribe((currentRoutePoint) => {
		if (currentRoutePoint != null) {
			targetPose = currentRoutePoint.pose;

			if (mounted) {
				updateMap();
			} else {
			}
		} else {
			targetPose = {
				lat: 0,
				long: 0,
				heading: 0,
				altitude: 0,
				airSpeed: 0
			};
		}
	});

	async function loadMapScenario() {
		if (map) {
			map.remove();
		}

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
					targetPose.airSpeed +
					'</p>';
				return text;
			}
		});

		map = L.map('myMap').setView([targetPose?.lat, targetPose?.long], zoomLevel);

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
			addMarker(waypoint.lat, waypoint.long, waypoint.name);
		});

		connectMarkers();

		// Sets the current location marker, done last to make sure it is on top
		currentLocationMarker = L.marker([targetPose.lat, targetPose.long], {
			icon: planeIcon,
			rotationAngle: targetPose.heading,
			rotationOrigin: 'center'
		}).addTo(map);

		flightInformationOverlay = new FlightInformationTextBox({ position: 'topright' }).addTo(map);
	}

	async function updateMap() {
		if (mounted) {
			await map;

			map.setView([targetPose?.lat, targetPose?.long], zoomLevel);

			removeMarkers();

			// Adds all waypoints to the map
			waypoints.forEach((waypoint) => {
				addMarker(waypoint.lat, waypoint.long, waypoint.name);
			});

			connectMarkers();

			// Updates the current location marker, done last to make sure it is on top
			currentLocationMarker = L.marker([targetPose.lat, targetPose.long], {
				icon: planeIcon,
				rotationAngle: targetPose.heading,
				rotationOrigin: 'center'
			}).addTo(map);

			flightInformationOverlay.remove();

			flightInformationOverlay = new FlightInformationTextBox({ position: 'topright' }).addTo(map);
		} else {
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

			loadMapScenario();
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

<div class="map-container bg-surface-500">
	{#if enabled}
		<div
			id="myMap"
			class="card"
			style="position: relative; width: 100%; height: 100%;  z-index: 2;"
		/>
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

		padding: 8px;

		border-radius: 5px;
	}
</style>
