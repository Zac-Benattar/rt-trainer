import { GetNextATCResponse } from './HandshakeGenerator';

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

	const atcRes = GetNextATCResponse(
		{
			radarName: 'Birmingham Radar'.toLowerCase(),
			callsign: 'G-OSKY'.toLowerCase(),
			message: ''
		},
		{
			radarName: userRadarName.toLowerCase(),
			callsign: userCallsign.toLowerCase(),
			message: userMessage.toLowerCase()
		},
		seed
	);

	return new Response(
		JSON.stringify({
			atcResponse: atcRes
		}),
		{ status: 200 }
	);
};
