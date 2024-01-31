import jsonb from '@/(server)/_shared/database/custom-type';
import { text, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
  id: text('id').notNull().primaryKey(), //this refer to inlive room room-id, room.inlive.app/<id> and also the hubID
  name: text('name'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  meta: jsonb('meta'),
});

export const selectRoom = rooms.$inferSelect;
export const insertRoom = rooms.$inferInsert;
