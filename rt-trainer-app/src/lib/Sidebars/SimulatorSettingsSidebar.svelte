<script lang="ts">
	import { LightSwitch, SlideToggle } from '@skeletonlabs/skeleton';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { simulatorSettingsStore, setSettingsCallsign, setSettingsAircraftType, setSettingsPrefix } from '$lib/stores';
	import type { SimulatorSettings } from '$lib/purets/States';

	let mounted: boolean = false;
	let prefixInputElement: HTMLInputElement;
	let callsignInputElement: HTMLInputElement;
	let aircraftTypeInputElement: HTMLInputElement;

	let simulatorSettings: SimulatorSettings;
	simulatorSettingsStore.subscribe((value) => {
		simulatorSettings = value;
	});

	// Untested
	$: if (mounted) {
		if (prefixInputElement.value && prefixInputElement.value !== simulatorSettings.prefix) {
			setSettingsPrefix(prefixInputElement.value);
		}
		if (callsignInputElement.value && callsignInputElement.value !== simulatorSettings.callsign) {
			setSettingsCallsign(callsignInputElement.value);
		}
		if (
			aircraftTypeInputElement.value &&
			aircraftTypeInputElement.value !== simulatorSettings.aircraftType
		) {
			setSettingsAircraftType(aircraftTypeInputElement.value);
		}
	}

	const handlePrefixChange = () => {
		if (
			prefixInputElement.value !== simulatorSettings.prefix &&
			(prefixInputElement.value == '' ||
				prefixInputElement.value == 'STUDENT' ||
				prefixInputElement.value == 'HELICOPTER' ||
				prefixInputElement.value == 'POLICE' ||
				prefixInputElement.value == 'SUPER')
		) {
			setSettingsPrefix(prefixInputElement.value);
		}
	};

	const drawerStore = getDrawerStore();

	function drawerClose(): void {
		drawerStore.close();
	}

	onMount(() => {
		mounted = true;
		prefixInputElement = document.getElementById('prefix-input') as HTMLInputElement;
		callsignInputElement = document.getElementById('callsign-input') as HTMLInputElement;
		aircraftTypeInputElement = document.getElementById('aircraft-type-input') as HTMLInputElement;
	});
</script>

<nav class="list-nav p-4">
	<ul>
		<li><a href="/" on:click={drawerClose}>Home</a></li>
		<li>
			<label for="prefix-input">Prefix:</label>
			<input
				id="prefix-input"
				class="prefix-input"
				type="text"
				list="prefixes"
				value={simulatorSettings.prefix}
				on:change={handlePrefixChange}
				on:click={handlePrefixChange}
				on:keyup={handlePrefixChange}
				on:focusout={handlePrefixChange}
			/>
			<datalist id="prefixes">
				<option value="STUDENT" /><option value="HELICOPTER" /><option value="POLICE" /><option
					value="SUPER"
				/></datalist
			>
		</li>
		<!-- Other prefixes could be supported if not too complex (CAP413 2.38) -->
		<li>
			<label for="callsign-input">Callsign:</label>
			<input
				id="callsign-input"
				class="callsign-input"
				type="text"
				value={simulatorSettings.callsign}
				minlength="6"
				maxlength="20"
				pattern="[\x00-\x7F]+"
			/>
		</li>
		<li>
			<label for="aircraft-type-input">Aircraft Type:</label>
			<input
				id="aircraft-type-input"
				class="aircraft-type-input"
				type="text"
				value={simulatorSettings.aircraftType}
				minlength="6"
				maxlength="30"
				pattern="[\x00-\x7F]+"
			/>
		</li>
		<li><div><LightSwitch /></div></li>
	</ul>
</nav>

<style lang="postcss">
	.prefix-input {
		width: 100%;
		color: black;
	}

	.callsign-input {
		width: 100%;
		color: black;
	}

	.aircraft-type-input {
		width: 100%;
		color: black;
	}
</style>
