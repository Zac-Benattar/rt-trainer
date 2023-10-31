<script lang="ts">
	import { goto } from '$app/navigation';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	export let exampleScenarioId = Math.floor(Math.random() * 1000000);

	const handleClick = () => {
		const enableRandomEventsElement = document.getElementById(
			'enable-random-events'
		) as HTMLInputElement;
		let enableRandomEvents: boolean = false;
		if (enableRandomEventsElement != null) {
			enableRandomEvents = enableRandomEventsElement.checked;
		}
		if (enableRandomEvents) goto('/scenario/' + exampleScenarioId + '?unexpectedEvents=True');
		else goto('/scenario/' + exampleScenarioId);
	};
</script>

<div class="card flex flex-col gap-3">
	<div class="text-2xl">Generate a scenario</div>
	<div class="flex justify-center">
		<SlideToggle
			id="enable-random-events"
			name="slider-medium"
			checked
			active="bg-primary-500"
			size="md">Random events</SlideToggle
		>
	</div>
	<button type="button" class="btn variant-filled" on:click={handleClick}>Generate</button>
</div>

<style lang="postcss">
	.card {
		padding: 1rem;
		width: 259px;
	}
</style>
