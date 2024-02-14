<script lang="ts">
	import { AppBar, LightSwitch } from '@skeletonlabs/skeleton';
	import { Avatar } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let burgerButton: string;
	export let enabled: boolean;

	let userInitials: string = '  ';
	let userImage: string;
	if ($page.data.session && $page.data.session.user) {
		if ($page.data.session.user.name)
			userInitials = $page.data.session.user.name
				.split(' ')
				.map((n) => n[0])
				.join('');
		if ($page.data.session.user.image) userImage = $page.data.session.user.image;
	}

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
				<button
					class="{burgerButton} btn btn-sm mr-4"
					on:click={burgerButtonClicked}
					on:keypress={burgerButtonClicked}
				>
					<span>
						<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
							<rect width="100" height="20" />
							<rect y="30" width="100" height="20" />
							<rect y="60" width="100" height="20" />
						</svg>
					</span>
				</button>
				<strong
					><a href="/" class="btn text-xl sm:text-2xl uppercase" data-sveltekit-preload-data="hover"
						>RT Trainer</a
					></strong
				>
			</div>
		</svelte:fragment>

		<svelte:fragment slot="trail">
			<LightSwitch />
			{#if $page.data.session != null}
				<a class="btn-icon variant-ghost-surface" href="/profile"
					><Avatar
						src={userImage}
						fallback={userInitials}
						initials="ZB"
						border="border-4 border-surface-300-600-token hover:!border-primary-500"
						cursor="cursor-pointer"
						data-sveltekit-preload-data="hover"
					/></a
				>
			{:else}
				<button on:click={() => goto('/login')}>Sign In</button>
			{/if}
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
