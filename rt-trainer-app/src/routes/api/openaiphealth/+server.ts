import { checkSystemHealth } from '$lib/ts/OpenAIPHandler';
import { json } from '@sveltejs/kit';

export async function GET() {
	return json(await checkSystemHealth());
}
