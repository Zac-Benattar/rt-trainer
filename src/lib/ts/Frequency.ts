export class Frequency {
	value: string;
	unit: number;
	name: string;
    type: number;
	primary: boolean;

    constructor(value: string, unit: number, name: string, type: number, primary: boolean) {
        this.value = value;
        this.unit = unit;
        this.name = name;
        this.type = type;
        this.primary = primary;
    }
}
