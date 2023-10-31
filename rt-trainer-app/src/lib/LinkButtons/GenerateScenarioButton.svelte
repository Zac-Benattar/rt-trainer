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

<div class="card flex flex-col">
	<div class="text-2xl">Generate a scenario</div>
	<div>
		<SlideToggle
			id="enable-random-events"
			name="slider-medium"
			checked
			active="bg-primary-500"
			size="md">Random events</SlideToggle
		>
	</div>
	<div>
		<button type="button" class="btn variant-filled" on:click={handleClick}>Generate</button>
	</div>
</div>

<style lang="postcss">
	.card {
		padding: 1rem;
		min-width: 200px;
		max-width: 260px;
	}
</style>
