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

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  startTime: timestamp('start_time').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  description: text('description'),
  createdBy: integer('created_by').notNull(),
  roomId: text('room_id').notNull(),
});

export const eventsRelation = relations(events, ({ many }) => ({
  eventsToParticipant: many(eventsToParticipant),
}));

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
  eventsToParticipant: many(eventsToParticipant),
}));

export const eventsToParticipant = pgTable(
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

export const eventToParticipantRelation = relations(
  eventsToParticipant,
  ({ one }) => ({
    group: one(events, {
      fields: [eventsToParticipant.eventId],
      references: [events.id],
    }),
    user: one(participant, {
      fields: [eventsToParticipant.participantId],
      references: [participant.id],
    }),
  })
);

export const insertEvent = events.$inferInsert;
export const selectEvent = events.$inferSelect;

export const insertParticipant = participant.$inferInsert;
export const selectParticipant = participant.$inferSelect;

export const insertEventsToParticipant = eventsToParticipant.$inferInsert;
export const selectEventsToParticipant = eventsToParticipant.$inferSelect;
