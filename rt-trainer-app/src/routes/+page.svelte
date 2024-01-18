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
				<p class="text-l p-3">
					<li>This is an early release of RT Trainer. Expect many bugs and missing features.</li>
					<li>
						<b>RT Trainer is not a replacement for real world training.</b>
					</li>
					<li>
						The information provided by the system is not accurate to the real world. Routes
						generated may be impossible to fly and do not reflect the routes found in the R/T exam.
					</li>
					<li>
						It is recommended to use dark mode while the theme is not finalised. Flip the toggle
						switch on the naviagtion bar at the top of the screen to switch between light and dark
						mode.
					</li>
					<li>
						For voice input to work use a Chromium based browser such as Google Chrome or Microsoft
						Edge, or use Safari.
					</li>
					<li>To get started, setup a scenario with the "Generate a scenario" card.</li>
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
