import jsonb from '@/(server)/_shared/database/custom-type';
import { text, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../user/schema';

export const rooms = pgTable('rooms', {
  id: text('id').notNull().primaryKey(), //this refer to inlive room room-id, room.inlive.app/<id> and also the hubID
  name: text('name'),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  meta: jsonb('meta'),
});

export type selectRoom = typeof rooms.$inferSelect;
export type insertRoom = typeof rooms.$inferInsert;
