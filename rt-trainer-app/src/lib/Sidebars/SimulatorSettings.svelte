<script lang="ts">
	import { LightSwitch, SlideToggle } from '@skeletonlabs/skeleton';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	export let prefix: string = '';
	export let callsign: string = 'G-OSKY';
	export let aircraftType: string = 'Cessna 172';
	let mounted: boolean = false;
	let prefixInputElement: HTMLInputElement;
	let callsignInputElement: HTMLInputElement;
	let aircraftTypeInputElement: HTMLInputElement;

	// Untested
	$: if (mounted) {
		prefix = prefixInputElement.value;
		callsign = callsignInputElement.value;
		aircraftType = aircraftTypeInputElement.value;
		console.log(prefix);
		console.log(callsign);
		console.log(aircraftType);
	}

	const handlePrefixChange = () => {
		prefix = prefixInputElement.value;
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
			<label for="prefix-input">Callsign:</label>
			<input
				id="prefix-input"
				class="prefix-input"
				type="text"
				list="prefixes"
				value={prefix}
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
				value={callsign}
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
				value={aircraftType}
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
