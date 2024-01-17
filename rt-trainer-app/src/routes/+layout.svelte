<script lang="ts">
	import '../app.postcss';
	import TopAppBar from '$lib/LinkButtons/TopAppBar.svelte';
	import {
		AppShell,
		autoModeWatcher,
		initializeStores,
		Drawer,
		getDrawerStore,
		storePopup,
		Modal,
		Toast
	} from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import Navigation from '$lib/Simulator/Sidebar.svelte';
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

	// Reactive Classes
	$: if ($page.url.pathname === '/') {
		// If on homepage hide sidebar and ways to access it as user is not logged in
		classesAppBar = 'w-auto';
		classesSidebar = 'w-0';
		burgerButton = 'lg:hidden';
	} else if ($page.url.pathname.search('/scenario') != -1) {
		// If on scenario page hide sidebar and ways to access it as user is not logged in
		classesAppBar = 'w-auto';
		classesSidebar = 'w-0';
		burgerButton = 'lg';
	} else {
		// Otherwise user is logged in and sidebar can be shown
		classesAppBar = 'w-auto';
		classesSidebar = 'w-0 lg:w-64';
		burgerButton = 'lg';
	}
</script>

<!-- Enable system theme -->
<svelte:head
	>{@html `<script>${autoModeWatcher.toString()} autoModeWatcher();</script>`}</svelte:head
>

<!-- Settings Drawer -->
<Drawer width="w-64">
	<h2 class="p-4">Navigation</h2>
	<hr />

	<Navigation />
</Drawer>

<Modal />

<Toast />

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 appbar {classesSidebar}" slotHeader={classesAppBar}>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<TopAppBar {burgerButton} enabled={true} on:burgerButtonClicked={drawerOpen} />
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<!-- Navigation -->
		{#if !($page.url.pathname.search('/scenario') != -1 || $page.url.pathname === '/')}
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

	.appbar {
		height: 70;
	}
</style>
