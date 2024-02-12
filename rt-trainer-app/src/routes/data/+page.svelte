<script lang="ts">
	export let data;
</script>

<div>
	<div class="text-xl">Airports</div>
	<div class="p-3 text-sm">
		<ul>
			{#each data.airports as airport}
				<li><p>{airport.json.name}</p></li>
			{/each}
		</ul>
	</div>
</div>
