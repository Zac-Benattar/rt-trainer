<script lang="ts">
	/* This file is not correctly typed due to the way SvelteKit builds its production
	bundle and how Leaflet depends on the window object. This presented issues with loading
	leaflet but the compromise is to not import Leaflet with an import statement at the 
	top of the file. Read more here about the issue and solution in the blog post by 
	Stanislav Khromov below.
	https://khromov.se/using-leaflet-with-sveltekit/ */

	import {
		ATZsStore,
		CurrentRoutePointStore,
		RouteElementStore,
		WaypointsStore
	} from '$lib/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { Pose } from '$lib/ts/RouteTypes';
	import { convertMinutesToTimeString } from '$lib/ts/utils';
	import type ATZ from '$lib/ts/ATZ';

	type MapWaypoint = {
		lat: number;
		long: number;
		name: string;
	};

	export let enabled: boolean = true;
	export let widthSmScreen: string = '512px';
	export let heightSmScreen: string = '452px';
	let leaflet: any;
	let rotated_marker: any;
	let targetPose: Pose = {
		lat: 0,
		long: 0,
		magneticHeading: 0,
		trueHeading: 0,
		altitude: 0,
		airSpeed: 0
	};
	let currentTime: string = '00:00';
	let mounted: boolean = false;
	let currentLocationMarker: any;
	let mapWaypoints: MapWaypoint[] = [];
	let markers: any[] = [];
	let needsToBeUpdated: boolean = false;
	export let initialZoomLevel: number = 13;
	let map: any;
	let planeIcon: any;
	let flightInformationOverlay: HTMLDivElement;
	let FlightInformationTextBox: any;

	$: if (needsToBeUpdated && mounted) {
		updateMap();
		needsToBeUpdated = false;
	}

	ATZsStore.subscribe((atzs) => {
		atzs.forEach((atz) => {
			if (atz.type != 14) {
				drawATZ(atz);
			} else {
				drawMATZ(atz);
			}
		});
	});

	WaypointsStore.subscribe((waypoints) => {
		// Get all waypoints from the route
		mapWaypoints = [];
		for (let i = 0; i < waypoints.length; i++) {
			let name = waypoints[i].name;
			if (i != 0) {
				name += ' ETA: ' + convertMinutesToTimeString(waypoints[i].arrivalTime);
			}
			mapWaypoints.push({
				lat: waypoints[i].getWaypointCoords()[1],
				long: waypoints[i].getWaypointCoords()[0],
				name: name
			});
		}

		// If no current route point data, set the targetPose to the first waypoint
		if (
			(targetPose == null || (targetPose.lat == 0 && targetPose.long == 0)) &&
			mapWaypoints.length > 0
		) {
			targetPose = {
				lat: mapWaypoints[0].lat,
				long: mapWaypoints[0].long,
				magneticHeading: 0,
				trueHeading: 0,
				altitude: 0,
				airSpeed: 0
			};
		}

		needsToBeUpdated = true;
	});

	CurrentRoutePointStore.subscribe((currentRoutePoint) => {
		if (currentRoutePoint != null) {
			targetPose = currentRoutePoint.pose;
			currentTime = convertMinutesToTimeString(currentRoutePoint.timeAtPoint);
			if (mounted) {
				updateMap();
			} else {
			}
		} else {
			if (targetPose == null) {
				targetPose = {
					lat: 0,
					long: 0,
					magneticHeading: 0,
					trueHeading: 0,
					altitude: 0,
					airSpeed: 0
				};
			}
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
					targetPose.magneticHeading +
					'<br> Airspeed: ' +
					targetPose.airSpeed +
					'<br> Time: ' +
					currentTime +
					'</p>';
				return text;
			}
		});

		map = L.map('myMap').setView([targetPose?.lat, targetPose?.long], initialZoomLevel);

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
		mapWaypoints.forEach((mapWaypoint) => {
			addMarker(mapWaypoint.lat, mapWaypoint.long, mapWaypoint.name);
		});

		connectMarkers();

		// Sets the current location marker, done last to make sure it is on top
		currentLocationMarker = L.marker([targetPose.lat, targetPose.long], {
			icon: planeIcon,
			rotationAngle: targetPose.trueHeading,
			rotationOrigin: 'center'
		}).addTo(map);

		flightInformationOverlay = new FlightInformationTextBox({ position: 'topright' }).addTo(map);
	}

	async function updateMap() {
		if (mounted) {
			await map;

			map.setView([targetPose.lat, targetPose.long], initialZoomLevel);

			removeMarkers();

			// Adds all waypoints to the map
			mapWaypoints.forEach((mapWaypoint) => {
				addMarker(mapWaypoint.lat, mapWaypoint.long, mapWaypoint.name);
			});

			connectMarkers();

			currentLocationMarker.remove();

			// Updates the current location marker, done last to make sure it is on top
			currentLocationMarker = L.marker([targetPose.lat, targetPose.long], {
				icon: planeIcon,
				rotationAngle: targetPose.trueHeading,
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

	async function drawATZ(atz: ATZ) {
		if (mounted) {
			await map;

			// Draw the ATZ
			L.polygon(atz.getLeafletCoords(), { color: 'blue' }).bindPopup(atz.getName()).addTo(map);
		}
	}

	async function drawMATZ(atz: ATZ) {
		if (mounted) {
			await map;

			// Draw the ATZ
			L.polygon(atz.getLeafletCoords(), { color: 'red' }).bindPopup(atz.getName()).addTo(map);
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

<div
	class="container flex flex-row p-1.5 rounded-md grow h-80 sm:h-96 sm:max-w-lg sm:max-h-lg bg-surface-500 text-white"
	style="--widthSmScreen: {widthSmScreen}; --heightSmScreen: {heightSmScreen};"
>
	{#if enabled}
		<div id="myMap" class="card flex grow z-[1]" />
	{:else}
		<p>Map is disabled</p>
	{/if}
</div>

<style lang="postcss">
	.card {
		width: 100%;
	}

	.container {
		@media (min-width: 640px) {
			min-width: var(--widthSmScreen);
			min-height: var(--heightSmScreen);
			max-width: var(--widthSmScreen);
			max-height: var(--heightSmScreen);
		}
	}
</style>
