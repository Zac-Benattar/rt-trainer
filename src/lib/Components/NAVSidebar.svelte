<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	function drawerClose(): void {
		drawerStore.close();
	}
</script>

<nav class="list-nav p-4">
	<ul>
		<li><a href="/home" on:click={drawerClose}>Home</a></li>
		<li><a href="/createroute" on:click={drawerClose}>Create Route</a></li>
		<li><a href="/createscenario" on:click={drawerClose}>Create Scenario</a></li>
		<li><a href="/about" on:click={drawerClose}>About</a></li>
	</ul>
</nav>

<style lang="postcss">
</style>
