import { convertToNATO } from '../lib/PhoneticAlphabetConverter';

export const GET = async ({ request, url }) => {
	const authHeader = request.headers.get('Authorization');

	// Check validity of authHeader
	if (authHeader !== 'MyAuthHeader') {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}

	const seed = Number(url.searchParams.get('seed') ?? 0);
	const userRadarName = String(url.searchParams.get('radarName')?.toLowerCase() ?? 'Unknown Radar');
	const userCallsign = String(url.searchParams.get('callsign')?.toLowerCase() ?? 'G-OSKY');
	const userMessage = String(url.searchParams.get('message')?.toLowerCase() ?? 'Empty message');

	let radarName: string = 'birmingham radar';
	if (userRadarName != radarName) {
		return new Response(
			JSON.stringify({
				atcRes: {
					radarName: userRadarName,
					callsign: convertToNATO(userCallsign),
					atcMessage: 'Empty message'
				}
			}),
			{ status: 200 }
		);
	}

	let callsign: string = 'G-OFLY';
	let atcMessage: string = '';
	if (userMessage === '') {
		atcMessage = 'Say again';
	} else if (userMessage === 'say again') {
		// Repeat the previous message
	} else if (userMessage === 'request zone transit') {
		if (seed % 5 === 0) {
			atcMessage = 'Transit denied';
		} else {
			atcMessage = 'Transit approved';
		}
	}

	// const res = await fetch('https://dummyjson.com/posts')
	// const data = await res.json();

	return new Response(
		JSON.stringify({
			atcRes: {
				radarName: radarName,
				callsign: convertToNATO(callsign),
				atcMessage: atcMessage
			}
		}),
		{ status: 200 }
	);
};
