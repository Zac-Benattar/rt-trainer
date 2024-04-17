<script lang="ts">
	import { CurrentScenarioPointIndexStore } from '$lib/stores';
	import type Scenario from '$lib/ts/Scenario';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { MapPinOutline } from 'flowbite-svelte-icons';

	export let scenario: Scenario;

	let selectedScenarioPointIndex: number = 0;

	function handleScenarioPointChange(event: MouseEvent) {
		const newPoint = parseInt((event.target as HTMLInputElement).value);
		CurrentScenarioPointIndexStore.set(newPoint);
		selectedScenarioPointIndex = newPoint;
	}
</script>

{#if scenario.scenarioPoints.length < 1}
	<div>No scenario points to show.</div>
{:else}
	<ListBox class="card max-h-64 overflow-auto">
		{#each scenario.scenarioPoints as scenarioPoint}
			<ListBoxItem
				bind:group={selectedScenarioPointIndex}
				name="scenarioPointId"
				value={scenarioPoint.index}
				on:click={handleScenarioPointChange}
			>
				<svelte:fragment slot="lead">
					<span class="badge-icon p-4 variant-soft-secondary">
						<MapPinOutline />
					</span>
				</svelte:fragment>
				<div class="flex flex-row gap-2">
					<div class="flex-col place-content-center">
						<dt class="font-bold">{scenarioPoint.stage}</dt>
					</div>
				</div>
			</ListBoxItem>
		{/each}
	</ListBox>
{/if}
