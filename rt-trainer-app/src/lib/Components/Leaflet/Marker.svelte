<!-- Based off of ShipBit's youtube tutorial https://www.youtube.com/watch?v=JFctWXEzFZw -->

<script lang="ts">
	import { onMount, onDestroy, getContext, setContext, createEventDispatcher } from 'svelte';
	import L from 'leaflet';
	import 'leaflet-rotatedmarker';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import type Airport from '$lib/ts/AeronauticalClasses/Airport';

	export let width: number;
	export let height: number;
	export let rotation: number = 0;
	export let latLng: L.LatLngExpression;
	export let aeroObject: Waypoint | Airport | undefined = undefined;
	export let draggable: boolean = false;
	export let iconAnchor: L.Point = L.point(width / 2 - 8, height / 2 - 8);

	const dispatch = createEventDispatcher();

	let marker: L.Marker | undefined;
	let markerElement: HTMLElement;

	const { getMap }: { getMap: () => L.Map | undefined } = getContext('map');
	const map = getMap();

	setContext('layer', {
		// L.Marker inherits from L.Layer
		getLayer: () => marker
	});

	onMount(() => {
		if (map) {
			let icon = L.divIcon({
				html: markerElement,
				className: 'map-marker',
				iconSize: L.point(width, height),
				iconAnchor: iconAnchor
			});
			marker = L.marker(latLng, {
				icon,
				rotationAngle: rotation,
				rotationOrigin: 'center center'
			}).addTo(map);

			if (draggable) marker.dragging?.enable();
			marker?.on('drag', (e) => {
				dispatch('drag', { event: e, aeroObject: aeroObject, marker: marker});
				map?.invalidateSize();
			});
			marker?.on('click', (e) => {
				dispatch('click', { event: e, aeroObject: aeroObject, marker: marker });
			});
			marker?.on('mouseover', (e) => {
				dispatch('mouseover', { event: e, aeroObject: aeroObject, marker: marker });
			});
			marker?.on('mouseout', (e) => {
				dispatch('mouseout', { event: e, aeroObject: aeroObject, marker: marker });
			});
		}
	});

	onDestroy(() => {
		marker?.remove();
		marker = undefined;
		map?.invalidateSize();
	});
</script>

<div bind:this={markerElement}>
	{#if marker}
		<slot />
	{/if}
</div>
