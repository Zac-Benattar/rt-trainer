<script lang="ts">
	import { goto } from '$app/navigation';
	import { RangeSlider, SlideToggle, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { generateRandomURLValidString } from '$lib/ts/utils';
	import { ClearSimulationStores } from '$lib/stores';

	export let seed: string = generateRandomURLValidString(8);
	let airborneWaypoints: number = 2;
	const maxAirborneWaypoints: number = 5;
	let invalidInput: boolean = false;

	const handleClick = () => {
		// Reset stores
		ClearSimulationStores();

		// Get the values from the form
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
			} else {
				callsign = callsignInputElement.value;
			}
		}

		let aircraftType = '';
		const aircraftTypeInputElement = document.getElementById(
			'aircraft-type-input'
		) as HTMLInputElement;
		if (aircraftTypeInputElement != null) {
			if (aircraftTypeInputElement.value == '') {
				aircraftType = 'Cessna 172';
			} else {
				aircraftType = aircraftTypeInputElement.value;
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

		// Redirect to the scenario page
		let url = '/scenario/' + seed;
		let questionMarkAppended = false;
		if (prefix != '') {
			url += '?prefix=' + prefix;
			questionMarkAppended = true;
		}
		if (callsign != '') {
			if (questionMarkAppended) url += '&callsign=' + callsign;
			else url += '?callsign=' + callsign;
			questionMarkAppended = true;
		}
		if (aircraftType != '') {
			if (questionMarkAppended) url += '&aircraftType=' + aircraftType;
			else url += '?aircraftType=' + aircraftType;
			questionMarkAppended = true;
		}
		if (enableEmergencies) {
			if (questionMarkAppended) url += '&emergencies=True';
			else url += '?emergencies=True';
			questionMarkAppended = true;
		}
		if (airborneWaypoints != 2) {
			if (questionMarkAppended) url += '&airborneWaypoints=' + airborneWaypoints;
			else url += '?airborneWaypoints=' + airborneWaypoints;
			questionMarkAppended = true;
		}
		goto(url);
	};

	const airborneWaypointsTooltip: PopupSettings = {
		event: 'hover',
		target: 'airborneWaypointsPopupHover',
		placement: 'bottom'
	};
</script>

<div class="card p-5 flex flex-col gap-5">
	<div class="text-2xl">Generate a scenario</div>
	<div class="flex flex-col gap-2 justify-center">
		<div>
			<SlideToggle
				id="emergency-events"
				name="slider-medium"
				checked
				active="bg-primary-500"
				size="sm">Include Emergency Event</SlideToggle
			>
		</div>

		<div class="flex grow">
			<div
				class="flex flex-row w-full [&>*]:pointer-events-none"
				use:popup={airborneWaypointsTooltip}
			>
				<RangeSlider
					name="range-slider"
					class="w-full"
					bind:value={airborneWaypoints}
					max={maxAirborneWaypoints}
					step={1}
					ticked
					disabled
				>
					<div class="flex grow justify-between items-center">
						<span>Airborne Waypoints</span>
						<div class="text-xs">{airborneWaypoints} / {maxAirborneWaypoints}</div>
					</div>
				</RangeSlider>
			</div>
			<div class="card p-4 variant-filled-secondary" data-popup="airborneWaypointsPopupHover">
				<p>Currently disabled while the system is finalised.</p>
				<div class="arrow variant-filled-secondary" />
			</div>
		</div>

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
