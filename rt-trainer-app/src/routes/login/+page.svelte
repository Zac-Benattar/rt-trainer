<script lang="ts">
	import { page } from '$app/stores';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import {
		GoogleSolid,
		GithubSolid,
		FacebookSolid,
		QuestionCircleOutline,
		ExclamationCircleOutline
	} from 'flowbite-svelte-icons';
	import { Accordion, AccordionItem, type ModalSettings } from '@skeletonlabs/skeleton';

	import { getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	let privacyPolicyAccepted: boolean = false;

	const handleGoogleSignIn = () => {
		if (privacyPolicyAccepted) signIn('google', { callbackUrl: '/home' });
	};

	const handleFacebookSignIn = () => {
		if (privacyPolicyAccepted) signIn('facebook', { callbackUrl: '/home' });
	};

	const handleGitHubSignIn = () => {
		if (privacyPolicyAccepted) signIn('github', { callbackUrl: '/home' });
	};

	const handleSignOut = () => {
		signOut({ callbackUrl: '/' });
	};

	const showPrivacyPolicyModal = () => {
		new Promise<boolean>((resolve) => {
			const modal: ModalSettings = {
				type: 'component',
				component: 'privacyPolicyComponent',
				response: (r: boolean) => {
					resolve(r);
				}
			};
			modalStore.trigger(modal);
		}).then((r: any) => {
			if (r) privacyPolicyAccepted = true;
		});
	};
</script>

<div class="flex flex-row place-content-center h-full w-full">
	<div class="flex flex-col p-5 place-content-center h-full w-full gap-5 sm:w-8/12">
		{#if !$page.data.session}
			<div class="flex flex-row place-content-center">
				<div class="card p-5 space-y-6 shadow-xl sm:max-w-xs">
					<p class="font-semibold">Welcome, login with</p>
					<div class="flex flex-col space-y-4 space-x-0">
						<button class="btn variant-ringed-surface gap-2" on:click={handleGoogleSignIn}
							><GoogleSolid />Google</button
						>
						<button
							class="btn text-white gap-2"
							style="background-color: #4267B2;"
							disabled
							on:click={handleFacebookSignIn}><FacebookSolid /> Facebook</button
						>
						<button
							class="btn text-white gap-2"
							style="background-color: #324792;"
							on:click={handleGitHubSignIn}><GithubSolid /> GitHub</button
						>
					</div>
					<label class="flex items-center space-x-2">
						<input class="checkbox" type="checkbox" bind:checked={privacyPolicyAccepted} />
						<p>
							I have read and accepted the <button
								on:click={showPrivacyPolicyModal}
								class="text-indigo-600">Privacy Policy</button
							>
						</p>
					</label>
				</div>
			</div>
			<div class="flex flex-row place-content-center">
				<div class="card py-2 px-3 space-y-6 shadow-xl sm:max-w-xl">
					<Accordion autocollapse>
						<AccordionItem>
							<svelte:fragment slot="lead"><QuestionCircleOutline /></svelte:fragment>
							<svelte:fragment slot="summary"
								>Why can't I use an email and password?</svelte:fragment
							>
							<svelte:fragment slot="content"
								>For now the answer is that it is too time consuming to setup. It will be considered
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
