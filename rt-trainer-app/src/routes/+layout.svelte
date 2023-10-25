<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { autoModeWatcher } from '@skeletonlabs/skeleton';
	import Navigation from '$lib/Navigation/Navigation.svelte';
	import TopAppBar from '$lib/Navigation/TopAppBar.svelte';
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

	let classesSidebar: string;
	let classesAppBar: string;
	let burgerButton: string;
	let topBarEnabled: boolean;
	// Reactive Classes
	$: if ($page.url.pathname === '/') {
		classesSidebar = 'w-0';
		burgerButton = 'lg:hidden';
		classesAppBar = 'w-auto';
		topBarEnabled = true;
	} else if ($page.url.pathname.includes('/scenario')) {
		// Should also check if user is logged in
		classesSidebar = 'w-0';
		classesAppBar = 'w-0';
		burgerButton = '';
		topBarEnabled = false;
	} else {
		classesSidebar = 'w-0 lg:w-64';
		classesAppBar = 'w-auto';
		burgerButton = 'lg:hidden';
		topBarEnabled = true;
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
<AppShell slotSidebarLeft="bg-surface-500/5 {classesSidebar}" slotHeader="{classesAppBar}">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<TopAppBar {burgerButton} enabled={topBarEnabled} on:burgerButtonClicked={drawerOpen}/>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<!-- Navigation -->
		<Navigation />
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
