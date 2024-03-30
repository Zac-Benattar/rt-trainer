<!-- Based off of ShipBit's youtube tutorial https://www.youtube.com/watch?v=JFctWXEzFZw -->

<script lang="ts">
	import { onMount, onDestroy, getContext, setContext } from 'svelte';
	import L from 'leaflet';

	export let latLngArray: L.LatLngExpression[];

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
			polygon = L.polygon(latLngArray, { color: 'blue', fillColor: 'blue', fillOpacity: 0.2, weight: 1 }).addTo(map);
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
