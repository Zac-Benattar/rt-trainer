export class Frequency {
	value: string;
	unit: number;
	name: string;
	primary: boolean;

    constructor(value: string, unit: number, name: string, primary: boolean) {
        this.value = value;
        this.unit = unit;
        this.name = name;
        this.primary = primary;
    }
}
