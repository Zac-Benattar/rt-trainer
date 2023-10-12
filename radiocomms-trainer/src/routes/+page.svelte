<script>
    import { goto } from '$app/navigation';
    export let exampleScenarioId = Math.floor(Math.random() * 1000000);

    const handleClick = () => {
        goto('/scenario/' + exampleScenarioId);
    }
</script>

<h1>Welcome to RT Trainer</h1>

<p>RT Trainer is a web application that allows you to practice your radio communication skills.</p>
<button on:click={handleClick}>Generate Scenario </button>
<a href="/about">About</a>

