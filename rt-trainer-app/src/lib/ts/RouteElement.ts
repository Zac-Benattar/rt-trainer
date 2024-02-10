export default abstract class RouteElement {
	protected name: string;
	protected coords: [number, number][];

	constructor(name: string, coords: [number, number][]) {
		this.name = name;
		this.coords = coords;
	}

	public abstract getName(): string;

	public abstract getCoords(): [number, number][];

    public getLeafletCoords(): [number, number][] {
        return this.getCoords().map((coord) => [coord[1], coord[0]]);
    }
}
