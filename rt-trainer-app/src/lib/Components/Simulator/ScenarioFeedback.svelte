<script lang="ts">
	import { RadioCallsStore } from '$lib/stores';
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import type RadioCall from '$lib/ts/RadioCall';
	import { Feedback } from '$lib/ts/Feedback';
	import Results from '$lib/ts/Results';
	let results: Results;

	RadioCallsStore.subscribe((value) => {
		results = new Results(value);
	});
</script>

<div class="card p-4 w-9/12">
	{#if results.getRadioCalls().length === 0}
		<p>Something went wrong: No feedback to show</p>
	{:else}
		<Accordion>
			<AccordionItem open>
				<svelte:fragment slot="lead">🛫</svelte:fragment>
				<svelte:fragment slot="summary">Takeoff</svelte:fragment>
				<svelte:fragment slot="content">
					<TreeView hyphenOpacity={'opacity-0'}>
						{#each results.getStartUpAndTaxiCalls() as item}
							<TreeViewItem>
								{item.getRoutePoint().stage}
								<svelte:fragment slot="children">
									<TreeViewItem>"{item.getRadioCall()}"</TreeViewItem>
								</svelte:fragment></TreeViewItem
							>
						{/each}
					</TreeView></svelte:fragment
				>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="lead">🧭</svelte:fragment>
				<svelte:fragment slot="summary">Cross Country Flight</svelte:fragment>
				<svelte:fragment slot="content"
					><TreeView hyphenOpacity={'opacity-0'}>
						{#each results.getAirborneCalls() as item}
							<TreeViewItem>
								{item.getRoutePoint().stage}
								<svelte:fragment slot="children">
									<TreeViewItem>"{item.getRadioCall()}"</TreeViewItem>
								</svelte:fragment></TreeViewItem
							>
						{/each}
					</TreeView></svelte:fragment
				>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="lead">🛬</svelte:fragment>
				<svelte:fragment slot="summary">Landing</svelte:fragment>
				<svelte:fragment slot="content"
					><TreeView hyphenOpacity={'opacity-0'}>
						{#each results.getLandingCalls() as item}
							<TreeViewItem>
								{item.getRoutePoint().stage}
								<svelte:fragment slot="children">
									<TreeViewItem>"{item.getRadioCall()}"</TreeViewItem>
								</svelte:fragment></TreeViewItem
							>
						{/each}
					</TreeView></svelte:fragment
				>
			</AccordionItem>
		</Accordion>
	{/if}
</div>

<style lang="postcss">
</style>
