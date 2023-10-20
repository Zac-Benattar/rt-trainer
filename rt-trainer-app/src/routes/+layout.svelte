<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { Avatar } from '@skeletonlabs/skeleton';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { autoModeWatcher } from '@skeletonlabs/skeleton';
	import Navigation from '$lib/Navigation/Navigation.svelte';
	import { initializeStores, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();

	const drawerStore = getDrawerStore();

	function drawerOpen(): void {
		drawerStore.open({});
	}

	// Reactive Classes
	$: classesSidebar = $page.url.pathname;
	$: burgerButton = $page.url.pathname;
	$: if ($page.url.pathname === '/') {
		classesSidebar = 'w-0';
		burgerButton = 'hidden';
	} else if ($page.url.pathname.includes('/scenario')) {
		// Should also check if user is logged in
		classesSidebar = 'w-0';
		burgerButton = 'block';
	} else {
		classesSidebar = 'w-0 lg:w-64';
		burgerButton = 'hidden';
	}
</script>

<!-- Enable system theme -->
<svelte:head
	>{@html `<script>${autoModeWatcher.toString()} autoModeWatcher();</script>`}</svelte:head
>

<Drawer width="w-64">
	<h2 class="p-4">Navigation</h2>
	<hr />
	<Navigation />
</Drawer>

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 {classesSidebar}">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="flex items-center">
					<button class="lg:{burgerButton} btn btn-sm mr-4" on:click={drawerOpen}>
						<span>
							<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
								<rect width="100" height="20" />
								<rect y="30" width="100" height="20" />
								<rect y="60" width="100" height="20" />
							</svg>
						</span>
					</button>
					<strong class="text-xl uppercase">RT Trainer</strong>
				</div>
			</svelte:fragment>

			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/Zac-Benattar/csproj/"
					target="_blank"
					rel="external"
				>
					GitHub
				</a>

				<!-- on:click not working! -->
				<a class="btn btn-sm variant-ghost-surface" href="/profile"
					><Avatar
						src="https://i.pravatar.cc/"
						fallback="https://i.pravatar.cc/"
						initials="ZB"
						border="border-4 border-surface-300-600-token hover:!border-primary-500"
						cursor="cursor-pointer"
						data-sveltekit-preload-data="hover"
					/></a
				>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<Navigation />
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
