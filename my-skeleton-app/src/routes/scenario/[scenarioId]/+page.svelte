<script lang="ts">
	import Simulator from './Radio.svelte';
	import { page } from '$app/stores';
	var scenarioId = $page.params.scenarioId;

	// check whether unexpected events are enabled
	let unexpectedEvents: boolean = false;
	var unexpectedEventsString = $page.url.searchParams.get('unexpectedEvents');
	if (unexpectedEventsString != null) {
		unexpectedEvents = unexpectedEventsString === 'True';
	}
</script>

<div>
	<div>
		<!-- No seed value works for some reason -->
		<Simulator seed={scenarioId} unexpectedEvents={unexpectedEvents}/>
	</div>
</div>
