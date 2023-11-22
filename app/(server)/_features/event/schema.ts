import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  text,
  integer,
  primaryKey,
  serial,
  jsonb,
} from 'drizzle-orm/pg-core';

// Event Table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  startTime: timestamp('start_time').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  description: text('description'),
  createdBy: integer('created_by').notNull(),
  roomId: text('room_id').notNull(),
  host: text('host').notNull(),
});

export const eventsRelation = relations(events, ({ many }) => ({
  eventsToParticipant: many(eventHasParticipant),
}));

// Participant Table
export const participant = pgTable('events_participant', {
  id: serial('id').primaryKey(),
  clientId: text('client_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  descrtiption: text('description'),
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
      .references(() => events.id),
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

export const insertEvent = events.$inferInsert;
export const selectEvent = events.$inferSelect;

export const insertParticipant = participant.$inferInsert;
export const selectParticipant = participant.$inferSelect;

export const insertEventsToParticipant = eventHasParticipant.$inferInsert;
export const selectEventsToParticipant = eventHasParticipant.$inferSelect;
