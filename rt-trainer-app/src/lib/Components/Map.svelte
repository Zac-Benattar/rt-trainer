<script lang="ts">
	/* This file is not correctly typed due to the way SvelteKit builds its production
	bundle and how Leaflet depends on the window object. This presented issues with loading
	leaflet but the compromise is to not import Leaflet with an import statement at the 
	top of the file. Read more here about the issue and solution in the blog post by 
	Stanislav Khromov below.
	https://khromov.se/using-leaflet-with-sveltekit/ 
	
	The coordinates used in the rest of the application are in the format [long, lat],
	here they must be converted to [lat, long] for Leaflet to understand them correctly.

	This file is also cursed, and I'm sorry for anyone who has to read or maintain it.
	*/
	import {
		AirportsStore,
		AirspacesStore,
		AwaitingServerResponseStore,
		CurrentScenarioPointStore,
		NullRouteStore,
		WaypointsStore
	} from '$lib/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { Pose } from '$lib/ts/ScenarioTypes';
	import { convertMinutesToTimeString } from '$lib/ts/utils';
	import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import Waypoint, { WaypointType } from '$lib/ts/AeronauticalClasses/Waypoint';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import type Airport from '$lib/ts/AeronauticalClasses/Airport';

	export let enabled: boolean = true;
	export let widthSmScreen: string = '512px';
	export let heightSmScreen: string = '452px';
	let leaflet: any;
	let rotated_marker: any;
	let polyline_decorator: any;
	let targetPose: Pose = {
		position: [0, 0],
		trueHeading: 0,
		altitude: 0,
		airSpeed: 0
	};
	let currentTime: string = '00:00';
	let mounted: boolean = false;
	let currentLocationMarker: any;
	let waypoints: Waypoint[] = [];
	let airspaces: Airspace[] = [];
	let airports: Airport[] = [];
	let markers: any[] = [];
	let polygons: any[] = [];
	let lines: any[] = [];
	let needsRerender: boolean = false;
	let initialZoomLevel: number = 13;
	let map: any;
	let planeIcon: any;
	let airportIcon: any;
	let airportSelectedIcon: any;
	let flightInformationOverlay: HTMLDivElement;
	let FlightInformationTextBox: any;
	let nullRouteOverlay: HTMLDivElement;
	let NullRouteTextBox: any;
	let loading: boolean = false;
	let nullRoute: boolean = false;

	export let mode: MapMode = MapMode.RoutePlan;

	$: if (needsRerender && mounted) {
		updateMap();
		needsRerender = false;
		loading = false;
	}

	AwaitingServerResponseStore.subscribe((awaitingServerResponse) => {
		loading = awaitingServerResponse;
	});

	NullRouteStore.subscribe((_nullRoute) => {
		nullRoute = _nullRoute;
		if (nullRoute) {
			waypoints = [];
			airspaces = [];
			needsRerender = true;
		}
	});

	AirspacesStore.subscribe((_airspaces) => {
		airspaces = _airspaces;
		needsRerender = true;
	});

	AirportsStore.subscribe((_airports) => {
		airports = _airports;
		needsRerender = true;
	});

	WaypointsStore.subscribe((_waypoints) => {
		waypoints = _waypoints;
		needsRerender = true;
	});

	CurrentScenarioPointStore.subscribe((currentScenarioPoint) => {
		if (currentScenarioPoint != null) {
			targetPose = currentScenarioPoint.pose;
			currentTime = convertMinutesToTimeString(currentScenarioPoint.timeAtPoint);
			updatePose();
		}
	});

	async function drawAirspaces() {
		airspaces.forEach((airspace) => {
			drawAirspace(airspace);
		});
	}

	async function drawAirports() {
		airports.forEach((airport) => {
			drawAirport(airport);
		});
	}

	async function loadMap() {
		if (map) {
			map.remove();
		}

		if (mode == MapMode.RoutePlan) {
			initialZoomLevel = 8;
			targetPose = {
				position: [-1.46, 52.33],
				trueHeading: 0,
				altitude: 0,
				airSpeed: 0
			};
		} else {
			initialZoomLevel = 15;
		}

		map = L.map('myMap').setView(
			[targetPose?.position[1], targetPose?.position[0]],
			initialZoomLevel
		);

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 17,
			attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		map.on('click', (e) => {
			const newWaypoint = new Waypoint(
				'New Waypoint',
				[e.latlng.lng, e.latlng.lat],
				WaypointType.Fix,
				waypoints.length
			);

			waypoints.push(newWaypoint);
			needsRerender = true;
		});

		planeIcon = L.icon({
			iconUrl: '/images/plane-icon.png',

			iconSize: [40, 40], // size of the icon
			iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor: [20, 20] // point from which the popup should open relative to the iconAnchor
		});

		airportIcon = L.icon({
			iconUrl: '/images/airport-icon-blue.png',

			iconSize: [40, 40], // size of the icon
			iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
			popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
		});

		airportSelectedIcon = L.icon({
			iconUrl: '/images/airport-icon-red.png',

			iconSize: [60, 60], // size of the icon
			iconAnchor: [30, 40], // point of the icon which will correspond to marker's location
			popupAnchor: [0, -5] // point from which the popup should open relative to the iconAnchor
		});
	}

	// async function loadMapScenario() {
	// 	// if (mode == MapMode.RoutePlan && waypoints.length > 0) {
	// 	// 	const bbox = turf.bbox(turf.lineString(waypoints.map((waypoint) => waypoint.location)));
	// 	// 	const bounds = new L.LatLngBounds([
	// 	// 		[bbox[1], bbox[0]],
	// 	// 		[bbox[3], bbox[2]]
	// 	// 	]);
	// 	// 	map.fitBounds(bounds);
	// 	// }

	// 	// Adds all waypoints to the map
	// 	waypoints.forEach((waypoint) => {
	// 		addMarker(waypoint.location[1], waypoint.location[0], waypoint.name);
	// 	});

	// 	connectMarkers();

	// 	drawAirspaces();

	// 	drawAirports();

	// 	if (mode == MapMode.Scenario || mode == MapMode.ScenarioPlan) {

	// 		// Sets the current location marker, done last to make sure it is on top
	// 		currentLocationMarker = L.marker([targetPose.position[0], targetPose.position[1]], {
	// 			icon: planeIcon,
	// 			rotationAngle: targetPose.trueHeading,
	// 			rotationOrigin: 'center'
	// 		}).addTo(map);

	// 		FlightInformationTextBox = L.Control.extend({
	// 			onAdd: function () {
	// 				var text = L.DomUtil.create('div');
	// 				text.id = 'heading_text';
	// 				text.className = 'h6 px-2 py-1 rounded border-1 border-solid border-black';
	// 				text.style.color = 'black';
	// 				text.style.backgroundColor = 'white';
	// 				text.innerHTML =
	// 					'<p> Heading: ' +
	// 					targetPose.trueHeading +
	// 					'<br> Airspeed: ' +
	// 					targetPose.airSpeed +
	// 					'<br> Time: ' +
	// 					currentTime +
	// 					'</p>';
	// 				return text;
	// 			}
	// 		});

	// 		flightInformationOverlay = new FlightInformationTextBox({ position: 'topright' }).addTo(map);
	// 	}
	// }

	async function updateMap() {
		if (mounted) {
			await map;

			if (nullRoute) {
				console.log('null route');
				NullRouteTextBox = L.Control.extend({
					onAdd: function () {
						var text = L.DomUtil.create('div');
						text.id = 'heading_text';
						text.className = 'h6 px-2 py-1 rounded border-1 border-solid border-black';
						text.style.color = 'black';
						text.style.backgroundColor = 'white';
						text.innerHTML = '<p>Bad seed</p>';
						return text;
					}
				});

				nullRouteOverlay = new NullRouteTextBox({ position: 'topright' }).addTo(map);
			} else {
				if (nullRouteOverlay) nullRouteOverlay.remove();
			}

			map.setView([targetPose.position[1], targetPose.position[0]], initialZoomLevel);

			// if (mode == MapMode.RoutePlan && waypoints.length > 0) {
			// 	// bbox in terms of long, lat - flip them for the actual bounds in lat, long
			// 	const bbox = turf.bbox(turf.lineString(waypoints.map((waypoint) => waypoint.location)));
			// 	const bounds = new L.LatLngBounds([
			// 		[bbox[1], bbox[0]],
			// 		[bbox[3], bbox[2]]
			// 	]);
			// 	map.fitBounds(bounds);
			// }

			await removeGeometry();

			// Adds all waypoints to the map
			waypoints.forEach((waypoint) => {
				if (waypoint.type != WaypointType.Aerodrome) {
					addMarker(waypoint.location[1], waypoint.location[0], waypoint.name);
				}
			});

			connectWaypoints();

			drawAirspaces();

			drawAirports();

			if (mode == MapMode.Scenario || mode == MapMode.ScenarioPlan) {
				currentLocationMarker.remove();

				// Updates the current location marker, done last to make sure it is on top
				currentLocationMarker = L.marker(
					new L.LatLng(targetPose.position[1], targetPose.position[0]),
					{
						icon: planeIcon,
						rotationAngle: targetPose.trueHeading / 2,
						rotationOrigin: 'center'
					}
				).addTo(map);

				flightInformationOverlay.remove();

				flightInformationOverlay = new FlightInformationTextBox({ position: 'topright' }).addTo(
					map
				);
			}
		} else {
			console.log('Map not mounted');
		}
	}

	async function updatePose() {
		if (mounted) {
			await map;

			map.setView(new L.LatLng(targetPose.position[1], targetPose.position[0]), initialZoomLevel);

			if (mode == MapMode.Scenario || mode == MapMode.ScenarioPlan) {
				currentLocationMarker.remove();

				// Updates the current location marker, done last to make sure it is on top
				currentLocationMarker = L.marker(
					new L.LatLng(targetPose.position[1], targetPose.position[0]),
					{
						icon: planeIcon,
						rotationAngle: targetPose.trueHeading / 2,
						rotationOrigin: 'center'
					}
				).addTo(map);

				flightInformationOverlay.remove();

				flightInformationOverlay = new FlightInformationTextBox({ position: 'topright' }).addTo(
					map
				);
			}
		}
	}

	async function addMarker(lat: number, long: number, name: string) {
		markers.push(L.marker([lat, long]).bindPopup(name).addTo(map));
	}

	async function removeGeometry() {
		await markers.forEach((marker) => {
			map.removeLayer(marker);
		});
		markers = [];
		await lines.forEach((line) => {
			map.removeLayer(line);
		});
		lines = [];
		await polygons.forEach((polygon) => {
			map.removeLayer(polygon);
		});
		polygons = [];
	}

	async function connectWaypoints() {
		if (waypoints.length > 1) {
			for (let i = 0; i < waypoints.length - 1; i++) {
				const line = L.polyline(
					[
						[waypoints[i].location[1], waypoints[i].location[0]],
						[waypoints[i + 1].location[1], waypoints[i + 1].location[0]]
					],
					{
						color: '#ff1493',
						weight: 5,
						opacity: 1,
						smoothFactor: 1
					}
				).addTo(map);

				const lineDecorator = L.polylineDecorator(line, {
					patterns: [
						// defines a pattern of 20px-wide dashes, repeated every 200px on the line
						{
							offset: 20,
							repeat: 200,
							symbol: L.Symbol.arrowHead({
								pixelSize: 20,
								pathOptions: {
									color: '#ff1493',
									fillOpacity: 1,
									weight: 0,
									smoothFactor: 1,
									opacity: 1
								}
							})
						}
					]
				}).addTo(map);
				lines.push(...[line, lineDecorator]);
			}
		}
	}

	async function drawAirspace(airspace: Airspace) {
		if (mounted) {
			await map;

			if (airspace.type != 14) {
				const airspacePolygon = L.polygon(
					airspace.coordinates[0].map((point) => [point[1], point[0]]),
					{ color: 'blue' }
				)
					.bindPopup(airspace.getDisplayName())
					.addTo(map);

				airspacePolygon.on('mouseover', function () {
					airspacePolygon.openPopup();
				});

				airspacePolygon.on('mouseout', function () {
					airspacePolygon.closePopup();
				});

				polygons.push(airspacePolygon);
			} else if (airspace.type == 14) {
				const airspacePolygon = L.polygon(
					airspace.coordinates[0].map((point) => [point[1], point[0]]),
					{ color: 'red' }
				)
					.bindPopup(airspace.getDisplayName())
					.addTo(map);

				airspacePolygon.on('mouseover', function () {
					airspacePolygon.openPopup();
				});

				airspacePolygon.on('mouseout', function () {
					airspacePolygon.closePopup();
				});

				polygons.push(airspacePolygon);
			}
		}
	}

	async function drawAirport(airport: Airport) {
		if (mounted) {
			await map;

			// if the airport is already in the route, mark it as selected with a different icon

			let icon = airportIcon;
			if (waypoints.some((waypoint) => waypoint.name == airport.name)) {
				icon = airportSelectedIcon;
			}

			const airportMarker = L.marker([airport.coordinates[1], airport.coordinates[0]], {
				icon: icon,
				title: airport.name
			})
				.bindPopup(airport.name)
				.addTo(map);

			airportMarker.on('mouseover', function () {
				airportMarker.openPopup();
			});

			airportMarker.on('mouseout', function () {
				airportMarker.closePopup();
			});

			airportMarker.on('click', function () {
				if (airportMarker.getIcon() == airportSelectedIcon) {
					// remove original marker
					L.DomUtil.remove(airportMarker._icon);

					airportMarker.setIcon(airportIcon);
					// remove the airport from the route
					waypoints = waypoints.filter((waypoint) => waypoint.name != airport.name);
					waypoints.forEach((waypoint, index) => {
						waypoint.index = index;
					});
					WaypointsStore.set(waypoints);
					needsRerender = true;
				} else {
					L.DomUtil.remove(airportMarker._icon);
					airportMarker.setIcon(airportSelectedIcon);
					// add the airport to the route if its not already in it
					if (!waypoints.some((waypoint) => waypoint.name == airport.name)) {
						waypoints.push(
							new Waypoint(
								airport.name,
								airport.coordinates,
								WaypointType.Aerodrome,
								waypoints.length
							)
						);
						WaypointsStore.set(waypoints);
						needsRerender = true;
					}
				}
			});
		}
	}

	onMount(async () => {
		if (enabled && browser) {
			leaflet = await import('leaflet');
			rotated_marker = await import('leaflet-rotatedmarker');
			polyline_decorator = await import('leaflet-polylinedecorator');

			loadMap();
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
		<div id="myMap" class="card flex grow z-[1] flex flex-row place-content-center" />
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
