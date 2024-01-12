import * as RandomSeed from 'random-seed';
import type { Location } from './States';

// Function to generate a seeded normal distribution
export function seededNormalDistribution(seed: string, mean: number, standardDeviation: number): number {
    const rand = RandomSeed.create(seed);
    
    // Generate two random numbers using the Box-Muller transform
    const u1 = rand.random();
    const u2 = rand.random();

    // Box-Muller transform
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Scale and shift to get the desired mean and standard deviation
    const result = z0 * standardDeviation + mean;

    return result;
}

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