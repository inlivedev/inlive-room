import { serial, text, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel, sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  pictureUrl: text('picture_url'),
  whitelistFeature: text('whitelist_feature')
    .array()
    .notNull()
    .default(sql`array[]::text[]`),
  accountId: integer('account_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = InferSelectModel<typeof users>;
export type InsertUser = Omit<
  InferInsertModel<typeof users>,
  'id' | 'createdAt'
>;
