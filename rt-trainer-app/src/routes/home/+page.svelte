<script lang="ts">
	import { page } from '$app/stores';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	const radioCallData = {
		title: 'Radio Calls Made',
		correct: 1887,
		totalCalls: 2334,
		last30DaysStats: [
			{
				value: 247,
				label: 'Calls'
			},
			{
				value: 76,
				label: 'Flawless'
			}
		],
		correctPercentageLast30Days: 76 / 247
	};
</script>

<div class="flex flex-col place-content-center">
	<div class="flex flex-row p-3 place-content-center sm:place-content-start">
		{#if $page.data.session}
			<div class="flex flex-col px-2 xs:w-9/12 gap-3">
				<span class="h3 p-1">
					Welcome, {$page.data.session.user?.name}
				</span>
				<div class="card p-5 flex justify-between">
					<div class="space-y-6">
						<div class="font-bold h3">{radioCallData.title}</div>
						<div>
							<div>{radioCallData.totalCalls}</div>
							<div class="text-sm opacity-70">Total Calls</div>
						</div>

						<div class="flex flex-col justify-between sm:gap-4 card py-2 sm:p-3">
							<div class="h4 place-self-center sm:place-self-start">Last 30 Days</div>
							<div class="flex flex-row p-1 gap-2 place-self-center sm:place-self-start">
								{#each radioCallData.last30DaysStats as item}
									<div class="p-2">
										<b>{item.value}</b>
										<div class="text-sm opacity-70">{item.label}</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
					<ProgressRadial
						value={radioCallData.correctPercentageLast30Days * 100}
						stroke={80}
						class="h-40 w-40"
					>
						{(radioCallData.correctPercentageLast30Days * 100).toFixed(0)}%
					</ProgressRadial>
				</div>
				<div class="flex flex-col gap-3">
					<div class="h3">Recently Created Scenarios</div>
					<div class="flex flex-col gap-3">
						{#if data.recentScenarios.length === 0}
							<div class="card p-3 flex flex-col gap-3">
								You havent made any scenarios yet. <button
									type="button"
									class="btn variant-filled"
									on:click={() => goto('/createscenario')}>Create One</button
								>
							</div>
						{/if}
						{#each data.recentScenarios as scenario}
							<div class="card p-3 flex flex-row justify-between">
								<div class="flex flex-col gap-1">
									<a class="h4" href="/scenario/{scenario.id}">{scenario.name}</a>
									<div class="text-sm opacity-70">{scenario.createdAt}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
