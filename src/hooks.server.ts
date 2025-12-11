import { validateSession } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session_id');

	if (!sessionId) {
		event.locals.session = null;
	} else {
		const session = await validateSession(sessionId);
		if (session) {
			event.locals.session = session;
		} else {
			event.locals.session = null;
		}
	}

	// Protect routes
	const isProtected = event.url.pathname === '/' || event.url.pathname.startsWith('/admin');

	// Exception for login and shared files
	const isPublic =
		event.url.pathname.startsWith('/login') ||
		event.url.pathname.startsWith('/f/') ||
		event.url.pathname === '/robots.txt';

	if (!event.locals.session && !isPublic && isProtected) {
		return new Response(null, {
			status: 303,
			headers: { location: '/login' }
		});
	}

	// Redirect logged in users away from login
	if (event.locals.session && event.url.pathname === '/login') {
		return new Response(null, {
			status: 303,
			headers: { location: '/' }
		});
	}

	return resolve(event);
};
