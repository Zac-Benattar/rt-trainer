<script lang="ts">
	/* Structure inspired by ShipBit's youtube tutorial https://www.youtube.com/watch?v=JFctWXEzFZw
	
	The coordinates used in the rest of the application are in the format [long, lat],
	here they must be converted to [lat, long] for Leaflet to understand them correctly.
	*/
	import { createEventDispatcher, onDestroy, onMount, setContext, tick } from 'svelte';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';

	let map: L.Map | undefined;
	let mapElement: HTMLDivElement;

	export let bounds: L.LatLngBounds | undefined = undefined;
	export let view: L.LatLngExpression | undefined = [52.33, -1.42];
	export let zoom: number | undefined = undefined;

	$: if (map) {
		if (bounds) {
			map.fitBounds(bounds);
		} else if (view && zoom) {
			map.setView(view, zoom);
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

<link rel="stylesheet prefetch" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
crossorigin="" />

<div class="w-full h-full" bind:this={mapElement}>
	{#if map}
		<slot />
	{/if}
</div>
