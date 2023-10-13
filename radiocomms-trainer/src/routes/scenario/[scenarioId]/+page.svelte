<script lang="ts">
  import Radio from './Radio.svelte'
  import { page } from "$app/stores";
  const scenarioId = $page.params.scenarioId;
  const unexpectedEvents = $page.url.searchParams.get("unexpectedEvents");
</script>

<h1>Scenario {scenarioId}</h1>
<Radio />

