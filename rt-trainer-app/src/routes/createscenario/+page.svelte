<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { GlobeOutline, EditOutline } from 'flowbite-svelte-icons';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { init } from '@paralleldrive/cuid2';

	const weatherCUID = init({ length: 6 });

	let selectedRouteId: string = '';
	let weatherSeed: string = weatherCUID();
	let emergency: boolean = true;

	let routesClass: string = '';
	let routesClassAlertText: string = 'hidden';

	export let data: PageData;
	export let form: ActionData;

	// Remove this in favour of the form submit
	function onsubmit() {
		if (selectedRouteId === '') {
			routesClass = 'border border-red-500';
			routesClassAlertText = '';
			return;
		} else {
			routesClass = '';
			routesClassAlertText = 'hidden';
		}
	}
</script>

<!-- Put a map on the right so the route can be previewed - maybe show where the emergency will be and other info -->
<div class="flex flex-col place-content-center">
	<div class="flex flex-row p-3 place-content-center sm:place-content-start">
		{#if form?.missing}<p class="error">The email field is required</p>{/if}
		{#if form?.notFound}<p class="error">Route not found</p>{/if}
		{#if form?.success}<p class="success">Route created successfully.</p>
			<button class="btn variant-filled" on:click={() => goto(`/scenario/${form?.scenarioId}`)}
				>View Scenario</button
			>{:else}
			<div class="flex flex-col px-2 xs:w-9/12 gap-2">
				<div class="h3 p-1">Create a scenario</div>

				<form class="flex flex-col gap-1" method="POST" action="?/createScenario">
					<div>
						<div class="h4 p-1">Scenario Name</div>
						<input class="input" name="scenarioName" type="text" placeholder="My scenario" />
						<div class="text-sm opacity-50 p-1">
							A memorable name such as "Dundee to Fife via Leuchars MATZ"
						</div>
					</div>

					<div>
						<div class="h4 p-1">Description</div>
						<textarea
							class="textarea"
							rows="4"
							name="scenarioDescription"
							placeholder="Take off from Dundee then left-hand turn over the Tay..."
						/>
					</div>

					<span class="h4 p-1">Route</span>
					<div>
						<span class="h5 p-1">Your Routes</span>

						<ListBox class="card {routesClass}">
							{#each data.userRecentRoutes as route}
								<ListBoxItem bind:group={selectedRouteId} name="routeId" value={route.id}>
									<svelte:fragment slot="lead">
										<span class="badge-icon p-4 variant-soft-secondary">
											<GlobeOutline />
										</span>
									</svelte:fragment>
									<div class="flex flex-row gap-2">
										<div class="flex-col place-content-center">
											<dt class="font-bold">{route.name}</dt>
											{#if route.description == null}
												<div class="text-sm opacity-50">No description</div>
											{:else if route.description.length > 200}
												<div class="text-sm opacity-50">
													{route.description?.substring(0, 200)}...
												</div>
											{:else}
												<div class="text-sm opacity-50">
													{route.description?.substring(0, 200)}
												</div>
											{/if}
										</div>
									</div>

									<svelte:fragment slot="trail">
										<button on:click={() => goto(`/routes/${route.id}`)}><EditOutline /></button>
									</svelte:fragment>
								</ListBoxItem>
							{/each}
						</ListBox>
						<div class="text-sm text-red-500 p-1 {routesClassAlertText}">
							Please select a route for the scenario
						</div>
					</div>

					<div>
						<div class="h4 p-1">Weather Seed</div>
						<input class="input" name="weatherSeed" type="text" placeholder={weatherSeed} />
						<div class="text-sm opacity-50 p-1">
							This seed will be used to generate the weather for the scenario
						</div>
					</div>

					<div>
						<label class="flex items-center space-x-2 mb-3">
							<input class="checkbox" type="checkbox" name="hasEmergency" checked={emergency} />
							<p>Include Emergency</p>
						</label>
					</div>

					<button class="btn variant-filled" on:click={onsubmit}>Create Scenario</button>
				</form>
			</div>
		{/if}
	</div>
</div>
