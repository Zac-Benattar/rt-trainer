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
	import type {
		COMFrequency,
		Mistake,
		SimulatorSettings,
		ScenarioState,
		StateMessage,
		RadioState,
		TransponderState
	} from '$lib/purets/States';
	import { onMount } from 'svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import {
		simulatorSettingsStore,
		simulatorRadioStateStore,
		simulatorTransponderStateStore,
		simulatorUserMessageStore,
		simulatorATCMessageStore,
		simulatorCurrentTargetStore,
		simulatorPoseStore
	} from '$lib/stores';

	// Simulator state and settings
	let scenarioSeed: number = 0;
	let weatherSeed: number = 0;
	let requiredState: ScenarioState | undefined; // Required state for user to match
	let simulatorSettings: SimulatorSettings; // Current settings of the simulator
	let radioState: RadioState; // Current radio settings
	let transponderState: TransponderState; // Current transponder settings
	let currentTarget: COMFrequency;
	let atcMessage: string;
	let userMessage: string;
	let kneeboardTextContent: string = 'Make notes here.';

	// Page settings
	export let unexpectedEvents: boolean = false;
	export let seed: string = '0';
	let mapEnabled = true; // User will need to opt in as the map uses cookies
	let voiceInput: boolean = false;
	let audioMessages: boolean = false;
	let scenarioLink: string = 'www.rt-trainer.com/scenario/' + seed;
	const modalStore = getModalStore();

	$: if (audioMessages && atcMessage) {
		speakATCMessage();
	}

	$: if (requiredState) {
		currentTarget = requiredState.current_target;
	}

	$: if (unexpectedEvents) {
		scenarioLink = 'www.rt-trainer.com/scenario/' + seed + '?unexpectedEvents=true';
	} else {
		scenarioLink = 'www.rt-trainer.com/scenario/' + seed;
	}

	simulatorSettingsStore.subscribe((value) => {
		simulatorSettings = value;
	});

	simulatorRadioStateStore.subscribe((value) => {
		radioState = value;
	});

	simulatorTransponderStateStore.subscribe((value) => {
		transponderState = value;
	});

	simulatorUserMessageStore.subscribe((value) => {
		userMessage = value;
	});

	simulatorATCMessageStore.subscribe((value) => {
		atcMessage = value;
	});

	function speakATCMessage() {
		if ('speechSynthesis' in window) {
			var utterance = new SpeechSynthesisUtterance();

			utterance.text = atcMessage;

			// utterance.voice = ...
			// utterance.rate = ...
			// utterance.pitch = ...

			speechSynthesis.speak(utterance);
		} else {
			console.error('SpeechSynthesis API is not supported in this browser.');
		}
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

		if (radioState.dial_mode == 'OFF') {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Radio dial is off'
			});
			return;
		} else if (transponderState.dial_mode == 'OFF') {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Transponder dial is off'
			});
			return;
		} else if (
			radioState.active_frequency.toFixed(3) != requiredState.current_radio_frequency.toFixed(3)
		) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Radio frequency incorrect'
			});
			return;
		} else if (transponderState.frequency != requiredState.current_transponder_frequency) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Transponder frequency incorrect'
			});
			return;
		}

		// Send message to server
		let newStateMessage = await getNextState();
		console.log('Received state: ', newStateMessage);
		if (newStateMessage === undefined) {
			// Handle error
			console.log('Error: No response from server');
		} else if (isMistake(newStateMessage)) {
			// Handle mistake

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
			requiredState = newStateMessage.state;
			simulatorATCMessageStore.set(newStateMessage.message);
			simulatorCurrentTargetStore.set(newStateMessage.state.current_target);
			simulatorPoseStore.set({
				location: newStateMessage.state.location,
				heading: newStateMessage.state.status.heading
			});
		}
	}

	async function initiateScenario() {
		// Get the state from the server
		let initialState = await getInitialState();
		// Update the components with the new state
		if (initialState === undefined) {
			// Handle error
			console.log('Error: No response from server');
			return 0;
		} else {
			console.log('Initial State:', initialState);
			requiredState = initialState;
			simulatorCurrentTargetStore.set(initialState.current_target);
			simulatorPoseStore.set({
				location: initialState.location,
				heading: 0
			});
		}
	}

	async function getInitialState(): Promise<ScenarioState | undefined> {
		try {
			const [tempScenarioSeed, tempWeatherSeed] = splitAndPadNumber(simpleHash(seed));
			scenarioSeed = tempScenarioSeed;
			weatherSeed = tempWeatherSeed;

			const response = await axios.post(
				'http://localhost:3000/initialstate',
				{
					scenario_seed: scenarioSeed,
					weather_seed: weatherSeed,
					prefix: simulatorSettings.prefix,
					user_callsign: simulatorSettings.callsign,
					aircraft_type: simulatorSettings.aircraftType
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				}
			);

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
		if (!requiredState) {
			console.log('Error: No state');
			return;
		}
		try {
			const stateMessage: StateMessage = {
				state: {
					status: {
						Parked: {
							stage: 'PreRadioCheck'
						}
					},
					prefix: simulatorSettings.prefix,
					callsign: simulatorSettings.callsign,
					target_allocated_callsign: requiredState.target_allocated_callsign,
					squark: false,
					current_target: {
						frequency_type: currentTarget.frequency_type,
						frequency: currentTarget.frequency,
						callsign: currentTarget.callsign
					},
					current_radio_frequency: radioState.active_frequency,
					current_transponder_frequency: transponderState.frequency,
					emergency: 'None',
					aircraft_type: simulatorSettings.aircraftType
				},
				message: userMessage,
				scenario_seed: scenarioSeed,
				weather_seed: weatherSeed
			};

			console.log('Sending state: ', stateMessage);

			const response = await axios.post('http://localhost:3000/nextstate', stateMessage);

			if (response.data.StateMessage != undefined) {
				return response.data.StateMessage as StateMessage;
			} else if (response.data.Mistake != undefined) {
				return response.data.Mistake as Mistake;
			} else {
				console.log('Error: No response from server');
				return;
			}
		} catch (error) {
			console.error('Error: ', error);
		}
	}

	onMount(async () => {
		if (!initiateScenario())
			modalStore.trigger({
				type: 'alert',
				title: 'Fatal Error',
				body: 'No response from server'
			});
	});
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
					<MessageInput on:submit={handleSubmit} />
				</div>
			{/if}

			{#if !audioMessages}
				<div class="rt-message-output-container">
					<MessageOutput />
				</div>
			{/if}
		</div>

		<div class="radio-transponder-container flex flex-col items center gap-10">
			<div>
				<Radio />
			</div>
			<div>
				<Transponder />
			</div>
		</div>

		<div class="flex flex row items-top content-end grid-cols-2 gap-5 flex-wrap">
			<div>
				<Map enabled={mapEnabled} />
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
