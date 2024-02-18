<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="flex flex-col place-content-center">
	<div class="flex flex-row p-3 place-content-center sm:place-content-start">
		<div class="flex flex-col px-2 xs:w-9/12 gap-2">
			<form class="flex flex-col gap-2" method="POST" action="?/updateProfileInformation">
				<label class="label">
					<span>Prefix</span>
					<select class="select" id="prefix-select" name="prefix">
						<option value="" selected={data.userDetails?.prefix == ''}>None</option>
						<option
							value="STUDENT"
							selected={data.userDetails == null || data.userDetails?.prefix == 'STUDENT'}
							>Student</option
						>
						<option value="HELICOPTER" selected={data.userDetails?.prefix == 'HELICOPTER'}
							>Helicopter</option
						>
						<option value="POLICE" selected={data.userDetails?.prefix == 'POLICE'}>Police</option>
					</select>
				</label>

				<label class="label">
					<span>Callsign</span>
					<input
						class="input"
						name="callsign"
						id="callsign-input"
						type="text"
						value={data.userDetails?.callsign ?? 'Null'}
						minlength="6"
						maxlength="20"
						pattern="[\x00-\x7F]+"
					/>
				</label>

				<label class="label">
					<span>Aircraft Type</span>
					<input
						class="input"
						name="aircraftType"
						id="aircraft-type-input"
						type="text"
						value={data.userDetails?.aircraftType ?? 'Null'}
						minlength="6"
						maxlength="30"
						pattern="[\x00-\x7F]+"
					/>
				</label>
				
				<button class="btn variant-filled mt-2">Update Details</button>
			</form>
		</div>
	</div>
</div>
