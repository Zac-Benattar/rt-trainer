export default class Feedback {
	private severeMistakes: string[];
	private minorMistakes: string[];

	constructor() {
		this.minorMistakes = [];
		this.severeMistakes = [];
	}

	public getMistakes(): string[] {
		const mistakes: string[] = [];
		mistakes.push(...this.minorMistakes);
		mistakes.push(...this.severeMistakes);
		return mistakes;
	}

	public getSevereMistakes(): string[] {
		return this.severeMistakes;
	}

	public getMinorMistakes(): string[] {
		return this.minorMistakes;
	}

	public getSevereMistakesCount(): number {
		return this.severeMistakes.length;
	}

	public getMinorMistakesCount(): number {
		return this.minorMistakes.length;
	}

	public getTotalMistakes(): number {
		return this.severeMistakes.length + this.minorMistakes.length;
	}

	/**
	 * Returns true if the call is valid, meaning no severe mistakes were made.
	 * Minor mistakes are allowed.
	 */
	public callValid(): boolean {
		return this.severeMistakes.length == 0;
	}

	/**
	 * Returns true if the call is flawless, meaning no mistakes, minor or severe, were made.
	 */
	public isFlawless(): boolean {
		return this.severeMistakes.length == 0 && this.minorMistakes.length == 0;
	}

	/**
	 * Pushes a mistake to the feedback object. By default mistake is considered minor.
	 * If true is passed as second parameter, it is deemed severe.
	 *
	 * @param mistakeDescription The string discription of the mistake. "Your call did not include..."
	 * @param severe (Optional) The severity of the mistake. Defaults to false (minor mistake)
	 */
	public pushMistake(mistakeDescription: string, severe: boolean): void {
		if (severe) {
			this.severeMistakes.push(mistakeDescription);
		} else {
			this.minorMistakes.push(mistakeDescription);
		}
	}

	public getJSONData(): string {
		return JSON.stringify({
			severeMistakes: this.severeMistakes,
			minorMistakes: this.minorMistakes
		});
	}
}
