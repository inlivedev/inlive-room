import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const invitees = pgTable('invitees', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  whitelistFeature: text('whitelist_feature')
    .array()
    .notNull()
    .default(sql`array[]::text[]`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
