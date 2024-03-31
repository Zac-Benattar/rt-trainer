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
	const cBody = 'px-4 flex flex-col gap-3';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>RT-Trainer Privacy Policy</header>
		<article class={cBody}>
			<div><i>Last updated 31st March 2024</i></div>

			<div>
				We currently collect and process the following information:
				<ul class="list-disc py-1 px-5">
					<li>
						Email Address (only if provided to us by the chosen OAuth login provider - Google,
						Facebook, etc.)
					</li>
					<li>
						Your routes, scenarios, chosen callsign, chosen prefix, chosen aircraft type and radio
						call accuracy statistics
					</li>
				</ul>
			</div>

			<div>
				This information is used to provide and maintain our Service. The use of your email address
				specifically is limited only to connecting your data in our database with your chosen OAuth
				login provider to provide the login service. We do not send any marketing or promotional
				emails, or share your data with third parties.
			</div>

			<div>
				We store this information for the duration of your account's existence. If you wish to have
				your account and all associated data deleted, please contact the developer at
				zbenattar@gmail.com. All user data is stored in a Vercel Postgres database, and is not
				shared with any third parties. See
				<a class="anchor" href="https://vercel.com/docs/storage/vercel-postgres">Vercel's docs</a>.
			</div>

			<div>
				We reserve the right to update this privacy policy at any time. Changes and clarifications
				will take effect immediately upon their posting on the website.
			</div>

			<div>
				<b>Your data protection rights Under data protection law, you have rights including:</b>
				<ul class="list-disc py-1 px-5">
					<li>
						Your right of access - You have the right to ask us for copies of your personal
						information.
					</li>
					<li>
						Your right to rectification - You have the right to ask us to rectify personal
						information you think is inaccurate. You also have the right to ask us to complete
						information you think is incomplete.
					</li>
					<li>
						Your right to erasure - You have the right to ask us to erase your personal information
						in certain circumstances.
					</li>
					<li>
						Your right to restriction of processing - You have the right to ask us to restrict the
						processing of your personal information in certain circumstances.
					</li>
					<li>
						Your right to object to processing - You have the the right to object to the processing
						of your personal information in certain circumstances.
					</li>
					<li>
						Your right to data portability - You have the right to ask that we transfer the personal
						information you gave us to another organisation, or to you, in certain circumstances.
					</li>
				</ul>
				<br />
				You are not required to pay any charge for exercising your rights. If you make a request, we
				have one month to respond to you. Please contact us at zbenattar@gmail.com if you wish to make
				a request. If you have any concerns about our use of your personal information, you can make
				a complaint to the developer at zbenattar@gmail.com. <br />You can also complain to the ICO
				if you are unhappy with how we have used your data. The ICO’s address: <br />
				<ul class="p-2">
					<li>Information Commissioner’s Office</li>
					<li>Wycliffe House</li>
					<li>Water Lane</li>
					<li>Wilmslow</li>
					<li>Cheshire</li>
					<li>SK9 5AF</li>
				</ul>
				Helpline number: 0303 123 1113<br />ICO website:
				<a class="anchor" href="https://www.ico.org.uk">https://www.ico.org.uk</a>
			</div>
		</article>
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>Close</button>
			<button class="btn {parent.buttonPositive}" on:click={onAccept}>Accept</button>
		</footer>
	</div>
{/if}
