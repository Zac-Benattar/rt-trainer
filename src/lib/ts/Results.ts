import { AirborneStage, LandingStage, StartAerodromeStage } from '$lib/ts/ScenarioStages';
import type RadioCall from './RadioCall';

export default class Results {
	private radioCalls: RadioCall[];

	constructor(radioCalls: RadioCall[]) {
		this.radioCalls = radioCalls;
	}

	public isEmpty(): boolean {
		return this.radioCalls.length === 0;
	}

	public getRadioCalls(): RadioCall[][] {
		if (this.radioCalls.length === 0) {
			return [];
		}

		const callsByCallType: RadioCall[][] = [];
		let currentCalls: RadioCall[] = [];
		let stage: string = this.radioCalls[0].getCurrentScenarioPoint().stage;
		for (let i = 0; i < this.radioCalls.length; i++) {
			const radioCall = this.radioCalls[i];

			if (radioCall.getCurrentScenarioPoint().stage === stage) {
				currentCalls.push(radioCall);
			} else {
				callsByCallType.push(currentCalls);
				stage = radioCall.getCurrentScenarioPoint().stage;
				currentCalls = [];
			}
		}
		callsByCallType.push(currentCalls);

		return callsByCallType;
	}

	public getStartUpAndTaxiCalls(): RadioCall[][] {
		const calls: RadioCall[][] = this.getRadioCalls();
		if (calls[0].length === 0) {
			return [];
		}
		return calls.filter((calls) =>
			Object.values(StartAerodromeStage).includes(calls[0].getCurrentScenarioPoint().stage)
		);
	}

	public getAirborneCalls(): RadioCall[][] {
		const calls: RadioCall[][] = this.getRadioCalls();
		if (calls[0].length === 0) {
			return [];
		}
		return calls.filter((calls) =>
			Object.values(AirborneStage).includes(calls[0].getCurrentScenarioPoint().stage)
		);
	}

	public getLandingCalls(): RadioCall[][] {
		const calls: RadioCall[][] = this.getRadioCalls();
		if (calls[0].length === 0) {
			return [];
		}
		return calls.filter((calls) =>
			Object.values(LandingStage).includes(calls[0].getCurrentScenarioPoint().stage)
		);
	}
}
