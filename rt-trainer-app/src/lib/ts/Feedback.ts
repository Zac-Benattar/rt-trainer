export class Feedback {
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

    public callValid(): boolean {
        return this.severeMistakes.length == 0;
    }

	public isFlawless(): boolean {
		return this.severeMistakes.length == 0 && this.minorMistakes.length == 0;
	}

    public pushSevereMistake(mistake: string): void {
        this.severeMistakes.push(mistake);
    }

    public pushMinorMistake(mistake: string): void {
        this.minorMistakes.push(mistake);
    }

	public getJSONData(): string {
		return JSON.stringify({
			severeMistakes: this.severeMistakes,
			minorMistakes: this.minorMistakes
		});
	}
}
