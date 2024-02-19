import type { Airport } from './Airport';
import type Airspace from './Airspace';
import type { Waypoint } from './Waypoint';

export type Route = {
	waypoints: Waypoint[];
	airports: Airport[];
	airspaces: Airspace[];
};
