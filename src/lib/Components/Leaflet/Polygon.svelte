<script lang="ts">
	import { onMount, onDestroy, getContext, setContext, createEventDispatcher } from 'svelte';
	import L from 'leaflet';
	import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';

	export let latLngArray: L.LatLngExpression[];
	export let aeroObject: Airspace | undefined = undefined;
	export let color: string = 'blue';
	export let fillColor: string | undefined = undefined;
	export let fillOpacity: number = 0.2;
	export let weight: number = 1;

	const dispatch = createEventDispatcher();

	let polygon: L.Polygon | undefined;
	let polygonElement: HTMLElement;

	const { getMap }: { getMap: () => L.Map | undefined } = getContext('map');
	const map = getMap();

	setContext('layer', {
		// L.Polygon inherits from L.Layer
		getLayer: () => polygon
	});

	onMount(() => {
		if (map) {
			// if fill color undefined, set it to color
			polygon = L.polygon(latLngArray, {
				color: color,
				fillColor: fillColor !== undefined ? fillColor : color,
				fillOpacity: fillOpacity,
				weight: weight,
			}).addTo(map);
			polygon?.on('click', (e) => {
				dispatch('click', { event: e, waypoint: aeroObject, polygon: polygon });
			});
			polygon?.on('mouseover', (e) => {
				dispatch('mouseover', { event: e, waypoint: aeroObject, polygon: polygon });
			});
			polygon?.on('mouseout', (e) => {
				dispatch('mouseout', { event: e, waypoint: aeroObject, polygon: polygon});
			});
		}
	});

	onDestroy(() => {
		polygon?.remove();
		polygon = undefined;
	});
</script>

<div bind:this={polygonElement}>
	{#if polygon}
		<slot />
	{/if}
</div>
