<script lang="ts">
	/* Structure inspired by ShipBit's youtube tutorial https://www.youtube.com/watch?v=JFctWXEzFZw
	
	The coordinates used in the rest of the application are in the format [long, lat],
	here they must be converted to [lat, long] for Leaflet to understand them correctly.
	*/
	import {
		AirportsStore,
		AirspacesStore,
		AwaitingServerResponseStore,
		CurrentScenarioPointStore,
		NullRouteStore,
		WaypointsStore
	} from '$lib/stores';
	import { createEventDispatcher, onDestroy, onMount, setContext, tick } from 'svelte';
	import type { Pose } from '$lib/ts/ScenarioTypes';
	import { convertMinutesToTimeString, getNthPhoneticAlphabetLetter } from '$lib/ts/utils';
	import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import Waypoint, { WaypointType } from '$lib/ts/AeronauticalClasses/Waypoint';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import type Airport from '$lib/ts/AeronauticalClasses/Airport';
	import { init } from '@paralleldrive/cuid2';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';

	let polyline_decorator: any;
	let targetPose: Pose = {
		position: [0, 0],
		trueHeading: 0,
		altitude: 0,
		airSpeed: 0
	};
	let currentTime: string = '00:00';
	let currentLocationMarker: any;
	let waypoints: Waypoint[] = [];
	let airspaces: Airspace[] = [];
	let airports: Airport[] = [];
	let markers: any[] = [];
	let polygons: any[] = [];
	let lines: any[] = [];
	let needsRerender: boolean = false;

	let planeIcon: any;
	let airportIcon: any;
	let airportSelectedIcon: any;
	let flightInformarionObject: HTMLDivElement;
	let FlightInformationClass: any;
	let routeEditControlsObject: HTMLDivElement;
	let routeEditControlsClass: any;
	let nullRouteOverlay: HTMLDivElement;
	let NullRouteTextBox: any;
	let nullRoute: boolean = false;
	let unnamedWaypointCount = 1;
	let CUID = init({ length: 8 });

	let map: L.Map | undefined;
	let mapElement: HTMLDivElement;

	export let bounds: L.LatLngBounds | undefined = undefined;
	export let view: L.LatLngExpression | undefined = [52.33, -1.42];
	export let zoom: number | undefined = undefined;

	export let mode: MapMode = MapMode.RoutePlan;

	$: if (needsRerender) {
		// updateMap();
		needsRerender = false;
	}

	$: if (map) {
		if (bounds) {
			map.fitBounds(bounds);
		} else if (view && zoom) {
			map.setView(view, zoom);
		}
	}

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

	// async function loadMap() {

	// 	if (mode == MapMode.RoutePlan) {
	// 		map.on('click', (e: { latlng: { lng: number; lat: number } }) => {
	// 			const newWaypoint = new Waypoint(
	// 				CUID(),
	// 				'Waypoint ' + getNthPhoneticAlphabetLetter(unnamedWaypointCount++),
	// 				[parseFloat(e.latlng.lng.toFixed(8)), parseFloat(e.latlng.lat.toFixed(8))],
	// 				WaypointType.Fix,
	// 				waypoints.length
	// 			);

	// 			waypoints.push(newWaypoint);
	// 			WaypointsStore.set(waypoints);
	// 			needsRerender = true;
	// 		});

	// 		routeEditControlsClass = L.Control.extend({
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

	// 		routeEditControlsObject = new FlightInformationClass({ position: 'topright' }).addTo(map);
	// 	}

	// 	planeIcon = L.icon({
	// 		iconUrl: '/images/plane-icon.png',

	// 		iconSize: [40, 40], // size of the icon
	// 		iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
	// 		popupAnchor: [20, 20] // point from which the popup should open relative to the iconAnchor
	// 	});

	// 	airportIcon = L.icon({
	// 		iconUrl: '/images/airport-icon-blue.png',

	// 		iconSize: [40, 40], // size of the icon
	// 		iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
	// 		popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
	// 	});

	// 	airportSelectedIcon = L.icon({
	// 		iconUrl: '/images/airport-icon-red.png',

	// 		iconSize: [60, 60], // size of the icon
	// 		iconAnchor: [30, 40], // point of the icon which will correspond to marker's location
	// 		popupAnchor: [0, -5] // point from which the popup should open relative to the iconAnchor
	// 	});
	// }

	// 	// if (mode == MapMode.RoutePlan && waypoints.length > 0) {
	// 	// 	const bbox = turf.bbox(turf.lineString(waypoints.map((waypoint) => waypoint.location)));
	// 	// 	const bounds = new L.LatLngBounds([
	// 	// 		[bbox[1], bbox[0]],
	// 	// 		[bbox[3], bbox[2]]
	// 	// 	]);
	// 	// 	map.fitBounds(bounds);
	// 	// }

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

	async function updateMap() {
		if (map) {
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

			// map.setView([targetPose.position[1], targetPose.position[0]], initialZoomLevel);

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
					addWaypointMarker(waypoint);
				}
			});

			connectWaypoints();

			drawAirspaces();

			drawAirports();

			//rotationAngle: targetPose.trueHeading / 2,
			//rotationOrigin: 'center'
			if (mode == MapMode.Scenario || mode == MapMode.ScenarioPlan) {
				currentLocationMarker.remove();

				// Updates the current location marker, done last to make sure it is on top
				currentLocationMarker = L.marker(
					new L.LatLng(targetPose.position[1], targetPose.position[0]),
					{
						icon: planeIcon
					}
				).addTo(map);

				routeEditControlsObject.remove();

				routeEditControlsObject = new FlightInformationClass({ position: 'topright' }).addTo(map);
			}
		}
	}

	// rotationAngle: targetPose.trueHeading / 2,
	// rotationOrigin: 'center'
	async function updatePose() {
		if (map) {
			await map;

			map.setView(new L.LatLng(targetPose.position[1], targetPose.position[0]), zoom);

			if (mode == MapMode.Scenario || mode == MapMode.ScenarioPlan) {
				currentLocationMarker.remove();

				// Updates the current location marker, done last to make sure it is on top
				currentLocationMarker = L.marker(
					new L.LatLng(targetPose.position[1], targetPose.position[0]),
					{
						icon: planeIcon
					}
				).addTo(map);

				routeEditControlsObject.remove();

				routeEditControlsObject = new FlightInformationClass({ position: 'topright' }).addTo(map);
			}
		}
	}

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

	async function addWaypointMarker(_waypoint: Waypoint) {
		if (map) {
			const div = document.createElement('div');
			div.innerHTML = `<br>${_waypoint.name}<br>`;
			div.className = 'flex flex-col gap-2 bg-surface-500 text-white p-2 rounded-md shadow-md';

			const nameTextarea = document.createElement('textarea');
			nameTextarea.className = 'textarea';
			nameTextarea.rows = 1;
			nameTextarea.value = _waypoint.name;
			div.appendChild(nameTextarea);

			const latTextarea = document.createElement('textarea');
			latTextarea.className = 'textarea';
			latTextarea.rows = 1;
			latTextarea.value = _waypoint.location[1].toString();
			div.appendChild(latTextarea);

			const longTextarea = document.createElement('textarea');
			longTextarea.className = 'textarea';
			longTextarea.rows = 1;
			longTextarea.value = _waypoint.location[0].toString();
			div.appendChild(longTextarea);

			const button = document.createElement('button');
			button.innerHTML = 'Remove';
			button.className = 'btn variant-filled';
			button.onclick = () => {
				waypoints = waypoints.filter((waypoint) => waypoint != _waypoint);
				waypoints.forEach((waypoint, index) => {
					waypoint.index = index;
				});
				WaypointsStore.set(waypoints);
				needsRerender = true;
			};
			div.appendChild(button);

			const popupsettings = {
				maxWidth: 500,
				minWidth: 200,
				className: 'popup'
			};

			const myCustomColour = '#FF0000';

			const markerHtmlStyles = `
  				background-color: ${myCustomColour};
  				width: 2rem;
  				height: 2rem;
  				display: block;
  				left: -1rem;
  				top: -1rem;
  				position: relative;
  				border-radius: 2rem 2rem 0;
  				transform: rotate(45deg);`;

			const icon = L.divIcon({
				className: 'my-custom-pin',
				iconAnchor: [0, 24],
				popupAnchor: [0, -36],
				html: `<span style="${markerHtmlStyles}" />`
			});

			const marker = L.marker([_waypoint.location[1], _waypoint.location[0]], {
				draggable: true,
				icon: icon
			})
				.bindPopup(div, popupsettings)
				.addTo(map);

			marker.on('dragend', (e: any) => {
				_waypoint.location = [e.target.getLatLng().lng, e.target.getLatLng().lat];
				WaypointsStore.set(waypoints);
				needsRerender = true;
			});

			markers.push(marker);
		}
	}

	async function removeGeometry() {
		if (map) {
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
	}

	async function connectWaypoints() {
		if (map) {
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

					// const lineDecorator = L.polylineDecorator(line, {
					// 	patterns: [
					// 		// defines a pattern of 20px-wide dashes, repeated every 200px on the line
					// 		{
					// 			offset: 20,
					// 			repeat: 200,
					// 			symbol: L.Symbol.arrowHead({
					// 				pixelSize: 20,
					// 				pathOptions: {
					// 					color: '#ff1493',
					// 					fillOpacity: 1,
					// 					weight: 0,
					// 					smoothFactor: 1,
					// 					opacity: 1
					// 				}
					// 			})
					// 		}
					// 	]
					// }).addTo(map);
					// lines.push(...[line, lineDecorator]);
				}
			}
		}
	}

	async function drawAirspace(airspace: Airspace) {
		if (map) {
			await map;

			if (airspace.type != 14) {
				const airspacePolygon = L.polygon(
					airspace.coordinates[0].map((point) => [point[1], point[0]]),
					{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2, weight: 1 }
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
		if (map) {
			await map;

			// if the airport is already in the route, mark it as selected with a different icon

			let icon = airportIcon;
			if (waypoints.some((waypoint) => waypoint.referenceObjectId == airport.id)) {
				icon = airportSelectedIcon;
			}

			const airportMarker = L.marker([airport.coordinates[1], airport.coordinates[0]], {
				icon: icon,
				title: airport.name
			})
				.bindPopup(airport.name)
				.addTo(map);

			markers.push(airportMarker);

			airportMarker.on('mouseover', function () {
				airportMarker.openPopup();
			});

			airportMarker.on('mouseout', function () {
				airportMarker.closePopup();
			});

			airportMarker.on('click', function () {
				if (waypoints.some((waypoint) => waypoint.referenceObjectId == airport.id)) {
					airportMarker.setIcon(airportIcon);

					// remove the airport from the route
					waypoints = waypoints.filter((waypoint) => waypoint.referenceObjectId != airport.id);
					waypoints.forEach((waypoint, index) => {
						waypoint.index = index;
					});
					WaypointsStore.set(waypoints);
					needsRerender = true;
				} else {
					airportMarker.setIcon(airportSelectedIcon);

					// add the airport to the route if its not already in it
					if (!waypoints.some((waypoint) => waypoint.referenceObjectId == airport.id)) {
						waypoints.push(
							new Waypoint(
								airport.id,
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

	const dispatch = createEventDispatcher();

	onMount(async () => {
		if (!bounds && (!view || !zoom)) {
			throw new Error('Must set either bounds, or both view and zoom.');
		}

		map = L.map(mapElement)
			.on('zoom', (e) => dispatch('zoom', e))
			.on('click', (e) => dispatch('click', e))
			.on('popupopen', async (e) => {
				await tick();
				e.popup.update();
			});

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 17,
			attribution:
				'<a href="https://www.openaip.net/">OpenAIP</a> | © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);
	});

	onDestroy(() => {
		map?.remove();
		map = undefined;
	});

	setContext('map', {
		getMap: () => map
	});
</script>

<div class="w-full h-full" bind:this={mapElement}>
	{#if map}
		<slot />
	{/if}
</div>

<style lang="postcss">
	:global(.textarea) {
		resize: none;
	}
</style>
