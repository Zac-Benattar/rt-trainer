import { OpenAIPHealthStore } from '$lib/stores';
import axios from 'axios';

export async function checkSystemHealth() {
	try {
		const response = await axios.get(`https://api.core.openaip.net/api/system/health`);
        OpenAIPHealthStore.set(response.data.system);
	} catch (error: unknown) {
		console.error('Error: ', error);
	}
}
