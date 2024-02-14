export default abstract class RouteElement {
	name: string;
	geometry: [number, number][];

	constructor(name: string, geometry: [number, number][]) {
		this.name = name;
		this.geometry = geometry;
	}

	public abstract getName(): string;

	public abstract getCoords(): [number, number][];

	public getLeafletCoords(): [number, number][] {
		return this.getCoords().map((coord) => [coord[1], coord[0]]);
	}
}
