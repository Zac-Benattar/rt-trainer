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
		<li><a href="/scenarioplanner" on:click={drawerClose}>Plan Scenario</a></li>
		<li><a href="/about" on:click={drawerClose}>About</a></li>
	</ul>
</nav>
