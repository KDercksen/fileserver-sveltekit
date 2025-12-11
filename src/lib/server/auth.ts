import { db } from './db';
import { session } from './db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export async function createSession() {
	const sessionId = nanoid();
	const expiresAt = new Date(Date.now() + DAY_IN_MS * 30); // 30 days

	await db.insert(session).values({
		id: sessionId,
		expiresAt
	});

	return { id: sessionId, expiresAt };
}

export async function validateSession(sessionId: string) {
	const [result] = await db.select().from(session).where(eq(session.id, sessionId));

	if (!result) {
		return null;
	}

	if (Date.now() >= result.expiresAt.getTime()) {
		await db.delete(session).where(eq(session.id, sessionId));
		return null;
	}

	return result;
}

export async function invalidateSession(sessionId: string) {
	await db.delete(session).where(eq(session.id, sessionId));
}
