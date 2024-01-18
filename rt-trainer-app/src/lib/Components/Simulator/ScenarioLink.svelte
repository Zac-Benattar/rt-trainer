<script lang="ts">
	import { clipboard } from '@skeletonlabs/skeleton';
	import { AircraftDetailsStore, GenerationParametersStore } from '$lib/stores';

	let seedString: string = '0';
	let hasEmergency: boolean = false;
	let airborneWaypoints: number = 2;
	let prefix = '';
	let callsign = '';
	let aircraftType = '';

	GenerationParametersStore.subscribe((value) => {
		seedString = value.seed.seedString;
		airborneWaypoints = value.airborneWaypoints;
		hasEmergency = value.hasEmergency;
	});

	AircraftDetailsStore.subscribe((value) => {
		prefix = value.prefix;
		callsign = value.callsign;
		aircraftType = value.aircraftType;
	});

	let url = 'www.rt-trainer.com/scenario/' + seedString;
	let questionMarkAppended = false;
	if (prefix != '') {
		url += '?prefix=' + prefix;
		questionMarkAppended = true;
	}
	if (callsign != '') {
		if (questionMarkAppended) url += '&callsign=' + callsign;
		else url += '?callsign=' + callsign;
		questionMarkAppended = true;
	}
	if (aircraftType != '') {
		if (questionMarkAppended) url += '&aircraftType=' + aircraftType;
		else url += '?aircraftType=' + aircraftType;
		questionMarkAppended = true;
	}
	if (hasEmergency) {
		if (questionMarkAppended) url += '&emergencies=True';
		else url += '?emergencies=True';
		questionMarkAppended = true;
	}
	if (airborneWaypoints != 2) {
		if (questionMarkAppended) url += '&airborneWaypoints=' + airborneWaypoints;
		else url += '?airborneWaypoints=' + airborneWaypoints;
		questionMarkAppended = true;
	}
</script>

<div class="copy-link-div relative w-full text-token card variant-soft p-4 flex items-center gap-4">
	<div data-clipboard="scenarioLinkElement">{url}</div>

	<button use:clipboard={{ element: 'scenarioLinkElement' }} class="btn variant-filled">Copy</button
	>
</div>

<style>
	.copy-link-div {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
</style>
