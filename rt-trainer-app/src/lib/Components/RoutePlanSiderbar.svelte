<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { init } from '@paralleldrive/cuid2';
	import { RefreshOutline } from 'flowbite-svelte-icons';

	const drawerStore = getDrawerStore();

	function drawerClose(): void {
		drawerStore.close();
	}

	const routeCUID = init({ length: 8 });

	let routeSeed: string = routeCUID();
</script>

<div class="flex flex-col grow p-3 gap-2">
	<div class="flex flex-row">
		<ol class="breadcrumb">
			<li class="crumb"><a class="anchor" href="/myroutes">My Routes</a></li>
			<li class="crumb-separator" aria-hidden>/</li>
			<li>New</li>
		</ol>
	</div>
	<hr />
	<div class="flex flex-col">
		<div class="label">Route Seed</div>
		<div class="flex flex-row gap-2">
			<textarea class="textarea" rows="1" placeholder={routeSeed} />
			<button
				type="button"
				class="btn variant-filled w-10"
				on:click={() => {
					routeSeed = routeCUID();
				}}><RefreshOutline /></button
			>
		</div>
	</div>
</div>

<style lang="postcss">
</style>
