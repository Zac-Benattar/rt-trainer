<script lang="ts">
	import { goto } from '$app/navigation';
	import { RangeSlider, SlideToggle } from '@skeletonlabs/skeleton';
	import { AircraftDetailsStore } from '$lib/stores';
	import { generateRandomURLValidString } from '$lib/ts/utils';

	export let seed: string = generateRandomURLValidString(8);
	let airborneWaypoints: number = 2;
	const maxAirborneWaypoints: number = 5;
	let invalidInput: boolean = false;

	const handleClick = () => {
		const enableEmergenciesElement = document.getElementById(
			'emergency-events'
		) as HTMLInputElement;
		let enableEmergencies: boolean = false;
		if (enableEmergenciesElement != null) {
			enableEmergencies = enableEmergenciesElement.checked;
		}

		let prefix = '';
		const prefixInputElement = document.getElementById('prefix-select') as HTMLInputElement;
		if (prefixInputElement != null) {
			if (
				!(
					prefixInputElement.value == '' ||
					prefixInputElement.value == 'STUDENT' ||
					prefixInputElement.value == 'HELICOPTER' ||
					prefixInputElement.value == 'POLICE' ||
					prefixInputElement.value == 'SUPER' ||
					prefixInputElement.value == 'FASTJET' ||
					prefixInputElement.value == 'FASTPROP'
				)
			) {
				invalidInput = true;
			} else {
				prefix = prefixInputElement.value;
			}
		}

		let callsign = '';
		const callsignInputElement = document.getElementById('callsign-input') as HTMLInputElement;
		if (callsignInputElement != null) {
			if (callsignInputElement.value == '') {
				callsign = 'G-OFLY';
			}
		}

		let aircraftType = '';
		const aircraftTypeInputElement = document.getElementById(
			'aircraft-type-input'
		) as HTMLInputElement;
		if (aircraftTypeInputElement != null) {
			if (aircraftTypeInputElement.value == '') {
				aircraftType = 'Cessna 172';
			}
		}

		const scenarioCodeInputElement = document.getElementById(
			'scenario-code-input'
		) as HTMLInputElement;
		if (scenarioCodeInputElement != null) {
			if (scenarioCodeInputElement.value != '') seed = scenarioCodeInputElement.value;
		}

		// If any data is invalid, return
		if (invalidInput) return;

		// Set the aircraft details store
		AircraftDetailsStore.set({
			prefix: prefix,
			callsign: callsign,
			aircraftType: aircraftType
		});

		// Redirect to the scenario page
		let url = '/scenario/' + seed;
		let questionMarkAppended = false;
		if (enableEmergencies) {
			url += '?emergencies=True';
			questionMarkAppended = true;
		}
		if (airborneWaypoints != 2) {
			if (questionMarkAppended) url += '&airborneWaypoints=' + airborneWaypoints;
			else url += '?airborneWaypoints=' + airborneWaypoints;
		}
		goto(url);
	};
</script>

<div class="card flex flex-col gap-3">
	<div class="text-2xl">Generate a scenario</div>
	<div class="flex flex-col justify-center">
		<div>
			<SlideToggle
				id="emergency-events"
				name="slider-medium"
				checked
				active="bg-primary-500"
				size="md">Include Emergency Event</SlideToggle
			>
		</div>

		<div>
			<RangeSlider
				name="range-slider"
				bind:value={airborneWaypoints}
				max={maxAirborneWaypoints}
				step={1}
				ticked
			>
				<div class="flex justify-between items-center">
					<div class="font-bold">Airborne Waypoints</div>
					<div class="text-xs">{airborneWaypoints} / {maxAirborneWaypoints}</div>
				</div>
			</RangeSlider>
		</div>

		<div>
			<label class="label">
				<span>Prefix</span>
				<select class="select" id="prefix-select">
					<option value="">None</option>
					<option value="STUDENT">Student</option>
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
		<div>
			<label class="label">
				<span>Scenario Code</span>
				<input
					class="input"
					title="Scenario Code"
					id="scenario-code-input"
					type="text"
					placeholder={seed}
					minlength="6"
					maxlength="20"
					pattern="[\x00-\x7F]+"
				/>
			</label>
		</div>
	</div>
	<button type="button" class="btn variant-filled" on:click={handleClick}>Generate</button>
</div>

<style lang="postcss">
	.card {
		padding: 1rem;
		max-width: 500px;
	}
</style>
