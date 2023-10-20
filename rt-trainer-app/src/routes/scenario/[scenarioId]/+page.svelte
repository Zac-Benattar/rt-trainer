<script lang="ts">
	import Simulator from './Simulator.svelte';
	import { page } from '$app/stores';
	var seed = $page.params.scenarioId;

	// check whether unexpected events are enabled
	let unexpectedEvents: boolean = false;
	var unexpectedEventsString = $page.url.searchParams.get('unexpectedEvents');
	if (unexpectedEventsString != null) {
		unexpectedEvents = unexpectedEventsString === 'True';
	}
</script>

<div class='relative flex' style='justify-content: center;'>
	<!-- No props can be passed without error -->
	<Simulator {seed} {unexpectedEvents}/>
</div>
