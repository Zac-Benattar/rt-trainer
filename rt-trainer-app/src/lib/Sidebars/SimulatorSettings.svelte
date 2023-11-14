<script lang="ts">
	import { LightSwitch, SlideToggle } from '@skeletonlabs/skeleton';
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	export let studentPrefix: boolean = true;

	const drawerStore = getDrawerStore();

	function drawerClose(): void {
		drawerStore.close();
	}
</script>

<nav class="list-nav p-4">
	<ul>
		<li><a href="/" on:click={drawerClose}>Home</a></li>
		<SlideToggle
			id="enabled-student-prefix"
			name="slider-small"
			active="bg-primary-500"
			size="sm"
			on:click={() => {
				studentPrefix = !studentPrefix;
			}}
			>Student Prefix
		</SlideToggle>
        <!-- Other prefixes could be supported if not too complex (CAP413 2.38) -->

		<li><div><LightSwitch /></div></li>
	</ul>
</nav>

<style lang="postcss">
</style>
