<script lang="ts">
	import { AppBar, LightSwitch } from '@skeletonlabs/skeleton';
	// import { Avatar } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';

	export let burgerButton: string;
	export let enabled: boolean;

	const dispatch = createEventDispatcher();

	const burgerButtonClicked = () => {
		dispatch('burgerButtonClicked');
	};
</script>

<!-- Hide app bar if not enabled -->
{#if enabled}
	<AppBar padding="py-2 px-4 sm:p-4">
		<svelte:fragment slot="lead">
			<div class="flex items-center">
				<button class="{burgerButton} btn btn-sm mr-4" on:click={burgerButtonClicked} on:keypress={burgerButtonClicked}>
					<span>
						<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
							<rect width="100" height="20" />
							<rect y="30" width="100" height="20" />
							<rect y="60" width="100" height="20" />
						</svg>
					</span>
				</button>
				<strong><a href="/" class="btn text-xl sm:text-2xl uppercase" data-sveltekit-preload-data="hover">RT Trainer</a
					></strong>
			</div>
		</svelte:fragment>

		<svelte:fragment slot="trail">
			<LightSwitch />
			<!-- <a class="btn-icon variant-ghost-surface" href="/profile"
				><Avatar
					src="https://i.pravatar.cc/"
					fallback="/images/headshot.png"
					initials="ZB"
					border="border-4 border-surface-300-600-token hover:!border-primary-500"
					cursor="cursor-pointer"
					data-sveltekit-preload-data="hover"
				/></a
			> -->
		</svelte:fragment>
	</AppBar>
{:else}
<!-- Show burger button if the appbar is not enabled -->
	<div>
		<button class="{burgerButton} btn btn-sm mr-4" on:click={burgerButtonClicked}>
			<span>
				<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
					<rect width="100" height="20" />
					<rect y="30" width="100" height="20" />
					<rect y="60" width="100" height="20" />
				</svg>
			</span>
		</button>
	</div>
{/if}
