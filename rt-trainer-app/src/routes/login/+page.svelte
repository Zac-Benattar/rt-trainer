<script>
	// import IconBrandGoogle from 'virtual:icons/logos/google-icon';
	// import IconBrandFacebook from 'virtual:icons/logos/facebook';

	import { page } from '$app/stores';
	import { signIn, signOut } from '@auth/sveltekit/client';

	let email = '';

	const handleEmailSignIn = () => {
		// handle email provider sign in
	};

	const handleGoogleSignIn = () => {
		signIn('google', { callbackUrl: '/home' });
	};

	const handleGitHubSignIn = () => {
		// handle GitHub OAuth sign in
		signIn('github', { callbackUrl: '/home' });
	};

	const handleSignOut = () => {
		signOut({ callbackUrl: '/'});
	};
</script>

<div class="flex flex-col p-5 place-content-center">
	<div class="flex flex-row p-5 place-content-center">
		{#if !$page.data.session}
			<div class="card p-5 space-y-6 shadow-xl">
				<p class="font-semibold">Welcome, login with</p>
				<div class="flex flex-col space-y-4 space-x-0">
					<button class="btn variant-ringed-surface md:w-5/12 gap-2" on:click={handleGoogleSignIn}
						>Google</button
					>
					<button
						class="btn text-white md: w-5/12 gap-2"
						style="background-color: #4267B2;"
						on:click={handleGitHubSignIn}>GitHub</button
					>
				</div>
			</div>
		{:else}
			<div class="card p-6 space-y-6 shadow-xl w-48">
				<div class="flex flex-wrap space-y-4 space-x-0 md:flex-nowrap md:space-x-4 md:space-y-0">
					<button class="btn variant-ringed-surface w-full gap-2" on:click={handleSignOut}
						>Sign Out</button
					>
				</div>
			</div>
		{/if}
	</div>
</div>
