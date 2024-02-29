<script lang="ts">
	import { GlobeOutline } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex flex-col place-content-center">
	<div class="flex flex-row p-3 place-content-center sm:place-content-start">
		<div class="flex flex-col px-2 xs:w-9/12 gap-2">
			<span class="h3 p-1">Your Scenarios</span>

			<button class="btn variant-filled font-bold" on:click={() => goto('/createscenario')}
				>Create A Scenario</button
			>

			{#if data.userScenarios.length === 0}
				<div class="card p-5">
					<div class="text-center">
						<p class="text-2xl font-bold">No scenarios found</p>
						<p class="text-sm opacity-50">Create a scenario to get started</p>
					</div>
				</div>
			{:else}
				<nav class="list-nav">
					<ul>
						{#each data.userScenarios as scenario}
							<li>
								<a href="/scenarios/{scenario.id}">
									<span class="badge bg-primary-500"><GlobeOutline /></span>
									<span class="font-bold">{scenario.name}</span>
									<div>
										{#if scenario.description == null}
											<div class="text-sm opacity-50">No description</div>
										{:else if scenario.description.length > 200}
											<div class="text-sm opacity-50">
												{scenario.description?.substring(0, 200)}...
											</div>
										{:else}
											<div class="text-sm opacity-50">
												{scenario.description?.substring(0, 200)}
											</div>
										{/if}
									</div>
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			{/if}
		</div>
	</div>
</div>
