<script lang="ts">
	import '../app.postcss';
	import TopAppBar from '$lib/Components/TopAppBar.svelte';
	import {
		AppShell,
		autoModeWatcher,
		initializeStores,
		Drawer,
		getDrawerStore,
		storePopup,
		Modal,
		Toast,
		type ModalComponent
	} from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import Navigation from '$lib/Components/NAVSidebar.svelte';
	import RoutePlanSiderbar from '$lib/Components/RoutePlanSiderbar.svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import SvelteSeo from 'svelte-seo';
	import 'reflect-metadata';
	import PrivacyPolicyModal from '$lib/Components/Modals/PrivacyPolicyModal.svelte';
	import CreateRouteModal from '$lib/Components/Modals/CreateRouteModal.svelte';

	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();

	const drawerStore = getDrawerStore();

	function drawerOpen(): void {
		drawerStore.open({});
	}

	const modalRegistry: Record<string, ModalComponent> = {
		// Set a unique modal ID, then pass the component reference
		privacyPolicyComponent: { ref: PrivacyPolicyModal },
		createRouteComponent: { ref: CreateRouteModal }
	};

	// Holds status of major navigation elements, to control visibility
	let showTopAppBar: boolean = true;
	let showNavigation: boolean = false;
	let showRoutePlanSidebar: boolean = false;
	let classesSidebar: string;
	let classesAppBar: string;
	let burgerButton: string;

	// Reactive Classes
	$: if ($page.url.pathname === '/' || $page.url.pathname.includes('/login')) {
		// If on homepage hide sidebar and ways to access it as user is not logged in
		showTopAppBar = true;
		showNavigation = false;
		showRoutePlanSidebar = false;
		classesAppBar = 'w-auto';
		classesSidebar = 'w-0';
		burgerButton = 'lg:hidden';
	} else if ($page.url.pathname.includes('/simulator') || $page.url.pathname.includes('/results')) {
		// If on scenario page hide sidebar and show burger button
		showTopAppBar = true;
		showNavigation = false;
		showRoutePlanSidebar = false;
		classesAppBar = 'w-auto';
		classesSidebar = 'w-0';
		burgerButton = 'lg';
	} else if ($page.url.pathname.includes('/routeplanner')) {
		// If on route planner page hide sidebar and show burger button
		showTopAppBar = false;
		showNavigation = false;
		showRoutePlanSidebar = true;
		classesAppBar = 'w-auto';
		classesSidebar = 'w-0 lg:w-80';
		burgerButton = 'lg:hidden';
	} else {
		// Otherwise user is logged in and sidebar can be shown
		showTopAppBar = true;
		showNavigation = true;
		showRoutePlanSidebar = false;
		classesAppBar = 'w-auto';
		classesSidebar = 'w-0 lg:w-64';
		burgerButton = 'lg:hidden';
	}
</script>

<SvelteSeo
	title="RT Trainer | FRTOL Practice"
	description="Gain confidence in your RT skills with our FRTOL practice tool. Practice your RT skills with our randomly generated scenarios and get instant feedback on your performance. Speak or type your radio calls. Share routes with friends and instructors. Use the simulated cockpit controls."
	keywords="frtol, rt, radio, trainer, practice, atc, air traffic control, pilot, aviation, flight, simulator, training, route, generation, cap413, radio telephony, radiotelephony, pilots license, exam, frtol exam, test, frtol test"
	notranslate={true}
	applicationName="RT Trainer"
/>

<!-- Enable system theme -->
<svelte:head
	>{@html `<script>${autoModeWatcher.toString()} autoModeWatcher();</script>`}</svelte:head
>

<!-- Navigatiton Drawer -->
<Drawer width="w-64">
	{#if showRoutePlanSidebar}
		<RoutePlanSiderbar />
	{:else if showNavigation}
		<h2 class="p-4">Navigation</h2>
		<hr />

		<Navigation />
	{/if}
</Drawer>

<Modal components={modalRegistry} />

<Toast />

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 appbar {classesSidebar}" slotHeader={classesAppBar}>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		{#if showTopAppBar}
			<TopAppBar {burgerButton} enabled={true} on:burgerButtonClicked={drawerOpen} />
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<!-- Navigation -->
		{#if showNavigation}
			<Navigation />
		{:else if showRoutePlanSidebar}
			<RoutePlanSiderbar />
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="pageFooter">
		{#if $page.url.pathname === '/'}
			<div class="flex flex-col place-items-center grow-0 p-2">
				<p class="text-slate-600">
					Homepage image by <a
						href="https://pixabay.com/users/clker-free-vector-images-3736/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=26563"
						>Clker-Free-Vector-Images</a
					>
					from
					<a
						href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=26563"
						>Pixabay</a
					>
				</p>
			</div>
		{/if}</svelte:fragment
	>
	<!-- Page Route Content -->
	<slot />
</AppShell>

<style lang="postcss">
	@font-face {
		font-family: 'DSEG7ClassicMini';
		font-style: normal;
		font-weight: 100;
		src: url('/fonts/DSEG7ClassicMini-Regular.woff2') format('woff2');
		font-display: swap;
	}
</style>
