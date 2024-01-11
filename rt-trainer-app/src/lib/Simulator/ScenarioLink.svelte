<script lang="ts">
	import { clipboard } from '@skeletonlabs/skeleton';
	import { SettingsStore, SeedStore } from '$lib/stores';

	let seedString: string = '0';
	let scenarioLink: string = 'www.rt-trainer.com/scenario/0';

	SeedStore.subscribe((value) => {
		seedString = value.seedString;
	});

	SettingsStore.subscribe((value) => {
		if (value.unexpectedEvents) {
			scenarioLink = 'www.rt-trainer.com/scenario/' + seedString + '?unexpectedEvents=true';
		} else {
			scenarioLink = 'www.rt-trainer.com/scenario/' + seedString;
		}
	});
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
