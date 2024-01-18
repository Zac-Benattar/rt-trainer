<script lang="ts">
	import Radio from './Radio.svelte';
	import Transponder from './Transponder.svelte';
	import Map from './Map.svelte';
	import MessageInput from './MessageInput.svelte';
	import MessageOutput from './MessageOutput.svelte';
	import Kneeboard from './Kneeboard.svelte';
	import axios from 'axios';
	import type { ServerResponse } from '$lib/ts/ServerClientTypes';
	import { onMount } from 'svelte';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ToastSettings } from '@skeletonlabs/skeleton';
	import {
		RadioStateStore,
		TransponderStateStore,
		UserMessageStore,
		ATCMessageStore,
		CurrentTargetStore,
		RouteStore,
		AircraftDetailsStore,
		GenerationParametersStore,
		KneeboardStore,
		CurrentRoutePointStore,
		SpeechOutputStore,
		ExpectedUserMessageStore
	} from '$lib/stores';
	import ScenarioLink from './ScenarioLink.svelte';
	import type { RoutePoint } from '$lib/ts/RouteStates';
	import type { TransponderState, AircraftDetails, RadioState } from '$lib/ts/SimulatorTypes';
	import type Seed from '$lib/ts/Seed';

	// Simulator state and settings
	let seed: Seed;
	let airborneWaypoints: number = 2;
	let hasEmergency: boolean;
	let aircraftDetails: AircraftDetails; // Current settings of the simulator
	let radioState: RadioState; // Current radio settings
	let transponderState: TransponderState; // Current transponder settings
	let atcMessage: string;
	let userMessage: string;
	let kneeboardText: string = 'Make notes here.';
	let route: RoutePoint[] | undefined = [];
	let currentPointIndex: number = 0;
	let failedAttempts: number = 0;

	// Page settings
	let mapEnabled = true;
	let speechRecognitionSupported: boolean = false; // Speech recognition is not supported in all browsers e.g. firefox
	let readRecievedCalls: boolean = false;

	// Server state
	let awaitingRadioCallCheck: boolean = false;
	let serverNotResponding: boolean = false;

	const modalStore = getModalStore();
	const toastStore = getToastStore();

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

	SpeechOutputStore.subscribe((value) => {
		readRecievedCalls = value;
	});

	GenerationParametersStore.subscribe((value) => {
		seed = value.seed;
		airborneWaypoints = value.airborneWaypoints;
		hasEmergency = value.hasEmergency;
	});

	AircraftDetailsStore.subscribe((value) => {
		aircraftDetails = value;
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

	async function handleSubmit() {
		// Prevent race conditions from multiple calls
		if (awaitingRadioCallCheck) return;

		// Check the call is not empty
		if (userMessage == '' || userMessage == 'Enter your radio message here.') {
			return;
		}

		// Check state matches expected state
		if (!route) {
			// Attempt to get state from server
			initiateScenario();

			if (!route) {
				console.log('Error: No route');
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
			radioState.activeFrequency.toFixed(3) !=
			route[currentPointIndex].updateData.currentTarget.frequency.toFixed(3)
		) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Radio frequency incorrect'
			});
			return;
		} else if (
			transponderState.frequency != route[currentPointIndex].updateData.currentTransponderFrequency
		) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Transponder frequency incorrect'
			});
			return;
		}

		// Send message to server
		awaitingRadioCallCheck = true;
		let serverResponse = await checkRadioCallByServer();
		awaitingRadioCallCheck = false;
		if (serverResponse === undefined) {
			// Handle error
			serverNotResponding = true;
			modalStore.trigger({
				type: 'alert',
				title: 'No response from server',
				body: 'This may be due to the server being offline or an unrecoverable parsing error encountered by the server. Come back later and try again.'
			});

			return;
		}

		serverNotResponding = false;

		// Get whether there are severe mistakes, and record all minor ones
		let severeMistakes: boolean = false;
		let callsignMentioned: boolean = true; // If user's callsign in their call or not
		let minorMistakes: string[] = [];
		for (let i = 0; i < serverResponse.mistakes.length; i++) {
			// If the user's callsign is mentioned in the mistakes, then they have not said their callsign, so set the flag
			if (serverResponse.mistakes[i].details.search('your callsign') != -1) {
				callsignMentioned = false;
			}

			// If the mistake is severe, then set the flag
			if (serverResponse.mistakes[i].severe) {
				severeMistakes = true;
				continue;
			} else {
				minorMistakes.push(serverResponse.mistakes[i].details);
			}
		}

		// Handle mistakes
		if (severeMistakes) {
			failedAttempts++;

			if (failedAttempts >= 3) {
				// Show a modal asking the user if they want to be given the correct call or keep trying
				const m: ModalSettings = {
					type: 'confirm',
					title: 'Mistake',
					body: 'Do you want to be given the correct call?',
					response: (r: boolean) => {
						if (r) {
							// Put the correct call in the input box
							ExpectedUserMessageStore.set(serverResponse.expectedUserCall);
						} else {
							failedAttempts = -999;
						}
					}
				};
				modalStore.trigger(m);

				return;
			}

			// Make ATC respond with say again and do not advance the simulator
			if (callsignMentioned) {
				ATCMessageStore.set(aircraftDetails.prefix + ' ' + aircraftDetails.callsign + ' Say Again');
			} else {
				ATCMessageStore.set('Station Calling, Say Again Your Callsign');
			}

			return;
		} else if (minorMistakes.length > 0) {
			// Show a toast with the minor mistakes and advance scenario
			const t: ToastSettings = {
				message: 'Correct with minor mistakes: ' + minorMistakes.join(', ') + '.'
			};
			toastStore.trigger(t);
		} else {
			const t: ToastSettings = {
				message: 'Correct!'
			};
			toastStore.trigger(t);
		}

		// Update the simulator with the next route point
		failedAttempts = 0;
		currentPointIndex++;
		ATCMessageStore.set(serverResponse.responseCall);
		CurrentTargetStore.set(route[currentPointIndex].updateData.currentTarget);
	}

	async function initiateScenario() {
		// Get the state from the server
		route = await getRouteFromServer();

		if (route === undefined) {
			// Handle error
			serverNotResponding = true;

			return 0;
		} else {
			// Update stores with the route
			CurrentTargetStore.set(route[0].updateData.currentTarget);
			RouteStore.set(route);
			CurrentRoutePointStore.set(route[0]);
		}
	}

	async function getRouteFromServer(): Promise<RoutePoint[] | undefined> {
		try {
			const response = await axios.get(
				`/scenario/seed=${seed.scenarioSeed}?airborneWaypoints=${airborneWaypoints}&hasEmergency=${hasEmergency}`
			);

			return response.data;
		} catch (error: any) {
			if (error.message === 'Network Error') {
				serverNotResponding = true;
			} else {
				console.error('Error: ', error);
			}
		}
	}

	async function checkRadioCallByServer(): Promise<ServerResponse | undefined> {
		if (!route) {
			console.log('Error: No route');
			return;
		}
		try {
			const currentTarget = route[currentPointIndex].updateData.currentTarget;
			const callParsingContext = {
				radioCall: userMessage,
				seed: seed,
				routePoint: route[currentPointIndex],
				prefix: aircraftDetails.prefix,
				userCallsign: aircraftDetails.callsign,
				userCallsignModified: route[currentPointIndex].updateData.callsignModified,
				squark: false,
				currentTarget: currentTarget,
				currentRadioFrequency: radioState.activeFrequency,
				currentTransponderFrequency: transponderState.frequency,
				aircraftType: aircraftDetails.aircraftType
			};

			const response = await axios.post(`/scenario/seed=${seed.scenarioSeed}`, {
				data: callParsingContext
			});

			return response.data;
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
	<div class="simcomponents-container flex flex-col items-center gap-5" style="width:1000px">
		<div class="h-1" />
		<div class="flex flex row items-top content-end grid-cols-2 gap-5 flex-wrap">
			<div class="rt-message-input-container">
				<MessageInput {speechRecognitionSupported} on:submit={handleSubmit} />
			</div>

			<div class="rt-message-output-container">
				<MessageOutput />
			</div>
		</div>

		<div class="radio-transponder-container flex flex-col items center gap-5">
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

			<!-- <ScenarioLink /> -->
		</div>

		<div class="h-1" />
	</div>
</div>

<style lang="postcss">
	.radio-transponder-container {
		justify-content: center;
	}
</style>
