<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	export let parent: any;

	function onAccept() {
		if ($modalStore[0].response) $modalStore[0].response(true);
		parent.onClose();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cBody = 'px-4';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>RT-Trainer Privacy Policy</header>
		<article class={cBody}>
			We currently collect and process the following information:
			<ul class="list-disc py-1 px-5">
				<li>
					Email Address (only if provided to us by the chosen OAuth login provider - Google,
					Facebook, etc.)
				</li>
				<li>
					Your routes, scenarions, chosen callsign, chosen prefix, chosen aircraft type and radio
					call accuracy statistics
				</li>
				<li>
					Anonymised analyical page use data, specifically <a
						href="https://github.com/vercel/analytics?tab=readme-ov-file">Vercel Analytics</a
					>. See the <a href="https://vercel.com/legal/privacy-policy">Vercel Privacy Policy</a>
				</li>
			</ul>
			We use this information to:
			<ul class="list-disc py-1 px-5">
				<li>Provide and maintain our Service</li>
				<li>Notify you about changes to our Service</li>
				<li>
					Allow you to participate in interactive features of our Service when you choose to do so
				</li>
				<li>Gather analysis or valuable information so that we can improve our Service</li>
				<li>Monitor the usage of our Service</li>
				<li>Detect, prevent and address technical issues</li>
				<li>
					The use of your email address is limited only to connecting your data in our database with
					your chosen OAuth login provider. We do not send any marketing or promotional emails.
				</li>
			</ul>
			<br />
			We store this information for the duration of your account's existence. If you wish to have your
			account and all associated data deleted, please contact the developer at zbenattar@gmail.com. All
			data is stored in a Planetscale database, and is not shared with any third parties. See
			<a href="https://planetscale.com/docs/concepts/security">Planetscale's security policy</a>.
			<br /><br />
			This project is open source, and the code can be found
			<a href="https://github.com/Zac-Benattar/rt-trainer">on GitHub</a>, user data is not shared as
			part of the codebase, and is not publicly accessible to any visiters or contributers to the
			repository<br /><br />
			We reserve the right to update this privacy policy at any time. Changes and clarifications will
			take effect immediately upon their posting on the website. <br /><br />
			<b>Your data protection rights Under data protection law, you have rights including:</b>
			<ul class="list-disc py-1 px-5">
				<li>
					Your right of access - You have the right to ask us for copies of your personal
					information.
				</li>
				<li>
					Your right to rectification - You have the right to ask us to rectify personal information
					you think is inaccurate. You also have the right to ask us to complete information you
					think is incomplete.
				</li>
				<li>
					Your right to erasure - You have the right to ask us to erase your personal information in
					certain circumstances.
				</li>
				<li>
					Your right to restriction of processing - You have the right to ask us to restrict the
					processing of your personal information in certain circumstances.
				</li>
				<li>
					Your right to object to processing - You have the the right to object to the processing of
					your personal information in certain circumstances.
				</li>
				<li>
					Your right to data portability - You have the right to ask that we transfer the personal
					information you gave us to another organisation, or to you, in certain circumstances.
				</li>
			</ul>
			<br />
			You are not required to pay any charge for exercising your rights. If you make a request, we have
			one month to respond to you. Please contact us at zbenattar@gmail.com if you wish to make a request.
			If you have any concerns about our use of your personal information, you can make a complaint to
			the developer at zbenattar@gmail.com. <br />You can also complain to the ICO if you are
			unhappy with how we have used your data. The ICO’s address: <br />
			<ul class="p-2">
				<li>Information Commissioner’s Office</li>
				<li>Wycliffe House</li>
				<li>Water Lane</li>
				<li>Wilmslow</li>
				<li>Cheshire</li>
				<li>SK9 5AF</li>
				<li />
			</ul>
			Helpline number: 0303 123 1113<br />ICO website: https://www.ico.org.uk
		</article>
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>Close</button>
			<button class="btn {parent.buttonPositive}" on:click={onAccept}>Accept</button>
		</footer>
	</div>
{/if}
