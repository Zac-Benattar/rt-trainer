<script lang="ts">
	export let enabled: boolean = true;
	var map: any;

	function loadMapScenario() {
		map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
			credentials: 'YOUR_API_KEY',
			center: new Microsoft.Maps.Location(requiredState?.lat, requiredState?.long),
			zoom: 12
		});
	}

	function updateMap() {
		var location = new Microsoft.Maps.Location(requiredState?.lat, requiredState?.long);
		map.setView({ center: location, zoom: 15 });
	}
</script>

<svelte:head>
	{#if enabled}
		<script
			type="text/javascript"
			src="https://www.bing.com/api/maps/mapcontrol?key=YOUR_API_KEY"
		></script>
	{/if}
</svelte:head>

<div class="map-container">
	<h1>Map</h1>
	{#if enabled}
		<div id="myMap" style="position: relative; width: 100%; height: 100%;" />
	{/if}
	{#if !enabled}
		<p>Map is disabled</p>
	{/if}
</div>

<style lang="postcss">
	.map-container {
		position: relative;
		width: 100%;
		min-width: 490px;
		min-height: 390px;
		background-color: #fff;
		padding: 20px;
		outline: solid 1px #ccc;
		border-radius: 5px;
		color: black;
	}
</style>
