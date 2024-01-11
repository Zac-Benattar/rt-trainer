<script lang="ts">
	import Radio from './Radio.svelte';
	import Transponder from './Transponder.svelte';
	import Map from './Map.svelte';
	import MessageInput from './MessageInput.svelte';
	import MessageOutput from './MessageOutput.svelte';
	import Kneeboard from './Kneeboard.svelte';
	import axios from 'axios';
	import type {
		COMFrequency,
		Mistake,
		AircraftDetails,
		ScenarioState,
		StateMessage,
		RadioState,
		TransponderState,
		Waypoint
	} from '$lib/ts/States';
	import { onMount } from 'svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import {
		SettingsStore,
		RadioStateStore,
		TransponderStateStore,
		UserMessageStore,
		ATCMessageStore,
		CurrentTargetStore,
		PoseStore,
		RouteStore,
		AircraftDetailsStore,
		SeedStore,
		KneeboardStore
	} from '$lib/stores';
	import SimulatorSettings from './SimulatorSettings.svelte';
	import ScenarioLink from './ScenarioLink.svelte';

	// Simulator state and settings
	let scenarioSeed: number = 0;
	let weatherSeed: number = 0;
	let requiredState: ScenarioState | undefined; // Required state for user to match
	let simulatorSettings: AircraftDetails; // Current settings of the simulator
	let radioState: RadioState; // Current radio settings
	let transponderState: TransponderState; // Current transponder settings
	let currentTarget: COMFrequency;
	let atcMessage: string;
	let userMessage: string;
	let kneeboardText: string = 'Make notes here.';

	// Page settings
	let seedString: string = '0';
	let mapEnabled = true;
	let speechRecognitionSupported: boolean = false; // Speech recognition is not supported in all browsers e.g. firefox
	let unexpectedEvents: boolean = true; // Unexpected events are enabled by default
	let speechInput: boolean = false; // Users must opt in to speech input
	let readRecievedCalls: boolean = false;
	const modalStore = getModalStore();

	$: if (readRecievedCalls && atcMessage) {
		speakATCMessage();
	}

	$: if (requiredState) {
		currentTarget = requiredState.current_target;
	}

	SeedStore.subscribe((value) => {
		seedString = value.seedString;
		scenarioSeed = value.scenarioSeed;
		weatherSeed = value.weatherSeed;
	});

	SettingsStore.subscribe((value) => {
		unexpectedEvents = value.unexpectedEvents;
		speechInput = value.speechInput;
		readRecievedCalls = value.readRecievedCalls;
	});

	AircraftDetailsStore.subscribe((value) => {
		simulatorSettings = value;
	});

	RadioStateStore.subscribe((value) => {
		radioState = value;
	});

	TransponderStateStore.subscribe((value) => {
		transponderState = value;
	});

	UserMessageStore.subscribe((value) => {
		userMessage = value;
	});

	ATCMessageStore.subscribe((value) => {
		atcMessage = value;
	});

	KneeboardStore.subscribe((value) => {
		kneeboardText = value;
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
			ATCMessageStore.set(newStateMessage.message);
			CurrentTargetStore.set(newStateMessage.state.current_target);
			PoseStore.set(newStateMessage.state.pose);
		}
	}

	async function initiateScenario() {
		// Get the state from the server
		let initialState = await getInitialState();
		let scenarioRoute = await getScenarioRoute();
		// Update the components with the new state
		if (initialState === undefined) {
			// Handle error
			console.log('Initial State Error: No response from server');
			return 0;
		} else {
			console.log('Initial State:', initialState);
			requiredState = initialState;
			CurrentTargetStore.set(initialState.current_target);
			PoseStore.set(initialState.pose);
		}

		if (scenarioRoute === undefined) {
			// Handle error
			console.log('Route Error: No response from server');
			return 0;
		} else {
			console.log('Scenario Route:', scenarioRoute);
			RouteStore.set(scenarioRoute);
		}
	}

	async function getScenarioRoute(): Promise<Waypoint[] | undefined> {
		try {
			const response = await axios.get('http://localhost:3000/route/' + scenarioSeed, {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});

			return response.data;
		} catch (error) {
			console.error('Error: ', error);
		}
	}

	async function getInitialState(): Promise<ScenarioState | undefined> {
		try {
			const response = await axios.post(
				'http://localhost:3000/initialstate',
				{
					scenario_seed: scenarioSeed,
					weather_seed: weatherSeed,
					prefix: simulatorSettings.prefix,
					user_callsign: simulatorSettings.callsign,
					aircraft_type: simulatorSettings.aircraft_type
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
					aircraft_type: simulatorSettings.aircraft_type
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

		if (window.SpeechRecognition || window.webkitSpeechRecognition) {
			speechRecognitionSupported = true;
		} else {
			speechRecognitionSupported = false;
			modalStore.trigger({
				type: 'alert',
				title: 'Speech Recognition Error',
				body: 'Speech recognition is not supported in this browser. Please use a different browser if you would like to use this feature.'
			});
		}
	});
</script>

<div class="relative flex">
	<div class="flex flex-col items-center gap-10" style="width:1000px">
		<SimulatorSettings {speechRecognitionSupported} />

		<div class="flex flex row items-top content-end grid-cols-2 gap-5 flex-wrap">
			<div class="rt-message-input-container">
				<MessageInput on:submit={handleSubmit} />
			</div>

			<div class="rt-message-output-container">
				<MessageOutput />
			</div>
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
				<Kneeboard />
			</div>

			<ScenarioLink />
		</div>

		<div class="h-5" />
	</div>
</div>

<style lang="postcss">
	.radio-transponder-container {
		justify-content: center;
	}
</style>
