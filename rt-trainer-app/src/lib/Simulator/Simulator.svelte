<script lang="ts">
	import Radio from './Radio.svelte';
	import Transponder from './Transponder.svelte';
	import Map from './Map.svelte';
	import MessageInput from './MessageInput.svelte';
	import MessageOutput from './MessageOutput.svelte';
	import Kneeboard from './Kneeboard.svelte';
	import { clipboard } from '@skeletonlabs/skeleton';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import axios from 'axios';
	import type { Mistake, StateMessage, StateMessageSeeds } from '$lib/lib/States';
	import { onMount } from 'svelte';

	let state: StateMessage | undefined;

	export let unexpectedEvents: boolean = false;
	export let voiceInput: boolean = false;
	export let audioMessages: boolean = false;
	export let seed: string = '0';
	let kneeboardOffset: number = 480;

	// Holds current text input/output for kneeboard and radio messages
	let kneeboardTextContent: string = 'Make notes here.';
	let messageInputMessage: string = 'Enter your radio message here.';
	let messageOutputMessage: string = 'Radio responses will appear here.';

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
	let aircraftType: string = 'Cessna 172';
	let userCallsign: string = 'G-OFLY';
	let userPrefix: string = 'STUDENT';

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

	function isMistake(message: any): message is Mistake {
		return typeof (message as Mistake).details === 'string';
	}

	async function handleSubmit() {
		console.log('Submitting message: ' + messageInputMessage);
		// Check state matches expected state
		// Send message to server
		let newStateMessage = await getNextState();
		console.log(newStateMessage);
		if (newStateMessage === undefined) {
			// Handle error
			console.log('Error: No response from server');
		} else if (isMistake(newStateMessage)) {
			// Handle mistake
			console.log('mistake');
			messageOutputMessage = newStateMessage.message;
		} else {
			// Update the components with the new state
			console.log('new state');
			state = newStateMessage;
			messageOutputMessage = newStateMessage.message;
		}
		// Get response from server
		// Update components with new state
	}

	const handleVoiceInputToggle = () => {
		voiceInput = !voiceInput;
		updateKneeboardOffset();
	};

	const handleAudioMessagesToggle = () => {
		audioMessages = !audioMessages;
		updateKneeboardOffset();
	};

	onMount(async () => {
		// Get the state from the server
		let newStateMessage = await getInitialState();
		// Update the components with the new state
	});

	async function getInitialState(): Promise<StateMessage | undefined> {
		try {
			const [scenarioSeed, weatherSeed] = splitAndPadNumber(simpleHash(seed));

			console.log({
				scenario_seed: scenarioSeed,
				weather_seed: weatherSeed,
				prefix: userPrefix,
				user_callsign: userCallsign,
				radio_frequency: radioActiveFrequency,
				transponder_frequency: transponderFrequency,
				aircraft_type: aircraftType
			});

			const response = await axios.post('http://localhost:3000/initialstate', {
				scenario_seed: scenarioSeed,
				weather_seed: weatherSeed,
				prefix: userPrefix,
				user_callsign: userCallsign,
				radio_frequency: radioActiveFrequency,
				transponder_frequency: transponderFrequency,
				aircraft_type: aircraftType
			});

			return response.data;
		} catch (error) {
			console.error('Error: ', error);
		}

		function splitAndPadNumber(input: number): [number, number] {
			const numberString = input.toString();
			const halfLength = Math.ceil(numberString.length / 2);
			const firstHalf = parseInt(numberString.padEnd(halfLength, '0').slice(0, halfLength));
			const secondHalf = parseInt(numberString.slice(halfLength).padEnd(halfLength, '0'));
			return [firstHalf, secondHalf];
		}

		function simpleHash(str: string) {
			let hash = 0;

			if (str.length === 0) {
				return hash;
			}

			for (let i = 0; i < str.length; i++) {
				const char = str.charCodeAt(i);
				hash = (hash << 5) - hash + char;
				// The above line is a simple hash function: hash * 31 + char
			}

			return hash;
		}
	}

	async function getNextState(): Promise<StateMessage | Mistake | undefined> {
		try {
			const response = await axios.post('http://localhost:3000/nextstate', {
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
				message: messageInputMessage,
				scenario_seed: 1,
				weather_seed: 1
			});
			return response.data;
		} catch (error) {
			console.error('Error: ', error);
		}
	}
</script>

<div class="relative flex">
	<div class="flex flex-col items-center gap-10" style="width:1000px">
		<div class="settings-container relative flex flex-row items-center gap-5">
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
		</div>

		<div class="flex flex row items-top content-end grid-cols-2 gap-5 flex-wrap">
			{#if !voiceInput}
				<div class="rt-message-input-container">
					<MessageInput bind:message={messageInputMessage} on:submit={handleSubmit} />
				</div>
			{/if}

			{#if !audioMessages}
				<div class="rt-message-output-container">
					<MessageOutput bind:message={messageOutputMessage} />
				</div>
			{/if}
		</div>

		<div class="radio-transponder-container flex flex-col items center gap-10">
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

		<div
			class="flex flex row items-top content-end grid-cols-2 gap-5 flex-wrap"
		>
			<div>
				<Map />
			</div>
			<div>
				<Kneeboard bind:contents={kneeboardTextContent} />
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
