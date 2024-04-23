<script lang="ts">
	import { SpeechSynthesis } from 'speech-synthesis';
	import Radio from './SimulatorComponents/Radio.svelte';
	import Transponder from './SimulatorComponents/Transponder.svelte';
	import Map from './Leaflet/Map.svelte';
	import 'leaflet/dist/leaflet.css';
	import MessageInput from './SimulatorComponents/MessageInput.svelte';
	import MessageOutput from './SimulatorComponents/MessageOutput.svelte';
	import type { ServerResponse } from '$lib/ts/ServerClientTypes';
	import { onMount } from 'svelte';
	import type { ModalSettings, ToastSettings } from '@skeletonlabs/skeleton';
	import { getModalStore, getToastStore, Stepper, Step } from '@skeletonlabs/skeleton';
	import {
		RadioStateStore,
		TransponderStateStore,
		UserMessageStore,
		MostRecentlyReceivedMessageStore,
		CurrentTargetStore,
		ScenarioStore,
		AircraftDetailsStore,
		SpeechOutputEnabledStore,
		ExpectedUserMessageStore,
		CurrentTargetFrequencyStore,
		RadioCallsHistoryStore,
		LiveFeedbackStore,
		CurrentScenarioPointIndexStore,
		EndPointIndexStore,
		TutorialStore,
		AltimeterStateStore,
		WaypointPointsMapStore,
		WaypointsStore,
		OnRouteAirspacesStore,
		CurrentScenarioPointStore,
		CurrentScenarioContextStore,

		SpeechNoiseStore

	} from '$lib/stores';
	import type {
		TransponderState,
		AircraftDetails,
		RadioState,
		AltimeterState
	} from '$lib/ts/SimulatorTypes';
	import { isCallsignStandardRegistration, replaceWithPhoneticAlphabet } from '$lib/ts/utils';
	import { goto } from '$app/navigation';
	import RadioCall from '$lib/ts/RadioCall';
	import Feedback from '$lib/ts/Feedback';
	import Altimeter from './SimulatorComponents/Altimeter.svelte';
	import Scenario, { checkRadioCallByServer } from '$lib/ts/Scenario';
	import Polyline from '$lib/Components/Leaflet/Polyline.svelte';
	import Polygon from '$lib/Components/Leaflet/Polygon.svelte';
	import Popup from '$lib/Components/Leaflet/Popup.svelte';
	import Marker from '$lib/Components/Leaflet/Marker.svelte';
	import type Waypoint from '$lib/ts/AeronauticalClasses/Waypoint';
	import type Airspace from '$lib/ts/AeronauticalClasses/Airspace';
	import { WaypointType } from '$lib/ts/AeronauticalClasses/Waypoint';
	import L from 'leaflet';

	// Simulator state and settings
	let seed: string;
	let aircraftDetails: AircraftDetails; // Current settings of the simulator
	let radioState: RadioState; // Current radio settings
	let transponderState: TransponderState; // Current transponder settings
	let altimeterState: AltimeterState;
	let atcMessage: string;
	let userMessage: string;
	let currentTarget: string;
	let currentTargetFrequency: string;
	let scenario: Scenario | undefined = undefined;
	let currentRoutePointIndex: number = 0;
	let endPointIndex: number = 0;
	let failedAttempts: number = 0;
	let currentRadioCall: RadioCall;
	let currentSimConext: string;

	// Page settings
	let speechRecognitionSupported: boolean = false; // Speech recognition is not supported in all browsers e.g. firefox
	let speechNoiseLevel: number = 0;
	let readRecievedCalls: boolean = false;
	let liveFeedback: boolean = false;
	let tutorialStep4: boolean = false;

	// Tutorial state
	let tutorialEnabled: boolean = false;
	let tutorialComplete: boolean = false;
	let tutorialStep: number = 1;

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
		speakATCMessageWithNoise(speechNoiseLevel);
	}

	$: tutorialStep2 = transponderState?.dialMode == 'SBY' && radioState?.dialMode == 'SBY';
	$: tutorialStep3 =
		radioState?.activeFrequency == scenario?.getCurrentPoint().updateData.currentTargetFrequency;

	ScenarioStore.subscribe((value) => {
		scenario = value;
	});

	SpeechOutputEnabledStore.subscribe((value) => {
		readRecievedCalls = value;
	});

	SpeechNoiseStore.subscribe((value) => {
		speechNoiseLevel = value;
	});

	LiveFeedbackStore.subscribe((value) => {
		liveFeedback = value;
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

	AltimeterStateStore.subscribe((value) => {
		altimeterState = value;
	});

	UserMessageStore.subscribe((value) => {
		userMessage = value;
	});

	MostRecentlyReceivedMessageStore.subscribe((value) => {
		atcMessage = value;
	});

	CurrentScenarioContextStore.subscribe((value) => {
		currentSimConext = value;
	});

	CurrentScenarioPointIndexStore.subscribe((value) => {
		currentRoutePointIndex = value;
	});

	CurrentTargetStore.subscribe((value) => {
		currentTarget = value;
	});

	CurrentTargetFrequencyStore.subscribe((value) => {
		currentTargetFrequency = value;
	});

	EndPointIndexStore.subscribe((value) => {
		if (scenario && scenario.scenarioPoints && value >= scenario.scenarioPoints.length) {
			value = scenario.scenarioPoints.length - 1;
		}

		endPointIndex = value;
	});

	TutorialStore.subscribe((value) => {
		tutorialEnabled = value;
	});

	const onRouteAirspaces: Airspace[] = [];
	OnRouteAirspacesStore.subscribe((value) => {
		onRouteAirspaces.length = 0;
		onRouteAirspaces.push(...value);
	});

	const waypoints: Waypoint[] = [];
	WaypointsStore.subscribe((value) => {
		waypoints.length = 0;
		waypoints.push(...value);
	});

	let waypointPoints: number[][] = [];
	let bounds: L.LatLngBounds;
	let bbox: number[] = [];
	WaypointPointsMapStore.subscribe((value) => {
		waypointPoints = value;
	});

	let position: number[] = [0, 0];
	let displayHeading: number = 0;
	let altitude: number = 0;
	let airSpeed: number = 0;

	CurrentScenarioPointStore.subscribe((value) => {
		position = value?.pose.position.reverse() ?? [0, 0];
		displayHeading = value?.pose.trueHeading ? value?.pose.trueHeading - 45 : 0;
		altitude = value?.pose.altitude ?? 0;
		airSpeed = value?.pose.airSpeed ?? 0;
	});

	/**
	 * Reads out the current atc message using the speech synthesis API, with added static noise
	 *
	 * @remarks
	 * If the speech synthesis API is not supported in the current browser, then an error is logged to the console.
	 *
	 * @returns void
	 */
	function speakATCMessageWithNoise(noiseLevel: number): void {
		if ('speechSynthesis' in window) {
			// Get the speech synthesis API and audio context
			const synth = window.speechSynthesis;
			const audioContext = new AudioContext();

			// Create speech synthesis utterance and noise buffer
			const speech = new SpeechSynthesisUtterance(atcMessage);
			const noiseBuffer = generateStaticNoise(45, speech.rate * 44100);
			const noiseSource = new AudioBufferSourceNode(audioContext, { buffer: noiseBuffer });
			const gainNode = new GainNode(audioContext);
			synth.speak(speech);

			// Adjust the gain based on the noise level
			gainNode.gain.value = noiseLevel;

			// Connect nodes
			noiseSource.connect(gainNode).connect(audioContext.destination);
			noiseSource.start();

			// Stop the noise after the speech has finished
			speech.onend = () => {
				noiseSource.stop();
			};
		} else {
			console.error('SpeechSynthesis API is not supported in this browser.');
		}
	}

	/**
	 * Generates static noise for the speech synthesis API in the form of an AudioBuffer
	 * @param duration - The duration of the noise in seconds
	 * @param sampleRate - The sample rate of the noise
	 * 
	 * @returns AudioBuffer
	 */
	function generateStaticNoise(duration: number, sampleRate: number) {
		const bufferSize = sampleRate * duration;
		const buffer = new AudioBuffer({ length: bufferSize, numberOfChannels: 1, sampleRate });
		const data = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}

		return buffer;
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
			radioState.activeFrequency != scenario?.getCurrentPoint().updateData.currentTargetFrequency
		) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Radio frequency incorrect'
			});
			return false;
		} else if (
			transponderState.frequency !=
			scenario?.getCurrentPoint().updateData.currentTransponderFrequency
		) {
			modalStore.trigger({
				type: 'alert',
				title: 'Error',
				body: 'Transponder frequency incorrect'
			});
			return false;
		} else if (altimeterState.pressure != scenario?.getCurrentPoint().updateData.currentPressure) {
			// modalStore.trigger({
			// 	type: 'alert',
			// 	title: 'Error',
			// 	body: 'Altimeter pressure setting incorrect'
			// });
			// return false;
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
	function handleFeedback(serverResponse: ServerResponse): boolean {
		// Update stores with the radio call and feedback
		const feedbackData = JSON.parse(serverResponse.feedbackDataJSON);
		const feedback = new Feedback();
		feedbackData.minorMistakes.forEach((element: string) => {
			feedback.pushMistake(element, false);
		});
		feedbackData.severeMistakes.forEach((element: string) => {
			feedback.pushMistake(element, true);
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
					message: feedback.getMistakes().join('<br>'),
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

				return false;
			}

			// Make ATC respond with say again and do not advance the simulator
			if (callsignMentioned) {
				if (isCallsignStandardRegistration(aircraftDetails.callsign)) {
					MostRecentlyReceivedMessageStore.set(
						aircraftDetails.prefix +
							' ' +
							replaceWithPhoneticAlphabet(aircraftDetails.callsign) +
							' Say Again'
					);
				} else {
					MostRecentlyReceivedMessageStore.set(
						aircraftDetails.prefix + ' ' + aircraftDetails.callsign + ' Say Again'
					);
				}
			} else {
				MostRecentlyReceivedMessageStore.set('Station Calling, Say Again Your Callsign');
			}

			return false;
		} else if (minorMistakes.length > 0) {
			// Show a toast with the minor mistakes and advance scenario
			const t: ToastSettings = {
				message: 'Correct with minor mistakes: ' + minorMistakes.join('<br>') + '.'
			};
			toastStore.trigger(t);
		} else {
			const t: ToastSettings = {
				message: 'Correct!'
			};
			toastStore.trigger(t);
		}

		tutorialStep4 = true;
		// Reset failed attempts
		failedAttempts = 0;

		return true;
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
		if (scenario == undefined) {
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
		currentRadioCall = new RadioCall(
			userMessage,
			seed,
			scenario,
			aircraftDetails.prefix,
			aircraftDetails.callsign,
			scenario.getCurrentPoint().updateData.callsignModified,
			transponderState.vfrHasExecuted,
			currentTarget,
			currentTargetFrequency,
			radioState.activeFrequency,
			transponderState.frequency,
			aircraftDetails.aircraftType
		);
		let tempServerResponse = await checkRadioCallByServer(currentRadioCall);
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
		if (!handleFeedback(serverResponse)) return;

		// If the user has reached the end of the route, then show a modal asking if they want to view their feedback
		if (currentRoutePointIndex == endPointIndex) {
			const m: ModalSettings = {
				type: 'confirm',
				title: 'Scenario Complete',
				body: 'Do you want view your feedback?',
				response: (r: boolean) => {
					if (r) {
						goto('/scenario/results/');
					}
				}
			};
			modalStore.trigger(m);

			return;
		}

		// Update the simulator with the next scenario point
		CurrentScenarioPointIndexStore.update((value) => {
			value++;
			return value;
		});
		MostRecentlyReceivedMessageStore.set(serverResponse.responseCall);
	}

	function onStepHandler(e: {
		detail: { state: { current: number; total: number }; step: number };
	}): void {
		tutorialStep = e.detail.state.current + 1;
	}

	function onCompleteHandler(e: Event): void {
		tutorialComplete = true;
	}

	function cancelTutorial(): void {
		tutorialEnabled = false;
	}

	onMount(async () => {
		if (window.SpeechRecognition || window.webkitSpeechRecognition) {
			speechRecognitionSupported = true;
		} else {
			speechRecognitionSupported = false;
		}
	});
</script>

<div class="w-full max-w-screen-lg p-5">
	<div class="flex flex-row place-content-center gap-5 flex-wrap">
		{#if tutorialEnabled && !tutorialComplete}
			<div class="card bg-primary-900 text-white p-3 rounded-lg sm:w-7/12 sm:mx-10">
				<Stepper on:complete={onCompleteHandler} on:step={onStepHandler}>
					<Step>
						<svelte:fragment slot="header">Get Started!</svelte:fragment>
						Welcome to RT Trainer. This tutorial will explain how to use the simulator. <br />Click
						<span class="underline">next</span>
						to continue.
						<svelte:fragment slot="navigation">
							<button class="btn variant-ghost-warning" on:click={cancelTutorial}
								>Skip Tutorial</button
							>
						</svelte:fragment>
					</Step>
					<Step locked={!tutorialStep2}>
						<svelte:fragment slot="header">Turning on your Radio Stack</svelte:fragment>
						<ul class="list-disc ml-5">
							<li>Turn on your radio by clicking on the dial or standby (SBY) label.</li>
							<li>Set your transponder to standby in the same way.</li>
						</ul>
					</Step>
					<Step locked={!tutorialStep3}>
						<svelte:fragment slot="header">Setting Your Radio Frequency</svelte:fragment>
						Set your radio frequency to the current target frequency shown in the message output box.
					</Step>
					<Step locked={!tutorialStep4}>
						<svelte:fragment slot="header">Make your first Radio Call</svelte:fragment>
						Now you are ready to make your first radio call.
						<ul class="list-disc ml-5">
							<li>Type your message in the input box.</li>
							<li>Or enable speech input and say your message out loud.</li>
							<li>
								Your callsign is `{aircraftDetails.prefix}
								{aircraftDetails.callsign}`. You can change this in your
								<a href="/profile">profile settings</a>.
							</li>
						</ul>
					</Step>
					<Step>
						<svelte:fragment slot="header">Well Done!</svelte:fragment>
						You have completed the basic tutorial. Familiarise yourself with the rest of the simulator
						and complete the route.
					</Step>
				</Stepper>
			</div>
		{/if}

		<div class="flex flex-col place-content-evenly sm:grid sm:grid-cols-2 gap-5">
			<MessageOutput />

			<MessageInput {speechRecognitionSupported} on:submit={handleSubmit} />
		</div>

		<Radio />

		<Transponder />

		<div class="card p-2 rounded-md w-[420px] h-[452px] bg-neutral-600 flex flex-row grow">
			<div class="w-full h-full">
				<Map view={scenario?.getCurrentPoint().pose.position} zoom={9}>
					{#if waypointPoints.length > 0}
						{#each waypoints as waypoint (waypoint.index)}
							{#if waypoint.index == waypoints.length - 1 || waypoint.type == WaypointType.Airport}
								<Marker
									latLng={[waypoint.location[1], waypoint.location[0]]}
									width={50}
									height={50}
									aeroObject={waypoint}
									on:click={(e) => {
										e.preventDefault();
									}}
									on:mouseover={(e) => {
										e.detail.marker.openPopup();
									}}
									on:mouseout={(e) => {
										e.detail.marker.closePopup();
									}}
								>
									{#if waypoint.index == waypoints.length - 1}
										<div class="text-2xl">🏁</div>
									{:else if waypoint.type == WaypointType.Airport}
										<div class="text-2xl">🛫</div>
									{/if}

									<Popup
										><div class="flex flex-col gap-2">
											<div>{waypoint.name}</div>
										</div></Popup
									></Marker
								>
							{:else}
								<Marker
									latLng={[waypoint.location[1], waypoint.location[0]]}
									width={50}
									height={50}
									aeroObject={waypoint}
									iconAnchor={L.point(8, 26)}
									on:click={(e) => {
										e.preventDefault();
									}}
									on:mouseover={(e) => {
										e.detail.marker.openPopup();
									}}
									on:mouseout={(e) => {
										e.detail.marker.closePopup();
									}}
								>
									<div class="text-2xl">🚩</div>

									<Popup
										><div class="flex flex-col gap-2">
											<div>{waypoint.name}</div>
										</div></Popup
									></Marker
								>
							{/if}
						{/each}
					{/if}

					{#each waypointPoints as waypointPoint, index}
						{#if index > 0}
							<!-- Force redraw if either waypoint of the line changes location -->
							{#key [waypointPoints[index - 1], waypointPoints[index]]}
								<Polyline
									latLngArray={[waypointPoints[index - 1], waypointPoints[index]]}
									colour="#FF69B4"
									fillOpacity={1}
									weight={7}
								/>
							{/key}
						{/if}
					{/each}

					{#each onRouteAirspaces as airspace}
						{#if airspace.type == 14}
							<Polygon
								latLngArray={airspace.coordinates[0].map((point) => [point[1], point[0]])}
								color={'red'}
								fillOpacity={0.2}
								weight={1}
								on:click={(e) => {
									e.preventDefault();
								}}
								on:mouseover={(e) => {
									e.detail.polygon.openPopup();
								}}
								on:mouseout={(e) => {
									e.detail.polygon.closePopup();
								}}
							/>
						{:else}
							<Polygon
								latLngArray={airspace.coordinates[0].map((point) => [point[1], point[0]])}
								color={'blue'}
								fillOpacity={0.2}
								weight={1}
								on:click={(e) => {
									e.preventDefault();
								}}
								on:mouseover={(e) => {
									e.detail.polygon.openPopup();
								}}
								on:mouseout={(e) => {
									e.detail.polygon.closePopup();
								}}
							/>
						{/if}
					{/each}

					{#key position}
						<Marker latLng={position} width={50} height={50} rotation={displayHeading}>
							<div class="text-2xl">🛩️</div>

							<Popup
								><div class="flex flex-col gap-2">
									<div>
										<!-- Lat, Long format -->
										<div>{position[1].toFixed(6)}</div>
										<div>{position[0].toFixed(6)}</div>
									</div>
								</div></Popup
							>
						</Marker>
					{/key}
				</Map>
			</div>
		</div>

		<Altimeter />

		<div class="w-full flex flex-row flex-wrap gap-5 p-2 text-neutral-600/50">
			<div>
				Your callsign: {aircraftDetails.prefix}
				{aircraftDetails.callsign}
			</div>
			<div>
				Your aircraft type: {aircraftDetails.aircraftType}
			</div>
		</div>
	</div>
</div>
