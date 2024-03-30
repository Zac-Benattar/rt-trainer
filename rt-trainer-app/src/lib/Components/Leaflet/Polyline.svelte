<script lang="ts">
	import { onMount, onDestroy, getContext, setContext } from 'svelte';
	import L from 'leaflet';

	export let latLngArray: L.LatLngExpression[];
    export let colour: string = 'pink';

	let polyline: L.Polyline | undefined;
	let polylineElement: HTMLElement;

	const { getMap }: { getMap: () => L.Map | undefined } = getContext('map');
	const map = getMap();

	setContext('layer', {
		// L.Polyline inherits from L.Layer
		getLayer: () => polyline
	});

	onMount(() => {
		if (map) {
			polyline = L.polyline(latLngArray, { color: colour, fillOpacity: 1, weight: 3 }).addTo(map);
		}
	});

	onDestroy(() => {
		polyline?.remove();
		polyline = undefined;
	});
</script>

<div bind:this={polylineElement}>
	{#if polyline}
		<slot />
	{/if}
</div>
