
import { getAirspacesNearCoords } from '$lib/ts/OpenAIPHandler';
import { json } from '@sveltejs/kit';

export async function GET({ url, setHeaders }) {
	const lat: string | null = url.searchParams.get('lat');
	const long: string | null = url.searchParams.get('long');
	const radius: string | null = url.searchParams.get('radius');

	if (lat == null) {
		return json({ error: 'No lat provided' });
	}

	if (long == null) {
		return json({ error: 'No long provided' });
	}

	if (radius == null) {
		return json({ error: 'No radius provided' });
	}

	const radiusNumber = parseFloat(radius);
	if (isNaN(radiusNumber)) {
		return json({ error: 'Invalid radius provided' });
	}

	const coordsStruct = {
		lat: parseFloat(lat),
		long: parseFloat(long)
	};

	setHeaders({
		'cache-control': 'public, max-age=600'
	});

	return json(await getAirspacesNearCoords(coordsStruct, radiusNumber));
}
