import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const packageVersion = process.env.npm_package_version;

	return {
		packageVersion: packageVersion
	};
};
