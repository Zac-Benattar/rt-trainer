<script lang="ts">
	import { FeedbackStore } from '$lib/stores';
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import { ScenarioFeedback } from '$lib/ts/SimulatorTypes';
	let feedback: ScenarioFeedback | null = null;

	FeedbackStore.subscribe((value) => {
		feedback = new ScenarioFeedback(value);
	});
</script>

<div class="card p-4 w-9/12">
	{#if feedback === null}
		<p>Something went wrong: Feedback is null</p>
	{:else}
		<TreeView >
			<TreeViewItem>
				🟢 {feedback.getFlawlessCount()} Flawless Radio Calls
				<svelte:fragment slot="children">
					<TreeViewItem>
						{#each feedback.getFlawless() as item}
							<TreeViewItem>
								{item.getRoutePoint().stage}
								<svelte:fragment slot="children">
									<TreeViewItem>{item.getRadioCall()}</TreeViewItem>
								</svelte:fragment></TreeViewItem
							>
						{/each}</TreeViewItem
					>
				</svelte:fragment>
			</TreeViewItem>
			<TreeViewItem>
				🟠 {feedback.getMinorMistakesCount()} Minor Mistakes
				<svelte:fragment slot="children">
					<TreeViewItem>
						{#each feedback.getMinorMistakes() as item}
							<TreeViewItem>
								{item.getRoutePoint().stage}
								<svelte:fragment slot="children">
									<TreeViewItem>{item.getRadioCall()}</TreeViewItem>
									<TreeViewItem>{item.getDisplayString()}</TreeViewItem>
								</svelte:fragment></TreeViewItem
							>
						{/each}</TreeViewItem
					>
				</svelte:fragment>
			</TreeViewItem>
			<TreeViewItem>
				🔴 {feedback.getSevereMistakesCount()} Major Errors
				<svelte:fragment slot="children">
					<TreeViewItem>
						{#each feedback.getSevereMistakes() as item}
							<TreeViewItem>
								{item.getRoutePoint().stage}
								<svelte:fragment slot="children">
									<TreeViewItem>{item.getRadioCall()}</TreeViewItem>
									<TreeViewItem>{item.getDisplayString()}</TreeViewItem>
								</svelte:fragment></TreeViewItem
							>
						{/each}</TreeViewItem
					>
				</svelte:fragment>
			</TreeViewItem>
		</TreeView>
	{/if}
</div>

<style lang="postcss">
</style>
