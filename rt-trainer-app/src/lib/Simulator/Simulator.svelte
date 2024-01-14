<script lang="ts">
	import Radio from './Radio.svelte';
	import Transponder from './Transponder.svelte';
	import Map from './Map.svelte';
	import MessageInput from './MessageInput.svelte';
	import MessageOutput from './MessageOutput.svelte';
	import Kneeboard from './Kneeboard.svelte';
	import axios from 'axios';
	import type {
		Mistake,
		CallParsingData,
		UserRadioCall,
		SimulatorUpdateData
	} from '$lib/ts/ServerClientTypes';
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
		KneeboardStore,

		CurrentRoutePointStore

	} from '$lib/stores';
	import SimulatorSettings from './SimulatorSettings.svelte';
	import ScenarioLink from './ScenarioLink.svelte';
	import type { RoutePoint } from '$lib/ts/RouteStates';
	import type {
		TransponderState,
		AircraftDetails,
		RadioState,
		RadioFrequency
	} from '$lib/ts/SimulatorTypes';
	import type Seed from '$lib/ts/Seed';

	// Simulator state and settings
	let seed: Seed;
	let simulatorSettings: AircraftDetails; // Current settings of the simulator
	let radioState: RadioState; // Current radio settings
	let transponderState: TransponderState; // Current transponder settings
	let currentTarget: RadioFrequency;
	let atcMessage: string;
	let userMessage: string;
	let kneeboardText: string = 'Make notes here.';
	let route: RoutePoint[] | undefined = [];
	let currentPointIndex: number = 0;

	// Page settings
	let mapEnabled = true;
	let speechRecognitionSupported: boolean = false; // Speech recognition is not supported in all browsers e.g. firefox
	let unexpectedEvents: boolean = true; // Unexpected events are enabled by default
	let speechInput: boolean = false; // Users must opt in to speech input
	let readRecievedCalls: boolean = false;

	// Server state
	let serverNotResponding: boolean = false;

	const modalStore = getModalStore();

	$: if (serverNotResponding) {
		modalStore.trigger({
			type: 'alert',
			title: 'Connection to server failed',
			body: 'This may be due to the server being offline. Come back later and try again.'
		});
	}

	$: if (readRecievedCalls && atcMessage) {
		speakATCMessage();
	}

	SeedStore.subscribe((value) => {
		seed = value;
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
			// Attempt to get state from server
			initiateScenario();

			if (!requiredState) {
				console.log('Error: No state');
				modalStore.trigger({
					type: 'alert',
					title: 'Connection to server failed',
					body: 'This may be due to the server being offline. Come back later and try again.'
				});
				return;
			}
		}

		if (radioState.dialMode == 'OFF') {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Radio dial is off'
			});
			return;
		} else if (transponderState.dialMode == 'OFF') {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Transponder dial is off'
			});
			return;
		} else if (
			radioState.activeFrequency.toFixed(3) != requiredState.currentTarget.frequency.toFixed(3)
		) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Radio frequency incorrect'
			});
			return;
		} else if (transponderState.frequency != requiredState.currentTransponderFrequency) {
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
			serverNotResponding = true;
			modalStore.trigger({
				type: 'alert',
				title: 'Connection to server failed',
				body: 'This may be due to the server being offline. Come back later and try again.'
			});
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
			ATCMessageStore.set(newStateMessage.radioCall);
			CurrentTargetStore.set(route[currentPointIndex].updateData.currentTarget);
			PoseStore.set(route[currentPointIndex].pose);
		}
	}

	async function initiateScenario() {
		// Get the state from the server
		route = await getRoute();

		// Update the components with the new state
		if (route === undefined) {
			// Handle error
			serverNotResponding = true;

			return 0;
		} else {
			console.log('Initial Stage:', route[0]);
			CurrentTargetStore.set(route[0].updateData.currentTarget);
			PoseStore.set(route[0].pose);
			RouteStore.set(route);
			CurrentRoutePointStore.set(route[0]);
		}
	}

	async function getRoute(): Promise<RoutePoint[] | undefined> {
		try {
			const response = await axios.get(`/scenario/seed=${seed.scenarioSeed}`, {
				headers: {
					'Content-Type': 'application/json'
					// 'Access-Control-Allow-Origin': '*'
				}
			});

			return response.data;
		} catch (error) {
			if (error.message === 'Network Error') {
				serverNotResponding = true;
			} else {
				console.error('Error: ', error);
			}
		}
	}

	async function getNextState(): Promise<SimulatorUpdateData | Mistake | undefined> {
		if (!route) {
			console.log('Error: No route');
			return;
		}
		try {
			const userRadioCall: UserRadioCall = {
				parsingData: {
					routePoint: route[currentPointIndex],
					prefix: simulatorSettings.prefix,
					callsign: simulatorSettings.callsign,
					callsignModified: route[currentPointIndex].updateData.callsignModified,
					squark: false,
					currentTarget: {
						frequencyType: currentTarget.frequencyType,
						frequency: currentTarget.frequency,
						callsign: currentTarget.callsign
					},
					currentRadioFrequency: radioState.activeFrequency,
					currentTransponderFrequency: transponderState.frequency,
					aircraftType: simulatorSettings.aircraftType
				},
				radioCall: userMessage,
				seed: seed
			};

			console.log('Sending call: ', userRadioCall);

			const response = await axios.post('http://localhost:3000/nextstate', userRadioCall);

			if (response.data.SimulatorUpdateData != undefined) {
				return response.data.SimulatorUpdateData as SimulatorUpdateData;
			} else if (response.data.Mistake != undefined) {
				return response.data.Mistake as Mistake;
			} else {
				serverNotResponding = true;
				return;
			}
		} catch (error) {
			console.error('Error: ', error);
		}
	}

	onMount(async () => {
		if (!initiateScenario()) serverNotResponding = true;

		if (window.SpeechRecognition || window.webkitSpeechRecognition) {
			speechRecognitionSupported = true;
		} else {
			speechRecognitionSupported = false;
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
