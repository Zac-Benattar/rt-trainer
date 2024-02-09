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
        console.log('Airports: ', response.data);
        return response.data;
    } catch (error: unknown) {
        console.error('Error: ', error);
    }
}
