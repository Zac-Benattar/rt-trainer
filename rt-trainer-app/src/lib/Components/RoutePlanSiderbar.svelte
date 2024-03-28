<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { init } from '@paralleldrive/cuid2';
	import {
		RefreshOutline,
		CogOutline,
		WandMagicSparklesOutline,
		DotsHorizontalOutline
	} from 'flowbite-svelte-icons';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { waypointsTable } from '$lib/db/schema';
	import { WaypointsStore } from '$lib/stores';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';

	const drawerStore = getDrawerStore();

	function drawerClose(): void {
		drawerStore.close();
	}

	const routeCUID = init({ length: 8 });

	let routeSeed: string = routeCUID();
	let waypoints: Waypoint[] = [];

	WaypointsStore.subscribe((value) => {
		waypoints = value;
	});
</script>

<div class="flex flex-col grow p-3 gap-2">
	<div class="flex flex-col">
		<div class="flex flex-row ml-[-14px]">
			<strong><a href="/home" class="btn text-xl sm:text-2xl uppercase">RT Trainer</a></strong>
		</div>

		<div class="flex flex-row mt-[-10px] ml-[6px] pb-2">
			<ol class="breadcrumb">
				<li class="crumb"><a class="anchor" href="/myroutes">My Routes</a></li>
				<li class="crumb-separator" aria-hidden>/</li>
				<li>New</li>
			</ol>
		</div>
	</div>

	<hr />

	<div class="flex flex-col gap-2 p-2">
		<div>Route Waypoints</div>
		{#each waypoints as waypoint}
			<div class="flex flex-row gap-2 place-content-center">
				<div class="flex flex-col place-content-center">
					{#if waypoint.index == 0}
						🛩️{:else if waypoint.index == waypoints.length - 1}🏁{:else}🚩{/if}
				</div>
				<div class="flex flex-col place-content-center">
					<textarea rows="1" placeholder={waypoint.name} />
				</div>
				<div class="flex flex-col place-content-center"><DotsHorizontalOutline /></div>
			</div>
		{/each}
	</div>

	<Accordion>
		<AccordionItem open>
			<svelte:fragment slot="lead"><WandMagicSparklesOutline /></svelte:fragment>
			<svelte:fragment slot="summary">Auto-generate Route</svelte:fragment>
			<svelte:fragment slot="content"
				><div class="flex flex-col">
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
				</div></svelte:fragment
			>
		</AccordionItem>
		<AccordionItem>
			<svelte:fragment slot="lead"><CogOutline /></svelte:fragment>
			<svelte:fragment slot="summary">Route Preferences</svelte:fragment>
			<svelte:fragment slot="content">(content)</svelte:fragment>
		</AccordionItem>
		<!-- ... -->
	</Accordion>
</div>

<style lang="postcss">
</style>
