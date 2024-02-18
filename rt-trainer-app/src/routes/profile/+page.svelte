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

	<div>
		<label class="label">
			<span>Prefix</span>
			<select class="select" id="prefix-select">
				<option value="">None</option>
				<option value="STUDENT" selected>Student</option>
				<option value="HELICOPTER">Helicopter</option>
				<option value="POLICE">Police</option>
			</select>
		</label>
	</div>

	<div>
		<label class="label">
			<span>Callsign</span>
			<input
				class="input"
				title="Callsign"
				id="callsign-input"
				type="text"
				placeholder="G-OFLY"
				minlength="6"
				maxlength="20"
				pattern="[\x00-\x7F]+"
			/>
		</label>
	</div>
	<div>
		<label class="label">
			<span>Aircraft Type</span>
			<input
				class="input"
				title="Aircraft Type"
				id="aircraft-type-input"
				type="text"
				placeholder="Cessna 172"
				minlength="6"
				maxlength="30"
				pattern="[\x00-\x7F]+"
			/>
		</label>
	</div>
</div>
