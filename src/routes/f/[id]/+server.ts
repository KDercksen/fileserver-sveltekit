import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { file } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;
	if (!id) error(400, 'Missing file ID');

	const result = await db.select().from(file).where(eq(file.id, id)).limit(1);
	const fileData = result[0];

	if (!fileData) {
		error(404, 'File not found');
	}

	if (fileData.expiresAt && new Date() > fileData.expiresAt) {
		error(410, 'File expired');
	}

	if (!existsSync(fileData.storagePath)) {
		error(410, 'File content missing');
	}

	const content = await readFile(fileData.storagePath);

	return new Response(content, {
		headers: {
			'Content-Type': fileData.mimeType,
			'Content-Disposition': `inline; filename="${fileData.originalName}"`,
			'Content-Length': fileData.size.toString()
		}
	});
};
