<script lang="ts">
	import GenerateScenarioButton from '../lib/Components/GenerateScenarioCard.svelte';
</script>

<div class="container mx-auto p-8 space-y-8">
	<h1 class="h1">Welcome to RT Trainer</h1>
	<p class="text-xl">
		RT Trainer is a web application that lets you practice your radio communication skills. <br />
	</p>

	<section>
		<div class="flex flex-row justify-start gap-x-10">
			<div class="card bg-warning-500 p-4 max-w-50">
				<h3 class="h3">Please Read</h3>
				<p class="text-l">
					This is an early release of RT Trainer. Expect many bugs and missing features. It is
					recommended to use dark mode while the theme is not finalised. For voice input to work do
					not use Firefox. To get started, setup a scenario with the "Generate a scenario" card.
				</p>
			</div>
			<GenerateScenarioButton />
		</div>
	</section>
</div>

<style lang="postcss">
	.h1 {
		font-size: 3rem;
	}

	.card {
		max-width: 400px;
	}
</style>
