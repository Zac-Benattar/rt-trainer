<script lang="ts">
	import { clipboard } from '@skeletonlabs/skeleton';
	import { GenerationParametersStore } from '$lib/stores';

	let seedString: string = '0';
	let hasEmergency: boolean = false;
	let airborneWaypoints: number = 2;

	GenerationParametersStore.subscribe((value) => {
		seedString = value.seed.seedString;
		airborneWaypoints = value.airborneWaypoints;
		hasEmergency = value.hasEmergency;
	});

	let scenarioLink = 'www.rt-trainer.com/scenario/' + seedString;
	let questionMarkAppended = false;

	if (hasEmergency) {
		scenarioLink += '?emergencies=true';
		questionMarkAppended = true;
	}
	if (airborneWaypoints != 2) {
		if (questionMarkAppended) scenarioLink += '&';
		else scenarioLink += '?';
		scenarioLink += 'airborneWaypoints=' + airborneWaypoints;
	}
</script>

<div class="copy-link-div relative w-full text-token card variant-soft p-4 flex items-center gap-4">
	<div data-clipboard="scenarioLinkElement">{scenarioLink}</div>

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
