<!-- Based off of ShipBit's youtube tutorial https://www.youtube.com/watch?v=JFctWXEzFZw -->

<script lang="ts">
	import { onMount, onDestroy, getContext, setContext, createEventDispatcher } from 'svelte';
	import L from 'leaflet';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import type Airport from '$lib/ts/AeronauticalClasses/Airport';

	export let width: number;
	export let height: number;
	export let latLng: L.LatLngExpression;
	export let aeroObject: Waypoint | Airport | undefined;
	export let draggable: boolean = false;

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
				iconAnchor: L.point(width / 2 - 8, height / 2)
			});
			marker = L.marker(latLng, { icon }).addTo(map);
			if (draggable) marker.dragging?.enable();
			marker?.on('drag', (e) => {
				dispatch('drag', { event: e, waypoint: aeroObject });
				map?.invalidateSize();
			});
			marker?.on('mouseover', (e) => {
				dispatch('mouseover', { event: e, waypoint: aeroObject });
				marker?.openPopup(); // Probably should be moved to the page
			});
			marker?.on('mouseout', (e) => {
				dispatch('mouseout', { event: e, waypoint: aeroObject });
				marker?.closePopup(); // Probably should be moved to the page
			});
		}
	});

	onDestroy(() => {
		marker?.remove();
		marker = undefined;
	});
</script>

<div bind:this={markerElement}>
	{#if marker}
		<slot />
	{/if}
</div>
