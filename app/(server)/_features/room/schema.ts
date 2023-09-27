import { text, integer, pgTable } from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
  id: text('id').notNull().primaryKey(), //this refer to inlive room room-id, room.inlive.app/<id>
  name: text('name'),
  roomId: text('room_id').notNull(), //this describe the inlive-hub roomID
  createdBy: integer('user_id').notNull(),
});
