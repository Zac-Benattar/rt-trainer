import type { PageServerLoad } from './$types';
import { getAllAirportData, getAllAirspaceData } from '$lib/ts/OpenAIPHandler';
import { instanceToPlain } from 'class-transformer';

export const load: PageServerLoad = async () => {
	return {
		airspaces: instanceToPlain(await getAllAirspaceData()),
		airports: instanceToPlain(await getAllAirportData())
	};
};
