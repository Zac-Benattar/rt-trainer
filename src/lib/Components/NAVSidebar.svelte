<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	function drawerClose(): void {
		drawerStore.close();
	}
</script>

<nav class="list-nav p-4">
	<ul>
		<li><a href="/" on:click={drawerClose}>Home</a></li>
		<li><a href="/simulator" on:click={drawerClose}>Quick Scenario</a></li>
		<li><a href="/scenario-planner" on:click={drawerClose}>Scenario Planner</a></li>
		<li><a href="/about" on:click={drawerClose}>About</a></li>
	</ul>
</nav>
