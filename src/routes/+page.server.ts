import { db } from '$lib/server/db';
import { desc, eq, gt, isNull, or } from 'drizzle-orm';
import { file } from '$lib/server/db/schema';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { nanoid } from 'nanoid';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export const load: PageServerLoad = async () => {
	const files = await db
		.select()
		.from(file)
		.where(or(isNull(file.expiresAt), gt(file.expiresAt, new Date())))
		.orderBy(desc(file.createdAt));
	return { files };
};

export const actions = {
	upload: async ({ request }) => {
		const data = await request.formData();
		const uploadedFile = data.get('file') as File;
		const expiresIn = data.get('expiresIn') as string;

		if (!uploadedFile || uploadedFile.size === 0) {
			return fail(400, { missing: true });
		}

		const id = nanoid();
		const storagePath = path.join('uploads', id);

		let expiresAt: Date | null = null;
		if (expiresIn && expiresIn !== 'never') {
			const now = new Date();
			switch (expiresIn) {
				case '1h':
					expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
					break;
				case '1d':
					expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
					break;
				case '1w':
					expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
					break;
				case '4w':
					expiresAt = new Date(now.getTime() + 4 * 7 * 24 * 60 * 60 * 1000);
					break;
			}
		}

		// Write file to disk
		try {
			const buffer = Buffer.from(await uploadedFile.arrayBuffer());
			await writeFile(storagePath, buffer);
		} catch (err) {
			console.error('File write error:', err);
			return fail(500, { error: 'Failed to write file' });
		}

		// Save to DB
		try {
			await db.insert(file).values({
				id,
				originalName: uploadedFile.name,
				storagePath,
				mimeType: uploadedFile.type,
				size: uploadedFile.size,
				expiresAt
			});
		} catch (err) {
			console.error('DB error:', err);
			return fail(500, { error: 'Failed to save metadata' });
		}

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Missing ID' });
		}

		try {
			// Get file path first
			const [fileRecord] = await db.select().from(file).where(eq(file.id, id));

			if (!fileRecord) {
				return fail(404, { error: 'File not found' });
			}

			// Delete from disk
			try {
				await unlink(fileRecord.storagePath);
			} catch (err: any) {
				// Ignore if file doesn't exist on disk, but log it
				if (err.code !== 'ENOENT') {
					console.error('Failed to delete file from disk:', err);
				}
			}

			// Delete from DB
			await db.delete(file).where(eq(file.id, id));

			return { success: true };
		} catch (err) {
			console.error('Delete error:', err);
			return fail(500, { error: 'Failed to delete file' });
		}
	}
} satisfies Actions;
