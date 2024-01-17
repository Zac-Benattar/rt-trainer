<script lang="ts">
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	function drawerClose(): void {
		drawerStore.close();
	}
</script>

<nav class="list-nav p-4">
	<ul>
		<li><a href="/"  on:click={drawerClose}>Home</a></li>
		<li><a href="/about"  on:click={drawerClose}>About</a></li>
		<li><a href="/blog"  on:click={drawerClose}>Blog</a></li>
		<li><a href="/contact"  on:click={drawerClose}>Contact</a></li>
		<li><div><LightSwitch /></div></li>
	</ul>
</nav>

<style lang="postcss">
</style>
