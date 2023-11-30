<script lang="ts">
	import '../app.postcss';
	import { AppShell } from '@skeletonlabs/skeleton';
	import { autoModeWatcher } from '@skeletonlabs/skeleton';
	import TopAppBar from '$lib/LinkButtons/TopAppBar.svelte';
	import { initializeStores, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import Navigation from '$lib/Sidebars/NavigationSidebar.svelte';
	import type { SimulatorSettings } from '$lib/lib/States';
	import { Modal } from '@skeletonlabs/skeleton';
	import SimulatorSettingsSidebar from '$lib/Sidebars/SimulatorSettingsSidebar.svelte';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();

	const drawerStore = getDrawerStore();

	function drawerOpen(): void {
		drawerStore.open({});
	}

	// Holds status of major navigation elements, to control visibility
	let classesSidebar: string;
	let classesAppBar: string;
	let burgerButton: string;
	let topBarEnabled: boolean;

	// Reactive Classes
	$: if ($page.url.pathname === '/') {
		// If on homepage hide sidebar and ways to access it as user is not logged in
		classesAppBar = 'w-auto';
		classesSidebar = 'w-0';
		burgerButton = 'lg:hidden';
		topBarEnabled = true;
	} else if ($page.url.pathname.includes('/scenario')) {
		// Should also check if user is logged in
		// If in a scenario hide sidebar and top app bar to fit everything in
		classesAppBar = 'w-0';
		classesSidebar = 'w-0';
		burgerButton = '';
		topBarEnabled = false;
	} else {
		// Otherwise user is logged in and sidebar can be shown
		classesAppBar = 'w-auto';
		classesSidebar = 'w-0 lg:w-64';
		burgerButton = 'lg:hidden';
		topBarEnabled = true;
	}
</script>

<!-- Enable system theme -->
<svelte:head
	>{@html `<script>${autoModeWatcher.toString()} autoModeWatcher();</script>`}</svelte:head
>

<!-- Settings Drawer -->
<Drawer width="w-64">
	<h2 class="p-4">Simulator Settings</h2>
	<hr />
	{#if classesSidebar == 'w-0'}
		<SimulatorSettingsSidebar />
	{:else}
		<Navigation />
	{/if}
</Drawer>

<Modal />

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 {classesSidebar}" slotHeader={classesAppBar}>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<TopAppBar {burgerButton} enabled={topBarEnabled} on:burgerButtonClicked={drawerOpen} />
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<!-- Navigation -->
		{#if classesSidebar == 'w-0'}
			<SimulatorSettingsSidebar />
		{:else}
			<Navigation />
		{/if}
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>

<style lang="postcss">
	@font-face {
		font-family: 'Geist';
		font-style: normal;
		font-weight: 100;
		src: url('/fonts/GeistVF.woff2') format('woff2');
	}

	@font-face {
		font-family: 'DSEG7ClassicMini';
		font-style: normal;
		font-weight: 100;
		src: url('/fonts/DSEG7ClassicMini-Regular.woff2') format('woff2');
	}
</style>
