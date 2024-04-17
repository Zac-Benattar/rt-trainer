import type { PageServerLoad } from './$types';
import { instanceToPlain } from 'class-transformer';
export const load: PageServerLoad = async (event) => {
	const scenarioId = event.params.id;

	let prefix: string | null = null;
	let callsign: string | null = null;
	let aircraftType: string | null = null;

	let userId: string = '-1';

	return {
		scenario: instanceToPlain(scenario),
		aircraftDetails: {
			prefix: prefix,
			callsign: callsign,
			aircraftType: aircraftType
		}
	};
};
