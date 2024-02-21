import { relations } from 'drizzle-orm';
import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from '../user/schema';

export const eventLogs = pgTable('event_logs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  meta: jsonb('meta').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: integer('created_by').notNull(),
});

export const usersRelation = relations(users, ({ many }) => ({
  eventLogs: many(eventLogs),
}));

export const postsRelations = relations(eventLogs, ({ one }) => ({
  createdBy: one(users, {
    fields: [eventLogs.createdBy],
    references: [users.id],
  }),
}));
