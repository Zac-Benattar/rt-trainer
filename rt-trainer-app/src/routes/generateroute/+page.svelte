<script lang="ts">
	import Map from '$lib/Components/Leaflet/Map.svelte';
	import { AwaitingServerResponseStore, WaypointsStore } from '$lib/stores';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import { init } from '@paralleldrive/cuid2';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import type { ActionData } from './$types';
	import { fetchFRTOLRouteBySeed, loadFRTOLRouteBySeed, loadRouteData } from '$lib/ts/Scenario';
	import { RefreshOutline } from 'flowbite-svelte-icons';

	const routeCUID = init({ length: 8 });

	let routeSeed: string = routeCUID();
	let routeName: string = '';
	let routeDescription: string = '';

	let routeSeedDescription: string = 'This seed will be used to generate the route';

	let routeNameClasses: string = '';
	let routeSeedClasses: string = '';

	export let form: ActionData;

	if (form?.RouteNameMissing) {
		routeNameClasses = 'input-error';
	}

	if (form?.routeSeedMissing) {
		routeSeedDescription = 'Seed is required. Perhaps use the example';
		routeSeedClasses = 'input-error';
	}

	if (form?.routeGenerationError) {
		routeSeedDescription = 'Invalid seed';
		routeSeedClasses = 'input-error';
	}

	$: {
		AwaitingServerResponseStore.set(true);
		loadFRTOLRouteBySeed(routeSeed);
		AwaitingServerResponseStore.set(false);
	}

	let waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((_waypoints) => {
		waypoints = _waypoints;

		if (_waypoints && _waypoints.length > 1) {
			routeName = _waypoints[0].name + ' to ' + _waypoints[_waypoints.length - 1].name;
		} else {
			routeName = '';
		}
	});
</script>

<div class="flex flex-col place-content-center">
	<div class="flex flex-col sm:flex-row p-3 place-content-center sm:place-content-start gap-5">
		<div class="flex flex-col px-2 grow sm:max-w-xl gap-2">
			<div class="h3 p-1">Generate a route</div>

			<form class="flex flex-col gap-1" method="POST" action="?/createRoute">
				<div>
					<div class="h4 p-1">Route Name</div>
					<input
						class="input {routeNameClasses}"
						name="routeName"
						type="text"
						placeholder="My route"
						bind:value={routeName}
					/>
					<div class="text-sm opacity-50 p-1">
						A memorable name such as "Dundee to Fife via Leuchars MATZ"
					</div>
				</div>

				<div>
					<div class="h4 p-1">Description</div>
					<textarea
						class="textarea"
						rows="4"
						name="routeDescription"
						placeholder="Take off from Dundee then left-hand turn over the Tay..."
						bind:value={routeDescription}
					/>
				</div>

				<div>
					<div class="h4 p-1">Route Seed</div>
					<div class="flex flex-row gap-3">
						<input
							class="input {routeSeedClasses}"
							name="routeSeed"
							type="text"
							placeholder={routeSeed}
							bind:value={routeSeed}
						/>
						<button
							type="button"
							class="btn variant-filled w-10"
							on:click={() => {
								routeSeed = routeCUID();
							}}><RefreshOutline /></button
						>
					</div>

					<div class="text-sm opacity-50 p-1">{routeSeedDescription}</div>
				</div>

				<button class="btn variant-filled">Save Route</button>
			</form>
		</div>

		<div class="flex flex-col px-2 xs:pr-3">
			<div class="h4 p-1">Route Preview</div>
			<Map
				enabled={true}
				widthSmScreen={'600px'}
				heightSmScreen={'500px'}
				mode={MapMode.RoutePlan}
			/>
		</div>
	</div>
</div>
