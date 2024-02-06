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
		SpeechOutputEnabledStore,
		ExpectedUserMessageStore,
		CurrentTargetFrequencyStore,
		RadioCallsHistoryStore,
		LiveFeedbackStore,
		CurrentRoutePointIndexStore,
		EndPointIndexStore,
		WaypointStore
	} from '$lib/stores';
	import type RoutePoint from '$lib/ts/RoutePoints';
	import type { TransponderState, AircraftDetails, RadioState } from '$lib/ts/SimulatorTypes';
	import type Seed from '$lib/ts/Seed';
	import { isCallsignStandardRegistration, replaceWithPhoneticAlphabet } from '$lib/ts/utils';
	import { goto } from '$app/navigation';
	import RadioCall from '$lib/ts/RadioCall';
	import { Feedback } from '$lib/ts/Feedback';
	import type { Waypoint } from '$lib/ts/RouteTypes';

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
	let route: RoutePoint[] = [];
	let currentPointIndex: number = 0;
	let endPointIndex: number = 0;
	let failedAttempts: number = 0;
	let currentRadioCall: RadioCall;

	// Page settings
	let mapEnabled = true;
	let speechRecognitionSupported: boolean = false; // Speech recognition is not supported in all browsers e.g. firefox
	let readRecievedCalls: boolean = false;
	let liveFeedback: boolean = false;

	// Server state
	let awaitingRadioCallCheck: boolean = false;
	let serverNotResponding: boolean = false;
	let nullRoute: boolean = false;

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	$: if (serverNotResponding) {
		modalStore.trigger({
			type: 'alert',
			title: 'Server did not respond',
			body: 'This may be due to a bad request or the feature you are trying to use not being implemented yet. This software is still early in development, expect errors like this one.'
		});
	}

	$: if (nullRoute) {
		modalStore.trigger({
			type: 'alert',
			title: 'No Route Generated',
			body: 'After 1000 iterations no feasible route was generated for this seed. Please try another one. The route generation is not finalised and will frequently encounter issues like this one. '
		});
	}

	$: if (readRecievedCalls && atcMessage) {
		speakATCMessage();
	}

	RouteStore.subscribe((value) => {
		route = value;
	});

	SpeechOutputEnabledStore.subscribe((value) => {
		readRecievedCalls = value;
	});

	LiveFeedbackStore.subscribe((value) => {
		liveFeedback = value;
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

	CurrentRoutePointIndexStore.subscribe((value) => {
		if (value < 0) {
			value = 0;
		}

		if (route.length > 0 && value >= route.length) {
			console.log('Invalid route point index: ' + value);
		} else {
			currentPointIndex = value;
		}
	});

	EndPointIndexStore.subscribe((value) => {
		if (route && value >= route.length) {
			value = route.length - 1;
		}

		endPointIndex = value;
	});

	/**
	 * Reads out the current atc message using the speech synthesis API
	 *
	 * @remarks
	 * If the speech synthesis API is not supported in the current browser, then an error is logged to the console.
	 *
	 * @returns void
	 */
	function speakATCMessage(): void {
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

	/**
	 * Checks the client state (radio frequency, transponder frequency, ...) matches the server state
	 *
	 * @remarks
	 * This function checks the client state against the server state to ensure the client is in the correct state to make a radio call.
	 *
	 * @returns boolean
	 */
	function checkClientStateMatchesServerState(): boolean {
		if (radioState.dialMode == 'OFF') {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Radio is off'
			});
			return false;
		} else if (transponderState.dialMode == 'OFF') {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Transponder is off'
			});
			return false;
		} else if (
			radioState.activeFrequency.toFixed(3) !=
			route[currentPointIndex].updateData.currentTargetFrequency.toFixed(3)
		) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Radio frequency incorrect'
			});
			return false;
		} else if (
			transponderState.frequency != route[currentPointIndex].updateData.currentTransponderFrequency
		) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Transponder frequency incorrect'
			});
			return false;
		}

		return true;
	}

	/**
	 * Handles the feedback from the server
	 *
	 * @remarks
	 * This function handles the feedback from the server and adjusts the simulator state accordingly.
	 * A modal is shown if the user has made 3 mistakes in a row, asking if they want to be given the correct call.
	 *
	 * @param serverResponse - The server response
	 * @returns void
	 */
	function handleFeedback(serverResponse: ServerResponse) {
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

		if (liveFeedback) {
			// Clear previous toasts so only one feedback shown at a time
			toastStore.clear();

			// Do nothing if the call was flawless
			if (!feedback.isFlawless()) {
				// Show current mistakes
				const t: ToastSettings = {
					message: feedback.getMistakes().join('\n'),
					timeout: 15000,
					hoverable: true,
					background: 'variant-filled-warning'
				};
				toastStore.trigger(t);
			}
		}

		// Get whether there are severe mistakes, and record all minor ones
		let callsignMentioned: boolean = currentRadioCall.callContainsUserCallsign();
		let minorMistakes: string[] = feedback.getMinorMistakes();
		let severeMistakes: string[] = feedback.getSevereMistakes();

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

		// Reset failed attempts
		failedAttempts = 0;
	}

	/**
	 * Handles the submit radio message event
	 *
	 * @remarks
	 * This function handles the submit event and sends the user message to the server for processing.
	 * It also handles the feedback from the server and adjusts the simulator state accordingly.
	 *
	 * @returns void
	 */
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
		if (route.length == 0) {
			console.log('Error: No route');
			modalStore.trigger({
				type: 'alert',
				title: 'Connection to server failed',
				body: 'This may be due to the server being offline. Come back later and try again.'
			});
			return;
		}

		// Ensure the client state (adjustable UI elements such as transponder frequency) matches the server state
		if (!checkClientStateMatchesServerState()) {
			return;
		}

		// Send message to server, use a lock to prevent multiple calls
		awaitingRadioCallCheck = true;
		let tempServerResponse = await checkRadioCallByServer();
		if (tempServerResponse === undefined || tempServerResponse === null) {
			// Handle error
			serverNotResponding = true;
			awaitingRadioCallCheck = false;

			return;
		}

		// Set server response and flags to false
		const serverResponse = tempServerResponse;
		awaitingRadioCallCheck = false;
		serverNotResponding = false;

		// Adjust the simulator state based on the feedback
		handleFeedback(serverResponse);

		// If the user has reached the end of the route, then show a modal asking if they want to view their feedback
		if (currentPointIndex == endPointIndex) {
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
		CurrentRoutePointIndexStore.set(currentPointIndex + 1);
		CurrentRoutePointStore.set(route[currentPointIndex]);
		ATCMessageStore.set(serverResponse.responseCall);
		CurrentTargetStore.set(route[currentPointIndex].updateData.currentTarget);
	}

	/**
	 * Initiates the scenario
	 *
	 * @remarks
	 * This function initiates the scenario by getting the route and waypoints from the server.
	 *
	 * @returns void
	 */
	async function initiateScenario() {
		// Get the state from the server
		const serverRouteResponse = await getRouteFromServer();
		const serverWaypointsResponse = await getWaypointsFromServer();

		if (serverRouteResponse === undefined || serverWaypointsResponse === undefined) {
			// Handle error
			nullRoute = true;

			return 0;
		} else {
			console.log(serverRouteResponse);
			console.log(serverWaypointsResponse);

			// Update stores with the route
			CurrentTargetStore.set(serverRouteResponse[currentPointIndex].updateData.currentTarget);
			CurrentTargetFrequencyStore.set(
				serverRouteResponse[currentPointIndex].updateData.currentTargetFrequency
			);
			RouteStore.set(serverRouteResponse);
			CurrentRoutePointStore.set(serverRouteResponse[currentPointIndex]);
			WaypointStore.set(serverWaypointsResponse);

			// By default end point index is set to -1 to indicate the user has not set the end of the route in the url
			// So we need to set it to the last point in the route if it has not been set
			if (endPointIndex == -1) {
				EndPointIndexStore.set(serverRouteResponse.length - 1);
			}
		}
	}

	/**
	 * Gets the route from the server
	 *
	 * @remarks
	 * This function gets the route from the server.
	 *
	 * @returns Promise<RoutePoint[] | undefined>
	 */
	async function getRouteFromServer(): Promise<RoutePoint[] | undefined> {
		try {
			const response = await axios.get(
				`/scenario/seed=${seed.seedString}/route?airborneWaypoints=${airborneWaypoints}&hasEmergency=${hasEmergency}`
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

	/**
	 * Gets the waypoints from the server
	 *
	 * @remarks
	 * This function gets the waypoints from the server.
	 *
	 * @returns Promise<Waypoint[] | undefined>
	 */
	async function getWaypointsFromServer(): Promise<Waypoint[] | undefined> {
		try {
			const response = await axios.get(
				`/scenario/seed=${seed.seedString}/waypoints?airborneWaypoints=${airborneWaypoints}`
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

	/**
	 * Checks the radio call by the server
	 *
	 * @remarks
	 * This function checks the radio call by the server.
	 *
	 * @returns Promise<ServerResponse | undefined>
	 */
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
				airborneWaypoints,
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

			const response = await axios.post(`/scenario/seed=${seed.scenarioSeed}/parse`, {
				data: currentRadioCall.getJSONData()
			});

			return response.data;
		} catch (error) {
			console.error('Error: ', error);
		}
	}

	onMount(async () => {
		initiateScenario();

		if (window.SpeechRecognition || window.webkitSpeechRecognition) {
			speechRecognitionSupported = true;
		} else {
			speechRecognitionSupported = false;
		}
	});
</script>

<div class="w-full sm:w-9/12">
	<div class="flex flex-row place-content-center gap-5 py-3 md:py-5 flex-wrap px-2">
		<div class="w-50%"><MessageInput {speechRecognitionSupported} on:submit={handleSubmit} /></div>

		<MessageOutput />

		<Radio />

		<Transponder />

		<Map enabled={mapEnabled} />

		<!-- <Kneeboard /> -->

		<!-- <ScenarioLink /> -->
	</div>
</div>
