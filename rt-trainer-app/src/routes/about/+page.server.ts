import axios from 'axios';
import type { PageServerLoad } from './$types';
import { GITHUB_FG_ACCESS_TOKEN } from '$env/static/private';

export const load: PageServerLoad = async () => {
	let commitMessage = '';
	let commitDate = '';

	try {
		const response = await axios.get(
			`https://api.github.com/repos/Zac-Benattar/rt-trainer/commits`,
			{
				headers: {
					'Authorization': `token ${GITHUB_FG_ACCESS_TOKEN}`,
					'Content-Type': 'application/json',
				},
				params: {
					sha: 'main',
					per_page: 1
				}
			}
		);

		commitMessage = response.data[0].commit.message;
		commitDate = response.data[0].commit.author.date;
	} catch (e) {
		console.log(e);
	}

	return {
		commitMessage: commitMessage,
		commitDate: commitDate,
	};
};
