import { fail, redirect, type Actions } from '@sveltejs/kit';
import { createSession } from '$lib/server/auth';
import { env } from '$env/dynamic/private';

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password') as string;

		if (!password) {
			return fail(400, { error: 'Missing password' });
		}

		const adminPassword = env.ADMIN_PASSWORD;

		if (!adminPassword) {
			console.error('ADMIN_PASSWORD env var not set');
			return fail(500, { error: 'Server misconfiguration' });
		}

		if (password !== adminPassword) {
			return fail(400, { error: 'Invalid password' });
		}

		const session = await createSession();

		cookies.set('session_id', session.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false, // set to true in production if using https
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		throw redirect(302, '/');
	}
} satisfies Actions;
