<script lang="ts">
	import { goto } from '$app/navigation';
	import { updated } from '$app/stores';
	import SvgDisplay from '$lib/Components/SVGDisplay.svelte';
	import { ClearSimulationStores } from '$lib/stores';
</script>

{#if $updated}
	<div class="toast">
		<p>
			A new version of the app is available

			<button on:click={() => location.reload()}> Reload the page </button>
		</p>
	</div>
{/if}

<div class="container mx-auto max-w-screen-lg p-5 tracking-wide">
	<div class="grid grid-cols-1 md:grid-cols-12 gap-5">
		<div class="space-y-4 md:col-span-6 p-4">
			<h1 class="text-3xl md:text-5xl font-bold leading-10">
				RT Trainer - A <span
					class="relative px-1 md:px-3 x-1 inset-y-1 bg-surface-300-600-token hover:rotate-3 hover:scale-110 transition-transform duration-300 ease-in-out"
					>responsive</span
				> FRTOL practice tool
			</h1>
			<p class="max-w-xl opacity-60">
				Gain confidence in your radio telephony skills by practicing with our RT trainer directly in
				your browser.
			</p>
			<ul class="list-items">
				<li>
					<span class="shrink-0 btn-icon bg-surface-300-600-token py-0">✔️</span>
					<span>
						<b>Supports voice input</b> – speak your radio calls out loud, just like in real life
					</span>
				</li>
				<li>
					<span class="shrink-0 btn-icon bg-surface-300-600-token">✔️</span>
					<span>
						<b>Generate practice scenarios</b> – routes are generated randomly, no more repetition
					</span>
				</li>
				<li>
					<span class="shrink-0 btn-icon bg-surface-300-600-token">✔️</span>
					<span>
						<b>Get instant feedback</b> – see how well you did and where you can improve
					</span>
				</li>
			</ul>
			<div class="flex flex-wrap gap-4">
				<button
					on:click={() => {
						ClearSimulationStores();
						goto('/simulator/?tutorial=true');
					}}
					class="btn md:btn-lg w-full md:w-fit variant-filled-primary"
					data-sveltekit-preload-data="hover">Quick route</button
				>
				<button
					on:click={() => {
						ClearSimulationStores();
						goto('/scenario-planner');
					}}
					class="btn md:btn-lg w-full md:w-fit variant-filled-surface"
					data-sveltekit-preload-data="hover">Create a scenario</button
				>
			</div>
		</div>

		<SvgDisplay name="planeHero" width="500px" height="500px" class="my-2 p-2 sm:col-span-6" />
	</div>
</div>

<style>
	.list-items li {
		display: flex;
		gap: 16px;
		padding: 12px 0px;
	}

	.btn-icon {
		width: 40px;
		height: 40px;
	}
</style>
