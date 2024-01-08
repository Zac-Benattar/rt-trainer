<script lang="ts">
	import GenerateScenarioButton from '../lib/LinkButtons/GenerateScenarioButton.svelte';
</script>

<div class="container mx-auto p-8 space-y-8">
	<h1 class="h1">Welcome to RT Trainer</h1>
	<p class="text-xl">
		RT Trainer is a web application that lets you practice your radio communication skills.
	</p>
	<section>
		<GenerateScenarioButton />
	</section>
</div>

<style lang="postcss">
	.h1 {
		font-size: 3rem;
	}
</style>
