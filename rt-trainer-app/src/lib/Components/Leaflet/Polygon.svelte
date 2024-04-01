<script lang="ts">
	import { onMount, onDestroy, getContext, setContext } from 'svelte';
	import L from 'leaflet';

	export let latLngArray: L.LatLngExpression[];
	export let color: string = 'blue';
	export let fillColor: string | undefined = undefined;
	export let fillOpacity: number = 0.2;
	export let weight: number = 1;

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
				weight: weight
			}).addTo(map);
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
