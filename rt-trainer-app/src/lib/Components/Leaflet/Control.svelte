<script lang="ts">
	import L from 'leaflet';
	import { getContext, onDestroy, onMount, setContext } from 'svelte';

	export let position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'topleft';

	/** The control instance created by this component */
	let control: Control | undefined = undefined;
	let controlElement: HTMLElement;

	class Control extends L.Control {
		el: HTMLElement;
		constructor(el: any, position: any) {
			super({ position });
			this.el = el;
		}
		onAdd() {
			return this.el;
		}
		onRemove() {}
	}

	const { getMap }: { getMap: () => L.Map | undefined } = getContext('map');
	const map = getMap();

	setContext('layer', {
		// L.Control inherits from L.Layer
		getLayer: () => control
	});

	onMount(() => {
		if (map) {
			control = new Control(controlElement, position).addTo(map);
		}
	});

	onDestroy(() => {
		control?.remove();
		control = undefined;
	});
</script>

<div bind:this={controlElement}>
	{#if control}
		<slot {control} />
	{/if}
</div>
