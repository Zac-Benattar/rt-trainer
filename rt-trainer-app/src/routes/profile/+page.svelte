<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
</script>

<div>User's profile - nothing here right now</div>
<div>
	<button
		on:click={() => {
			signOut();
		}}>Sign Out</button
	>
</div>
