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
		signIn('google', { callbackUrl: '/profile' });
	};

	const handleFacebookSignIn = () => {
		// handle Facebook OAuth sign in
	};

	const handleSignOut = () => {
		signOut();
	};
</script>

<div class="flex flex-col p-5 place-content-center">
	<div class="flex flex-row p-5 place-content-center">
		{#if !$page.data.session}
			<div class="card p-5 space-y-6 shadow-xl">
				<p class="font-semibold">Welcome, login with</p>
				<div
					class="flex flex-row flex-wrap space-y-4 space-x-0 md:flex-nowrap md:space-x-4 md:space-y-0"
				>
					<button class="btn variant-ringed-surface md:w-5/12 gap-2" on:click={handleGoogleSignIn}
						>Google</button
					>
					<button
						class="btn text-white md: w-5/12 gap-2"
						style="background-color: #4267B2;"
						on:click={handleFacebookSignIn}>Facebook</button
					>
				</div>
				<div class="text-center">
					<hr class="-mb-4" />
					<span class="bg-surface-100-800-token p-2 text-sm">Or continue with email</span>
				</div>
				<form class="space-y-4">
					<label class="label">
						<span>Email</span>
						<input
							type="email"
							placeholder="your-email@example.com"
							class="input"
							bind:value={email}
						/>
					</label>
					<label class="label">
						<span>Password</span>
						<input type="password" placeholder="Your password" class="input" />
					</label>
				</form>
				<div class="flex justify-between flex-wrap">
					<p class="text-sm unstyled py-2 text-slate-500">
						Don't have an account? <a href="/">Register</a>
					</p>
					<button class="btn variant-filled-primary">Login</button>
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
