import { relations } from 'drizzle-orm';
import { text, integer, pgTable } from 'drizzle-orm/pg-core';
import { participants } from '../participants/schema';

export const rooms = pgTable('rooms', {
  id: text('id').notNull().primaryKey(), //this refer to inlive room room-id, room.inlive.app/<id>
  name: text('name'),
  externalID: text('room_id').notNull(), //this describe the inlive-hub roomID
  createdBy: integer('user_id').notNull(),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  participants: many(participants),
}));
