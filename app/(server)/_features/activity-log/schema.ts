import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../user/schema';
import jsonb from '@/(server)/_shared/database/custom-type';

export const activitiesLog = pgTable('activities_logs', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
  meta: jsonb('meta').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: integer('created_by'),
});

export const usersRelation = relations(users, ({ many }) => ({
  eventLogs: many(activitiesLog),
}));

export const postsRelations = relations(activitiesLog, ({ one }) => ({
  createdBy: one(users, {
    fields: [activitiesLog.createdBy],
    references: [users.id],
  }),
}));

export type InsertActivityLog = typeof activitiesLog.$inferInsert;
export type SelectActivityLog = typeof activitiesLog.$inferSelect;
