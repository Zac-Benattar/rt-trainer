<script lang="ts">
	import Map from '$lib/Components/Leaflet/Map.svelte';
	import { AirportsStore } from '$lib/stores';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import { init } from '@paralleldrive/cuid2';
	import { MapMode } from '$lib/ts/SimulatorTypes';
	import type { ActionData } from './$types';
	import { fetchFRTOLRouteBySeed, loadFRTOLRouteBySeed } from '$lib/ts/Scenario';
	import { RefreshOutline, CirclePlusOutline, CirclePlusSolid } from 'flowbite-svelte-icons';
	import { AirspacesStore } from '$lib/stores';
	import type { PageData } from './$types';
	import { plainToInstance } from 'class-transformer';
	import Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import Airport from '$lib/ts/AeronauticalClasses/Airport';
	import Marker from '$lib/Components/Leaflet/Marker.svelte';
	import Popup from '$lib/Components/Leaflet/Popup.svelte';

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

	const airspaces = [];
	for (const airspace of data.airspaces) {
		airspaces.push(plainToInstance(Airspace, airspace as Airspace));
	}
	AirspacesStore.set(airspaces);

	const airports: Airport[] = [];
	for (const airport of data.airports) {
		airports.push(plainToInstance(Airport, airport as Airport));
	}
	AirportsStore.set(airports);
</script>

<div class="flex flex-col place-content-center w-full h-full">
	<div class="flex flex-col place-content-center sm:place-content-start gap-5 w-full h-full">
		<div class="flex flex-col xs:pr-3 w-full h-full">
			<Map zoom={13} mode={MapMode.RoutePlan}>
				{#each airports as airport}
					<Marker latLng={[airport.coordinates[1], airport.coordinates[0]]} width={30} height={30}>
						<!-- ShipBit Icon -->
						<CirclePlusSolid color='blue' size='lg'/>

						<Popup
							>Like & Subscribe! This is a very loooooooooooong title and it has many characters.</Popup
						>
					</Marker>
				{/each}
			</Map>
		</div>
	</div>
</div>
