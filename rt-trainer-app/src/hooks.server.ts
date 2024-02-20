export { handle } from './auth';

// import { SvelteKitAuth } from '@auth/sveltekit';
// import Google from '@auth/core/providers/google';
// import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';


// // async function authorization({ event, resolve }) {
// // 	// Protect any routes under /authenticated
// // 	if (event.url.pathname.startsWith('/authenticated')) {
// // 		const session = await event.locals.getSession();
// // 		if (!session) {
// // 			throw redirect(303, '/auth');
// // 		}
// // 	}

// // 	// If the request is still here, just proceed as normally
// // 	return resolve(event);
// // }

// // async function authentication({ event, resolve }) {
// // 	// Do some authentication here
// // 	return resolve(event);
// // }

// // // First handle authentication, then authorization
// // // Each function acts as a middleware, receiving the request handle
// // // And returning a handle which gets passed to the next function
// // export const handle: Handle = sequence(
// // 	authentication,
// // 	authorization
// // );

// export const { handle, signIn, signOut } = SvelteKitAuth({
// 	providers: [Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET })]
// });
