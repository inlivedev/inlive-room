import {
  serial,
  text,
  integer,
  pgTable,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import {
  type InferInsertModel,
  type InferSelectModel,
  sql,
  relations,
} from 'drizzle-orm';
import { events, participants } from '../event/schema';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  pictureUrl: text('picture_url'),
  whitelistFeature: text('whitelist_feature')
    .array()
    .notNull()
    .default(sql`array[]::text[]`),
  accountId: integer('account_id').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isRegistered: boolean('is_registered').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  participants: many(participants),
}));

export type User = InferSelectModel<typeof users>;
export type selectUser = typeof users.$inferSelect;
export type InsertUser = Omit<
  InferInsertModel<typeof users>,
  'id' | 'createdAt'
>;
