<script lang="ts">
	import Simulator from './Radio.svelte';
	import { page } from '$app/stores';
	import { clipboard } from '@skeletonlabs/skeleton';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	var scenarioId = $page.params.scenarioId;

	// check whether unexpected events are enabled
	let unexpectedEvents: boolean = false;
	var unexpectedEventsString = $page.url.searchParams.get('unexpectedEvents');
	if (unexpectedEventsString != null) {
		unexpectedEvents = unexpectedEventsString === 'True';
	}

	// generate the link to the scenario
	var scenarioLink = 'www.rt-trainer.com/scenario/' + scenarioId;
	if (unexpectedEvents) {
		scenarioLink += '?unexpectedEvents=' + unexpectedEvents;
	}
</script>

<div>
	<div>
		<h1>Scenario {scenarioId}</h1>
	</div>
	<div>
		<p>
			Unexpected events <SlideToggle
				id="enable-random-events"
				name="slider-small"
				checked={unexpectedEvents}
				active="bg-primary-500"
				size="sm"
				on:click={() => (unexpectedEvents = !unexpectedEvents)}
			/>
		</p>
	</div>
	<div>
		<!-- Source -->
		<div data-clipboard="scenarioLinkElement">{scenarioLink}</div>

		<!-- Trigger -->
		<button use:clipboard={{ element: 'scenarioLinkElement' }}>Copy</button>
	</div>
	<div>
		<!-- No seed value works for some reason -->
		<Simulator seed={scenarioId}/>
	</div>
</div>
