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
	import type { COMFrequency, Mistake, State, StateMessage } from '$lib/lib/States';
	import { onMount } from 'svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { simulatorSettingsStore, simulatorStateStore } from '$lib/stores';

	let scenarioSeed: number = 0;
	let weatherSeed: number = 0;
	let requiredState: State | undefined; // Required state for user to match
	let currentMessage: string = 'Radio messages will appear here.'; // Most recent radio message from ATC
	let currentState: State = {
		status: {
			Parked: {
				position: 'A1',
				stage: 'PreDepartInfo'
			}
		},
		prefix: 'G',
		callsign: 'ABC',
		target_allocated_callsign: 'ABC',
		squark: false,
		current_target: {
			frequency_type: 'AFIS',
			frequency: 123.17,
			callsign: 'ABC'
		},
		current_radio_frequency: 123.17,
		current_transponder_frequency: 7000,
		lat: 0,
		long: 0,
		emergency: 'None',
		aircraft_type: 'A320'
	}; // Current state of the simulator

	export let unexpectedEvents: boolean = false;
	export let voiceInput: boolean = false;
	export let audioMessages: boolean = false;
	export let seed: string = '0';
	let callsign: string;
	let prefix: string;
	let aircraftType: string;

	simulatorSettingsStore.subscribe((value) => {
		prefix = value.prefix;
		callsign = value.callsign;
		aircraftType = value.aircraftType;
	});

	// Holds current text input/output for kneeboard and radio messages
	let kneeboardTextContent: string = 'Make notes here.';
	let messageInputMessage: string = 'Enter your radio message here.';

	const modalStore = getModalStore();

	// Generate the link to the scenario
	let scenarioLink: string = 'www.rt-trainer.com/scenario/' + seed;
	if (unexpectedEvents) {
		scenarioLink += '?unexpectedEvents=' + unexpectedEvents;
	}

	function isMistake(message: any): message is Mistake {
		return typeof (message as Mistake).details === 'string';
	}

	async function handleSubmit() {
		// Check state matches expected state
		if (!requiredState) {
			console.log('Error: No state');
			return;
		}

		if (radioDialMode == 'OFF') {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Radio dial is off'
			});
			return;
		} else if (transponderDialModeIndex == 0) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Transponder dial is off'
			});
			return;
		} else if (requiredState.current_radio_frequency != radioActiveFrequency) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Radio frequency incorrect'
			});
			return;
		} else if (requiredState.current_transponder_frequency != transponderFrequency) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Transponder frequency incorrect'
			});
			return;
		}

		// Send message to server
		let newStateMessage = await getNextState();
		console.log(newStateMessage);
		if (newStateMessage === undefined) {
			// Handle error
			console.log('Error: No response from server');
		} else if (isMistake(newStateMessage)) {
			// Handle mistake
			console.log('mistake');
			// Pop up modal with mistake details
			const modal: ModalSettings = {
				type: 'alert',
				// Data
				title: 'Mistake',
				body: newStateMessage.details
			};
			modalStore.trigger(modal);
		} else {
			// Update the components with the new state
			console.log('new state: ', newStateMessage);
			requiredState = newStateMessage.state;
			currentMessage = newStateMessage.message;
		}
		// Get response from server
		// Update components with new state
	}

	onMount(async () => {
		if (!initiateScenario())
			modalStore.trigger({
				type: 'alert',
				title: 'Fatal Error',
				body: 'No response from server'
			});
	});

	async function initiateScenario() {
		// Get the state from the server
		let initialState = await getInitialState();
		// Update the components with the new state
		if (initialState === undefined) {
			// Handle error
			console.log('Error: No response from server');
			return 0;
		} else {
			requiredState = initialState;
			console.log('state: ', requiredState);
			currentTarget = initialState.current_target;
		}
	}

	async function getInitialState(): Promise<State | undefined> {
		try {
			const [tempScenarioSeed, tempWeatherSeed] = splitAndPadNumber(simpleHash(seed));
			scenarioSeed = tempScenarioSeed;
			weatherSeed = tempWeatherSeed;

			// Debugging
			console.log({
				scenario_seed: scenarioSeed,
				weather_seed: weatherSeed,
				prefix: prefix,
				user_callsign: callsign,
				radio_frequency: radioActiveFrequency,
				transponder_frequency: transponderFrequency,
				aircraft_type: aircraftType
			});

			const response = await axios.post('http://localhost:3000/initialstate', {
				scenario_seed: scenarioSeed,
				weather_seed: weatherSeed,
				prefix: prefix,
				user_callsign: callsign,
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
			const stateMessage: StateMessage = {
				state: {
					status: {
						Parked: {
							position: 'A1',
							stage: 'PreDepartInfo'
						}
					},
					prefix: prefix,
					callsign: callsign,
					target_allocated_callsign: allocated_callsign,
					squark: false,
					current_target: {
						frequency_type: currentTarget.frequency_type,
						frequency: currentTarget.frequency,
						callsign: currentTarget.callsign
					},
					current_radio_frequency: radioActiveFrequency,
					current_transponder_frequency: transponderFrequency,
					lat: currentLat,
					long: currentLong,
					emergency: 'None',
					aircraft_type: aircraftType
				},
				message: messageInputMessage,
				scenario_seed: scenarioSeed,
				weather_seed: weatherSeed
			};

			const response = await axios.post('http://localhost:3000/nextstate', stateMessage);

			if (typeof response.data === 'object') {
				return response.data.Mistake as Mistake;
			}

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
				on:click={() => (voiceInput = !voiceInput)}
				>Voice input
			</SlideToggle>
			<SlideToggle
				id="enabled-audio-messages"
				name="slider-small"
				active="bg-primary-500"
				size="sm"
				on:click={() => (audioMessages = !audioMessages)}
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
					<MessageOutput bind:message={currentMessage} bind:currentTarget />
				</div>
			{/if}
		</div>

		<div class="radio-transponder-container flex flex-col items center gap-10">
			<div>
				<Radio
					bind:activeFrequency={radioActiveFrequency}
					bind:standbyFrequency={radioStandbyFrequency}
					bind:tertiaryFrequency={radioTertiaryFrequency}
					bind:radioMode
					bind:radioDialMode
					bind:transmitting={radioTransmitting}
				/>
			</div>
			<div>
				<Transponder
					bind:identEnabled={transponderIDENTEnabled}
					bind:frequency={transponderFrequency}
					bind:transponderDialModeIndex
				/>
			</div>
		</div>

		<div class="flex flex row items-top content-end grid-cols-2 gap-5 flex-wrap">
			<div>
				<Map />
			</div>
			<div>
				<Kneeboard bind:contents={kneeboardTextContent} />
			</div>

			<div
				class="copy-link-div relative w-full text-token card variant-soft p-4 flex items-center gap-4"
			>
				<div data-clipboard="scenarioLinkElement">{scenarioLink}</div>

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
