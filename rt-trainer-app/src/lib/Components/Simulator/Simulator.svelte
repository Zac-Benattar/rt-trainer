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
		ExpectedUserMessageStore,
		CurrentTargetFrequencyStore,
		RadioCallsStore as RadioCallsHistoryStore
	} from '$lib/stores';
	import type { RoutePoint } from '$lib/ts/RoutePoints';
	import type { TransponderState, AircraftDetails, RadioState } from '$lib/ts/SimulatorTypes';
	import type Seed from '$lib/ts/Seed';
	import { isCallsignStandardRegistration, replaceWithPhoneticAlphabet } from '$lib/ts/utils';
	import { goto } from '$app/navigation';
	import RadioCall from '$lib/ts/RadioCall';
	import { Feedback } from '$lib/ts/Feedback';

	// Simulator state and settings
	let seed: Seed;
	let airborneWaypoints: number = 2;
	let hasEmergency: boolean;
	let aircraftDetails: AircraftDetails; // Current settings of the simulator
	let radioState: RadioState; // Current radio settings
	let transponderState: TransponderState; // Current transponder settings
	let atcMessage: string;
	let userMessage: string;
	let kneeboardText: string;
	let route: RoutePoint[] | undefined = [];
	let currentPointIndex: number = 0;
	let failedAttempts: number = 0;
	let currentRadioCall: RadioCall;

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
			title: 'Server did not respond',
			body: 'This may be due to a bad request or the server being offline. Come back later and try again.'
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
		if (
			userMessage == undefined ||
			userMessage == '' ||
			userMessage == 'Enter your radio message here.'
		) {
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
				body: 'Radio is off'
			});
			return;
		} else if (transponderState.dialMode == 'OFF') {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Transponder is off'
			});
			return;
		} else if (
			radioState.activeFrequency.toFixed(3) !=
			route[currentPointIndex].updateData.currentTargetFrequency.toFixed(3)
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
		if (serverResponse === undefined || serverResponse === null) {
			// Handle error
			serverNotResponding = true;

			return;
		}

		serverNotResponding = false;

		// Update stores with the radio call and feedback
		const feedbackData = JSON.parse(serverResponse.feedbackDataJSON);
		const feedback = new Feedback();
		feedbackData.minorMistakes.forEach((element: string) => {
			feedback.pushMinorMistake(element);
		});
		feedbackData.severeMistakes.forEach((element: string) => {
			feedback.pushSevereMistake(element);
		});

		currentRadioCall.setFeedback(feedback);
		RadioCallsHistoryStore.update((value) => {
			value.push(currentRadioCall);
			return value;
		});
		
		// Get whether there are severe mistakes, and record all minor ones
		let callsignMentioned: boolean = currentRadioCall.callContainsUserCallsign();
		let minorMistakes: string[] = feedback.getMinorMistakes();
		let severeMistakes: string[] = feedback.getSevereMistakes();;

		// Handle mistakes
		if (severeMistakes.length > 0) {
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
							failedAttempts = -7;
						}
					}
				};
				modalStore.trigger(m);

				return;
			}

			// Make ATC respond with say again and do not advance the simulator
			if (callsignMentioned) {
				if (isCallsignStandardRegistration(aircraftDetails.callsign)) {
					ATCMessageStore.set(
						aircraftDetails.prefix +
							' ' +
							replaceWithPhoneticAlphabet(aircraftDetails.callsign) +
							' Say Again'
					);
				} else {
					ATCMessageStore.set(
						aircraftDetails.prefix + ' ' + aircraftDetails.callsign + ' Say Again'
					);
				}
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

		// If the user has reached the end of the route, then show a modal asking if they want to view their feedback
		if (currentPointIndex == route.length - 1) {
			const m: ModalSettings = {
				type: 'confirm',
				title: 'Scenario Complete',
				body: 'Do you want view your feedback?',
				response: (r: boolean) => {
					if (r) {
						goto('/scenario/' + seed.seedString + '/results/');
					}
				}
			};
			modalStore.trigger(m);

			return;
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
			console.log(route);

			// Update stores with the route
			CurrentTargetStore.set(route[0].updateData.currentTarget);
			CurrentTargetFrequencyStore.set(route[0].updateData.currentTargetFrequency);
			RouteStore.set(route);
			CurrentRoutePointStore.set(route[0]);
		}
	}

	async function getRouteFromServer(): Promise<RoutePoint[] | undefined> {
		try {
			const response = await axios.get(
				`/scenario/seed=${seed.seedString}?airborneWaypoints=${airborneWaypoints}&hasEmergency=${hasEmergency}`
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
			const currentTargetFrequency = route[currentPointIndex].updateData.currentTargetFrequency;
			currentRadioCall = new RadioCall(
				userMessage,
				seed,
				route,
				currentPointIndex,
				aircraftDetails.prefix,
				aircraftDetails.callsign,
				route[currentPointIndex].updateData.callsignModified,
				transponderState.vfrHasExecuted,
				currentTarget,
				currentTargetFrequency,
				radioState.activeFrequency,
				transponderState.frequency,
				aircraftDetails.aircraftType
			);

			const response = await axios.post(`/scenario/seed=${seed.scenarioSeed}`, {
				data: currentRadioCall.getJSONData()
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
