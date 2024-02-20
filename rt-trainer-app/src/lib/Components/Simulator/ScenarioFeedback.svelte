<script lang="ts">
	import { RadioCallsHistoryStore } from '$lib/stores';
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import type RadioCall from '$lib/ts/RadioCall';
	import { Feedback } from '$lib/ts/Feedback';
	import Results from '$lib/ts/Results';
	let results: Results;

	RadioCallsHistoryStore.subscribe((value) => {
		results = new Results(value);
	});
</script>

<div class="card p-4 w-9/12">
	{#if results.isEmpty()}
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
								{item[0].getCurrentScenarioPoint().stage}
								<svelte:fragment slot="children">
									{#each item as call}
										<div class="">
											{#if call.getFeedback().isFlawless()}
												<TreeViewItem>"{call.getRadioCall()}"</TreeViewItem>
											{:else}
												<TreeViewItem>
													{#if call.getFeedback().getMinorMistakes().length > 0}
														<div class="flex flex-row gap-4 justify-between">
															<div
																class="flex flex-col justify-center items-centerplace-content-center"
															>
																"<span>{call.getRadioCall()}"</span>
															</div>
															<div class="card text-yellow-500 p-2 justify-self-end">
																{call.getFeedback().getTotalMistakes()} Issues
															</div>
														</div>
													{:else}
														<div class="flex flex-row gap-4 justify-between">
															<div
																class="flex flex-col justify-center items-centerplace-content-center"
															>
																<span>"{call.getRadioCall()}"</span>
															</div>
															<div class="card text-red-500 p-2 justify-self-end">
																{call.getFeedback().getTotalMistakes()} Issues
															</div>
														</div>
													{/if}<svelte:fragment slot="children">
														{#each call.getFeedback().getMinorMistakes() as minorMistake}
															<TreeViewItem
																><span class="text-yellow-500">Minor Error: {minorMistake}</span
																></TreeViewItem
															>
														{/each}
														{#each call.getFeedback().getSevereMistakes() as severeMistake}
															<TreeViewItem
																><span class="text-red-500">Mistake: {severeMistake}</span
																></TreeViewItem
															>
														{/each}
													</svelte:fragment></TreeViewItem
												>
											{/if}
										</div>
									{/each}
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
								{item[0].getCurrentScenarioPoint().stage}
								<svelte:fragment slot="children">
									{#each item as call}
										<div class="">
											{#if call.getFeedback().isFlawless()}
												<TreeViewItem>"{call.getRadioCall()}"</TreeViewItem>
											{:else}
												<TreeViewItem>
													{#if call.getFeedback().getMinorMistakes().length > 0}
														<div class="flex flex-row gap-4 justify-between">
															<div
																class="flex flex-col justify-center items-centerplace-content-center"
															>
																"<span>{call.getRadioCall()}"</span>
															</div>
															<div class="card text-yellow-500 p-2 justify-self-end">
																{call.getFeedback().getTotalMistakes()} Issues
															</div>
														</div>
													{:else}
														<div class="flex flex-row gap-4 justify-between">
															<div
																class="flex flex-col justify-center items-centerplace-content-center"
															>
																<span>"{call.getRadioCall()}"</span>
															</div>
															<div class="card text-red-500 p-2 justify-self-end">
																{call.getFeedback().getTotalMistakes()} Issues
															</div>
														</div>
													{/if}<svelte:fragment slot="children">
														{#each call.getFeedback().getMinorMistakes() as minorMistake}
															<TreeViewItem
																><span class="text-yellow-500">Minor Error: {minorMistake}</span
																></TreeViewItem
															>
														{/each}
														{#each call.getFeedback().getSevereMistakes() as severeMistake}
															<TreeViewItem
																><span class="text-red-500">Mistake: {severeMistake}</span
																></TreeViewItem
															>
														{/each}
													</svelte:fragment></TreeViewItem
												>
											{/if}
										</div>
									{/each}
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
								{item[0].getCurrentScenarioPoint().stage}
								<svelte:fragment slot="children">
									{#each item as call}
										<div class="">
											{#if call.getFeedback().isFlawless()}
												<TreeViewItem>"{call.getRadioCall()}"</TreeViewItem>
											{:else}
												<TreeViewItem>
													{#if call.getFeedback().getMinorMistakes().length > 0}
														<div class="flex flex-row gap-4 justify-between">
															<div
																class="flex flex-col justify-center items-centerplace-content-center"
															>
																"<span>{call.getRadioCall()}"</span>
															</div>
															<div class="card text-yellow-500 p-2 justify-self-end">
																{call.getFeedback().getTotalMistakes()} Issues
															</div>
														</div>
													{:else}
														<div class="flex flex-row gap-4 justify-between">
															<div
																class="flex flex-col justify-center items-centerplace-content-center"
															>
																<span>"{call.getRadioCall()}"</span>
															</div>
															<div class="card text-red-500 p-2 justify-self-end">
																{call.getFeedback().getTotalMistakes()} Issues
															</div>
														</div>
													{/if}<svelte:fragment slot="children">
														{#each call.getFeedback().getMinorMistakes() as minorMistake}
															<TreeViewItem
																><span class="text-yellow-500">Minor Error: {minorMistake}</span
																></TreeViewItem
															>
														{/each}
														{#each call.getFeedback().getSevereMistakes() as severeMistake}
															<TreeViewItem
																><span class="text-red-500">Mistake: {severeMistake}</span
																></TreeViewItem
															>
														{/each}
													</svelte:fragment></TreeViewItem
												>
											{/if}
										</div>
									{/each}
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
