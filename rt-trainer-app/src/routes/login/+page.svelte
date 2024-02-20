<script lang="ts">
	// import IconBrandGoogle from 'virtual:icons/logos/google-icon';
	// import IconBrandFacebook from 'virtual:icons/logos/facebook';

	import { page } from '$app/stores';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import {
		GoogleSolid,
		GithubSolid,
		FacebookSolid,
		QuestionCircleOutline,
		ExclamationCircleOutline
	} from 'flowbite-svelte-icons';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';

	let warningVisible: boolean = true;

	const handleEmailSignIn = () => {
		// handle email provider sign in
	};

	const handleGoogleSignIn = () => {
		signIn('google', { callbackUrl: '/home' });
	};

	// const handleFacebookSignIn = () => {
	// 	// handle Facebook OAuth sign in
	// 	signIn('facebook', { callbackUrl: '/home' });
	// };

	const handleGitHubSignIn = () => {
		// handle GitHub OAuth sign in
		signIn('github', { callbackUrl: '/home' });
	};

	const handleSignOut = () => {
		signOut({ callbackUrl: '/' });
	};

	const handleWarningAccept = () => {
		warningVisible = false;
	};
</script>

<div class="flex flex-row place-content-center h-full w-full">
	<div class="flex flex-col p-5 place-content-center h-full w-full gap-5 sm:w-8/12">
		{#if !$page.data.session}
			{#if warningVisible}
				<div class="flex flex-row place-content-center">
					<div class="">
						<aside class="alert variant-filled-error">
							<!-- Icon -->
							<div><ExclamationCircleOutline /></div>
							<!-- Message -->
							<div class="alert-message">
								<h3 class="h3">Warning</h3>
								<p>
									This is a very early version of RT Trainer. Your routes, scenarios and statistics
									may be deleted or modified without warning while the system is finalised. Please
									report any issues you find.
								</p>
							</div>
							<!-- Actions -->
							<div class="alert-actions">
								<button class="btn-xl variant-filled" on:click={handleWarningAccept}
									>I accept that my data may be deleted</button
								>
							</div>
						</aside>
					</div>
				</div>
			{/if}
			<div class="flex flex-row place-content-center">
				<div class="card p-5 space-y-6 shadow-xl sm:max-w-xs">
					<p class="font-semibold">Welcome, login with</p>
					<div class="flex flex-col space-y-4 space-x-0">
						<button class="btn variant-ringed-surface gap-2" on:click={handleGoogleSignIn}
							><GoogleSolid />Google</button
						>
						<!-- <button
				class="btn text-white gap-2"
				style="background-color: #4267B2;"
				on:click={handleFacebookSignIn}><FacebookSolid /> Facebook</button
			> -->
						<button
							class="btn text-white gap-2"
							style="background-color: #324792;"
							on:click={handleGitHubSignIn}><GithubSolid /> GitHub</button
						>
					</div>
				</div>
			</div>
			<div class="flex flex-row place-content-center">
				<div class="card py-2 px-3 sm:max-w-xl">
					<Accordion autocollapse>
						<AccordionItem>
							<svelte:fragment slot="lead"><QuestionCircleOutline /></svelte:fragment>
							<svelte:fragment slot="summary"
								>Why can't I use an email and password?</svelte:fragment
							>
							<svelte:fragment slot="content"
								>For now the answer is that it is too complicated to set up. It will be considered
								in the future when the core features are working.</svelte:fragment
							>
						</AccordionItem>
						<AccordionItem>
							<svelte:fragment slot="lead"><QuestionCircleOutline /></svelte:fragment>
							<svelte:fragment slot="summary">Why do I need to sign in?</svelte:fragment>
							<svelte:fragment slot="content"
								>You can track the radio calls you make, save your routes and see your accuracy. It
								also helps prevent abuse of the system. You can try the <a
									class="text-indigo-600"
									href="/scenario/demo">demo route</a
								> without signing in.</svelte:fragment
							>
						</AccordionItem>
						<AccordionItem>
							<svelte:fragment slot="lead"><ExclamationCircleOutline /></svelte:fragment>
							<svelte:fragment slot="summary"
								>I can't sign in with any of these options</svelte:fragment
							>
							<svelte:fragment slot="content"
								>Sorry about this. More sign in providers will be added soon. In the meanwhile you
								can try the <a class="text-indigo-600" href="/scenario/demo">demo route</a> without signing
								in.</svelte:fragment
							>
						</AccordionItem>
					</Accordion>
				</div>
			</div>
		{:else}
			<div class="flex flex-row place-content-center">
				<div class="card p-6 space-y-6 shadow-xl w-48">
					<div class="flex flex-wrap space-y-4 space-x-0 md:flex-nowrap md:space-x-4 md:space-y-0">
						<button class="btn variant-ringed-surface w-full gap-2" on:click={handleSignOut}
							>Sign Out</button
						>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
