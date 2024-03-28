<script lang="ts">
	import {
		getDrawerStore,
		ListBox,
		ListBoxItem,
		popup,
		type PopupSettings
	} from '@skeletonlabs/skeleton';
	import { init } from '@paralleldrive/cuid2';
	import {
		RefreshOutline,
		CogOutline,
		WandMagicSparklesOutline,
		DotsHorizontalOutline
	} from 'flowbite-svelte-icons';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
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

	let distanceUnit: string = 'Nautical Miles';

	const distanceUnitsPopupCombobox: PopupSettings = {
		event: 'click',
		target: 'distance-unit-popup',
		placement: 'bottom',
		closeQuery: '.listbox-item'
	};
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
		{#if waypoints.length == 0}
			<div class="p-1">
				<p class="text-slate-600">Add a waypoint by clicking on an airport or any other spot on the map.</p>
			</div>
		{/if}
		{#each waypoints as waypoint}
			<div class="flex flex-row gap-2 place-content-center">
				<div class="flex flex-col place-content-center">
					{#if waypoint.index == 0}
						🛩️{:else if waypoint.index == waypoints.length - 1}🏁{:else}🚩{/if}
				</div>
				<div class="flex flex-col place-content-center">
					<textarea class='textarea' rows="1" placeholder={waypoint.name} />
				</div>
				<button
					class="flex flex-col place-content-center"
					use:popup={{
						event: 'click',
						target: waypoint.name + '-waypoint-details-popup',
						placement: 'bottom'
					}}><DotsHorizontalOutline /></button
				>

				<div
					id={waypoint.name + '-waypoint-details-popup'}
					class="card p-4 w-auto shadow-xl z-50"
					data-popup={waypoint.name + '-waypoint-details-popup'}
				>
					<div>
						<button
							on:click={() => {
								WaypointsStore.update((waypoints) => {
									waypoints = waypoints.filter((w) => w.index !== waypoint.index);
									waypoints.forEach((waypoint, index) => {
										waypoint.index = index;
									});
									return waypoints;
								});
							}}>Delete</button
						>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<Accordion>
		<AccordionItem open>
			<svelte:fragment slot="lead"><WandMagicSparklesOutline /></svelte:fragment>
			<svelte:fragment slot="summary">Auto-generate Route</svelte:fragment>
			<svelte:fragment slot="content"
				><div class="flex flex-col gap-2">
					<div class="label">Route Seed</div>
					<div class="flex flex-row gap-2">
						<textarea
							id="seed-input"
							class="textarea"
							rows="1"
							maxlength="20"
							placeholder="Enter a seed"
						/>
						<button
							type="button"
							class="btn variant-filled w-10"
							on:click={() => {
								routeSeed = routeCUID();

								const element = document.getElementById('seed-input');
								if (element) {
									element.value = routeSeed;
								}
							}}><RefreshOutline /></button
						>
					</div>
				</div></svelte:fragment
			>
		</AccordionItem>
		<AccordionItem open>
			<svelte:fragment slot="lead"><CogOutline /></svelte:fragment>
			<svelte:fragment slot="summary">Preferences</svelte:fragment>
			<svelte:fragment slot="content"
				><div>
					<button class="btn textarea w-[266px] justify-between" use:popup={distanceUnitsPopupCombobox}>
						<span>{distanceUnit ?? 'Distance Unit'}</span>
						<span>↓</span>
					</button>

					<div class="card shadow-xl w-[266px] py-2" data-popup="distance-unit-popup">
						<ListBox rounded="rounded-none">
							<ListBoxItem bind:group={distanceUnit} name="medium" value="Nautical Miles">Nautical Miles</ListBoxItem>
							<ListBoxItem bind:group={distanceUnit} name="medium" value="Miles">Miles</ListBoxItem>
							<ListBoxItem bind:group={distanceUnit} name="medium" value="Kilometers">Kilometers</ListBoxItem>
						</ListBox>
						<div class="arrow bg-surface-100-800-token" />
					</div>
				</div></svelte:fragment
			>
		</AccordionItem>
	</Accordion>
</div>

<style lang="postcss">
	textarea {
		resize: none;
	}
</style>
