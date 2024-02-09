import { getAllUKAirports } from "./OpenAIPHandler";
import type RoutePoint from "./RoutePoints";
import type Seed from "./Seed";

// TODO
export default class RouteGenerator {
    public static async getRouteWaypoints(seed: Seed, airborneWaypoints: number): Promise<RoutePoint[]> {
        const airports = await getAllUKAirports();
        console.log(airports);

        return [];
    }
}