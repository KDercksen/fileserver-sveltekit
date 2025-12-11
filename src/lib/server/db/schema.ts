import { pgTable, text, timestamp, bigint } from 'drizzle-orm/pg-core';

export const file = pgTable('file', {
	id: text('id').primaryKey(),
	originalName: text('original_name').notNull(),
	storagePath: text('storage_path').notNull(),
	mimeType: text('mime_type').notNull(),
	size: bigint('size', { mode: 'number' }).notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type File = typeof file.$inferSelect;
