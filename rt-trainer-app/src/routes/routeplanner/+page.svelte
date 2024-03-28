<script lang="ts">
	import Map from '$lib/Components/Map.svelte';
	import { AirportsStore, AwaitingServerResponseStore, WaypointsStore } from '$lib/stores';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import { init } from '@paralleldrive/cuid2';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import type { ActionData } from './$types';
	import { fetchFRTOLRouteBySeed, loadFRTOLRouteBySeed } from '$lib/ts/Scenario';
	import { RefreshOutline } from 'flowbite-svelte-icons';
	import { AirspacesStore } from '$lib/stores';
	import type { PageData } from './$types';
	import { plainToInstance } from 'class-transformer';
	import Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import Airport from '$lib/ts/AeronauticalClasses/Airport';

	const routeCUID = init({ length: 8 });

	let routeSeed: string = routeCUID();
	let routeName: string = '';
	let routeDescription: string = '';

	let routeSeedDescription: string = 'This seed will be used to generate the route';

	let routeNameClasses: string = '';
	let routeSeedClasses: string = '';

	export let data: PageData;

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

	
	let waypoints: Waypoint[] = [];

	const airspaces = [];
	for (const airspace of data.airspaces) {
		airspaces.push(plainToInstance(Airspace, airspace as Airspace));
	}
	AirspacesStore.set(airspaces);

	const airports = [];
	for (const airport of data.airports) {
		airports.push(plainToInstance(Airport, airport as Airport));
	}
	AirportsStore.set(airports);
</script>

<div class="flex flex-col place-content-center">
	<div class="flex flex-col sm:flex-row p-3 place-content-center sm:place-content-start gap-5">
		<div class="flex flex-col px-2 xs:pr-3">
			<Map
				enabled={true}
				widthSmScreen={'1500px'}
				heightSmScreen={'900px'}
				mode={MapMode.RoutePlan}
			/>
		</div>
	</div>
</div>
