import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  text,
  integer,
  primaryKey,
  serial,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';
import { rooms } from '../room/schema';

// Event Table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  description: text('description'),
  createdBy: integer('created_by').notNull(),
  roomId: text('room_id').references(() => rooms.id, { onDelete: 'set null' }),
  host: text('host').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  thumbnailUrl: text('thumbnail_url'),
  deletedAt: timestamp('deleted_at'),
  isCanceled: boolean('is_canceled').notNull().default(false),
});

export const eventsRelation = relations(events, ({ many, one }) => ({
  eventsToParticipant: many(eventHasParticipant),
  room: one(rooms, {
    fields: [events.roomId],
    references: [rooms.id],
  }),
}));

// Participant Table
export const participant = pgTable('events_participant', {
  id: serial('id').primaryKey(),
  clientId: text('client_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  description: text('description'),
  data: jsonb('data'),
});

export const participantRelation = relations(participant, ({ many }) => ({
  eventsToParticipant: many(eventHasParticipant),
}));

// Junction Table
export const eventHasParticipant = pgTable(
  'events_to_participant',
  {
    eventId: integer('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    participantId: integer('participant_id')
      .notNull()
      .references(() => participant.id),
  },
  (table) => ({
    pk: primaryKey(table.eventId, table.participantId),
  })
);

export const eventHasParticipantRelation = relations(
  eventHasParticipant,
  ({ one }) => ({
    events: one(events, {
      fields: [eventHasParticipant.eventId],
      references: [events.id],
    }),
    participant: one(participant, {
      fields: [eventHasParticipant.participantId],
      references: [participant.id],
    }),
  })
);

export type insertEvent = typeof events.$inferInsert;
export type selectEvent = typeof events.$inferSelect;

export const insertParticipant = participant.$inferInsert;
export const selectParticipant = participant.$inferSelect;

export const insertEventsToParticipant = eventHasParticipant.$inferInsert;
export const selectEventsToParticipant = eventHasParticipant.$inferSelect;
