import type {
	COMFrequency,
	Pose,
	SimulatorUpdateData,
	Location,
	Aerodrome,
	RoutePointState,
    METORData,
    METORDataSample
} from './States';

import smallAerodromes from '../../data/small_aerodromes.json';
import largeAerodromes from '../../data/large_aerodromes.json';

const MAX_AERODROME_DISTANCE = 100000; // 100km

enum Season {
    Spring,
    Summer,
    Autumn,
    Winter,
}

/* A point on the route used in generation. Not neccisarily visible to the user */
export type RoutePoint = {
	pose: Pose;
	name: string;
	comFrequencies: COMFrequency[];
	states: SimulatorUpdateData[];
};

export function haversineDistance(location1: Location, location2: Location): number {
	const R = 6371e3; // metres
	const φ1 = (location1.lat * Math.PI) / 180; // φ, λ in radians
	const φ2 = (location2.lat * Math.PI) / 180;
	const Δφ = ((location2.lat - location1.lat) * Math.PI) / 180;
	const Δλ = ((location2.long - location1.long) * Math.PI) / 180;

	return (
		2 *
		R *
		Math.asin(
			Math.sqrt(
				Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
					Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
			)
		)
	);
}

/* Route generated for a scenario. */
export class Route {
	protected points: RoutePoint[] = [];

    /* Get a start aerodrome. */
	public static getStartAerodrome(seed: number): Aerodrome {
		return smallAerodromes[seed % smallAerodromes.length];
	}

    /* Get an end aerodrome that is within the maximum distance from the start aerodrome. */
	public static getEndAerodrome(seed: number): Aerodrome {
		const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);
		let endAerodrome: Aerodrome = largeAerodromes[seed % largeAerodromes.length];
        let endAerodromeFound: boolean = false;

        // If the end aerodrome is too far from the start aerodrome, find a new one
		for (let i = 0; i < 1000; i++) {
			const distance = haversineDistance(startAerodrome.location, endAerodrome.location);

            if (distance <= MAX_AERODROME_DISTANCE) {
                endAerodromeFound = true;
                break;
            }

            endAerodrome = largeAerodromes[(seed + i) % largeAerodromes.length];
		}

        if (!endAerodromeFound) {
            throw new Error('Could not find an end aerodrome within the maximum distance: ' + MAX_AERODROME_DISTANCE + 'm');
        }

        return endAerodrome;
	}

    public static getMETORSample(seed: number, metor_data: METORData): METORDataSample {
        let season: Season = Season.Spring;
        let meanTemp: number = 0.0;

        switch (seed % 4) {
            case 0:
                season = Season.Spring;
                meanTemp = metor_data.meanTemperature * 1.3;
                break;
            case 1:     
            
            season = Season.Summer;
            meanTemp = metor_data.meanTemperature * 1.7;
            
                break;
            case 2: season =Season.Autumn;
            meanTemp = metor_data.meanTemperature * 1.1;
            break;
            case 3: season = Season.Winter;
            meanTemp = metor_data.meanTemperature * 0.4;
            break;
        };
    
        // Simulate temperature, wind direction, wind speed and pressure with a normal distribution
        let wind_direction_normal = Normal::new(metor_data.avgWindDirection, 10.0);
        let wind_direction = wind_direction_normal.sample(rng) % 360.0;
    
        let temp_normal = Normal::new(meanTemp, metor_data.stdTemperature);
        let temp = temp_normal.sample(rng);
    
        let wind_speed_normal =
            Normal::new(metor_data.meanWindSpeed, metor_data.stdWindSpeed);
        let wind_speed = wind_speed_normal.sample(rng);
    
        let pressure_normal = Normal::new(metor_data.meanPressure, metor_data.stdTemperature).unwrap();
        let pressure = pressure_normal.sample(rng);
    
        return {
            windDirection: wind_direction,
            windSpeed: wind_speed,
            pressure: pressure,
            temperature: temp,
            dewpoint: ((temp * 0.95) - 1.2), // this needs improving
        };
    }

    /* Generate the route based off of the seed. */
	public generateRoute(seed: number): RoutePoint[] {
		const startAerodrome: Aerodrome = Route.getStartAerodrome(seed);
		const startAerodromeStates: RoutePointState[] = getStartAerodromeStates(seed);
		let startAerodromeRoutePoint: RoutePoint = {
			pose: startAerodromeStates[0].pose,
			name: startAerodrome.name,
			comFrequencies: startAerodrome.comFrequencies,
			states: startAerodromeStates
		};

		this.points.push(startAerodromeRoutePoint);

		this.points.push(...getEnrouteWaypoints(seed));

		const endAerodrome: Aerodrome = Route.getEndAerodrome(seed);
		const endAerodromeStates: RoutePointState[] = getEndAerodromeStates(seed);
		let endAerodromeRoutePoint: RoutePoint = {
			pose: endAerodromeStates[0].pose,
			name: endAerodrome.name,
			comFrequencies: endAerodrome.comFrequencies,
			states: endAerodromeStates
		};

		this.points.push(endAerodromeRoutePoint);

		console.log('Route points:');
		for (let i = 0; i < this.points.length; i++) {
			console.log(this.points[i].name);
		}

		return this.points;
	}

	public getPoints(): RoutePoint[] {
		return this.points;
	}

	public getStartPoint(): RoutePoint {
		return this.points[0];
	}

	public getEndPoint(): RoutePoint {
		return this.points[this.points.length - 1];
	}
}
