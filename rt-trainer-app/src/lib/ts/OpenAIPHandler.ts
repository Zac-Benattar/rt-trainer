import { OpenAIPHealthStore } from '$lib/stores';
import axios from 'axios';
import { OPENAIPKEY } from '$env/static/private';

export async function checkSystemHealth() {
	try {
		const response = await axios.get(`https://api.core.openaip.net/api/system/health`);
        OpenAIPHealthStore.set(response.data.system);
	} catch (error: unknown) {
		console.error('Error: ', error);
	}
}

export async function getAllUKAirports(): Promise<unknown> {
    try {
        const response = await axios.get(`https://api.core.openaip.net/api/airports`, {
            headers: {
                'Content-Type': 'application/json',
                'x-openaip-client-id': OPENAIPKEY
            },
            params: {
                country: 'GB'
            }
        });

        console.log('Fetched all airports from OpenAIP');

        return response.data.items;
    } catch (error: unknown) {
        console.error('Error: ', error);
    }
}

export async function getAirspacesNearCoords(coords: { lat: number, long: number}, radius: number): Promise<unknown> {
    try {
        const response = await axios.get(`https://api.core.openaip.net/api/airspaces`, {
            headers: {
                'Content-Type': 'application/json',
                'x-openaip-client-id': OPENAIPKEY
            },
            params: {
                dist: radius,
                pos: coords.lat + ',' + coords.long,
            }
        });

        console.log('Fetched all airspaces near point from OpenAIP');

        return response.data.items;
    } catch (error: unknown) {
        console.error('Error: ', error);
    }
}

