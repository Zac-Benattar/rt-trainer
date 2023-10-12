<script lang="ts">
  import { goto } from "$app/navigation";
  export let exampleScenarioId = Math.floor(Math.random() * 1000000);

  const handleClick = () => {
    const enableRandomEventsElement = document.getElementById(
      "enable-random-events"
    ) as HTMLInputElement;
    let enableRandomEvents : boolean = false;
    if (enableRandomEventsElement != null) {
        enableRandomEvents = enableRandomEventsElement.checked;
    }
    if (enableRandomEvents)
      goto("/scenario/" + exampleScenarioId + "?unexpectedEvents=True");
    else goto("/scenario/" + exampleScenarioId);
  };
</script>

<h1>Welcome to RT Trainer</h1>

<p>
  RT Trainer is a web application that allows you to practice your radio
  communication skills.
</p>
<input
  type="checkbox"
  id="enable-random-events"
  name="enable-random-events"
  value="True"
/>
<label for="enable-random-events">
  <div class="tooltip">
    Enable random events
    <span class="tooltiptext"
      >Allows the scenario to give you unexpected events such as pan pan calls
      from other aircraft</span
    >
  </div>
</label><br />
<button on:click={handleClick}>Generate Scenario</button>
