import { pgTable, text, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { rooms } from '../room/schema';

export const participants = pgTable(
  'participants',
  {
    clientID: text('id').notNull(),
    name: text('name').notNull(),
    roomID: text('room_id').references(() => rooms.id),
  },
  (table) => {
    return {
      pk: primaryKey(table.clientID, table.roomID),
    };
  }
);

export const participantsRelations = relations(participants, ({ one }) => ({
  room: one(rooms, {
    fields: [participants.roomID],
    references: [rooms.id],
  }),
}));
