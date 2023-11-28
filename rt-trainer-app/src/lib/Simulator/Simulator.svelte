<script lang="ts">
	import Radio from './Radio.svelte';
	import Transponder from './Transponder.svelte';
	import Map from './Map.svelte';
	import MessageInput from './MessageInput.svelte';
	import MessageOutput from './MessageOutput.svelte';
	import Kneeboard from './Kneeboard.svelte';
	import { clipboard } from '@skeletonlabs/skeleton';
	import { SlideToggle } from '@skeletonlabs/skeleton';

	export let unexpectedEvents: boolean = false;
	export let voiceInput: boolean = false;
	export let audioMessages: boolean = false;
	export let seed: string = '0';
	let kneeboardOffset: number = 480;

	// Holds current text input/output for kneeboard and radio messages
	let kneeboardTextContent: string = 'Make notes here.';
	let messageInputMessage: string = 'Type your message here.';
	let messageOutputMessage: string = 'Radio messages will appear here.';

	// Holds current radio and transponder settings to be sent to server
	type RadioMode = 'COM' | 'NAV';
	let radioActiveFrequency: number = 123.17;
	let radioStandbyFrequency: number = 126.41;
	let radioTertiaryFrequency: number = 177.2;
	let radioTransmitting: boolean = false;
	let radioMode: RadioMode = 'COM';
	let radioDialMode: string = 'OFF';
	let transponderFrequency: number = 7000;
	let transponderIDENTEnabled: boolean = false;

	// If not wanting server stuff to deal with then can chuck all the functionality in here?
	// It would make the whole project run on clientside and expose all simulation code and require local STT

	// Generate the link to the scenario
	let scenarioLink: string = 'www.rt-trainer.com/scenario/' + seed;
	if (unexpectedEvents) {
		scenarioLink += '?unexpectedEvents=' + unexpectedEvents;
	}

	// Bodge to keep kneeboard delete button in the right place
	function updateKneeboardOffset() {
		if (!audioMessages) {
			if (!voiceInput) {
				kneeboardOffset = 480;
			} else {
				kneeboardOffset = 240;
			}
		} else {
			if (!voiceInput) {
				kneeboardOffset = 240;
			} else {
				kneeboardOffset = 0;
			}
		}
	}

	function getNextState() {
		const apiUrl = 'http://localhost:3000/nextstate';
		const state = {
			state: {
				status: {
					Parked: {
						position: 'A1',
						stage: 'PreDepartInfo'
					}
				},
				prefix: 'STUDENT',
				callsign: 'G-OFLY',
				target_allocated_callsign: 'G-OFLY',
				squark: false,
				current_target: {
					frequency_type: 'AFIS',
					frequency: 124.03,
					callsign: 'Wellesbourne Information'
				},
				current_radio_frequency: 180.03,
				current_transponder_frequency: 7000,
				lat: 52.1922,
				long: -1.6144,
				emergency: 'None',
				aircraft_type: 'Cessna 172'
			},
			message: 'G-OFLY, request departure information.',
			scenario_seed: 1,
			weather_seed: 1
		};

		const requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(state)
		};

		fetch(apiUrl, requestOptions)
			.then((response) => {
				if (!response.ok) {
					if (response.status === 404) {
						throw new Error('Data not found');
					} else if (response.status === 500) {
						throw new Error('Server error');
					} else {
						throw new Error('Network response was not ok');
					}
				}
				console.log('Response: ', response);
				return response.json();
			})
			.then((data) => {
				console.log('Next state data: ', data);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}

	const handleVoiceInputToggle = () => {
		voiceInput = !voiceInput;
		updateKneeboardOffset();
	};

	const handleAudioMessagesToggle = () => {
		audioMessages = !audioMessages;
		updateKneeboardOffset();
	};
</script>

<div class="relative flex">
	<div class="flex flex-col gap-10">
		<div class="settings-container relative flex flex-row gap-5">
			<SlideToggle
				id="enable-random-events"
				name="slider-small"
				checked={unexpectedEvents}
				active="bg-primary-500"
				size="sm"
				on:click={() => (unexpectedEvents = !unexpectedEvents)}
				>Unexpected events
			</SlideToggle>
			<SlideToggle
				id="enable-voice-input"
				name="slider-small"
				checked={voiceInput}
				active="bg-primary-500"
				size="sm"
				on:click={handleVoiceInputToggle}
				>Voice input
			</SlideToggle>
			<SlideToggle
				id="enabled-audio-messages"
				name="slider-small"
				active="bg-primary-500"
				size="sm"
				on:click={handleAudioMessagesToggle}
				>Audio messages
			</SlideToggle>
			<button id="next-state" class="btn variant-filled" on:click={getNextState}>Next state</button>
		</div>

		<div class="radio-transponder-container flex flex-col gap-10">
			<div>
				<Radio
					activeFrequency={radioActiveFrequency}
					standbyFrequency={radioStandbyFrequency}
					tertiaryFrequency={radioTertiaryFrequency}
					{radioMode}
					{radioDialMode}
					transmitting={radioTransmitting}
				/>
			</div>
			<div>
				<Transponder identEnabled={transponderIDENTEnabled} frequency={transponderFrequency} />
			</div>
		</div>

		{#if !voiceInput}
			<div class="rt-message-input-container">
				<MessageInput message={messageInputMessage} />
			</div>
		{/if}

		{#if !audioMessages}
			<div class="rt-message-output-container">
				<MessageOutput message={messageOutputMessage} />
			</div>
		{/if}

		<div class="map-kneeboard-container flex flex-row gap-5">
			<div>
				<Map />
			</div>
			<div>
				<Kneeboard offset={kneeboardOffset} contents={kneeboardTextContent} />
			</div>
		</div>

		<div
			class="copy-link-div relative w-full text-token card variant-soft p-4 flex items-center gap-4"
		>
			<!-- Source -->
			<div data-clipboard="scenarioLinkElement">{scenarioLink}</div>

			<!-- Trigger -->
			<button use:clipboard={{ element: 'scenarioLinkElement' }} class="btn variant-filled"
				>Copy</button
			>
		</div>
		<div class="h-5" />
	</div>
</div>

<style lang="postcss">
	.settings-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.radio-transponder-container {
		justify-content: center;
	}

	.copy-link-div {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
</style>
