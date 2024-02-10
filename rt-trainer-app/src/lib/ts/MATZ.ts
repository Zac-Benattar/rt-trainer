import ATZ from './ATZ';

export default class MATZ extends ATZ {
	constructor(name: string, coords: [number, number][]) {
		super(name, coords);
	}

	public getName(): string {
		return this.name + ' MATZ';
	}
}
