import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  text,
  uuid,
  integer,
  primaryKey,
  serial,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { rooms } from '../room/schema';
import { users } from '../user/schema';

export const statusEnum = pgEnum('event_status_enum', [
  'draft',
  'published',
  'cancelled',
]);

// Event Table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  description: text('description'),
  createdBy: integer('created_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  roomId: text('room_id').references(() => rooms.id, { onDelete: 'set null' }),
  thumbnailUrl: text('thumbnail_url'),
  deletedAt: timestamp('deleted_at'),
  status: statusEnum('status').notNull().default('draft'),
  update_count: integer('update_count').notNull().default(0),
});

export const eventsRelation = relations(events, ({ many, one }) => ({
  eventsToParticipant: many(eventHasParticipant),
  room: one(rooms, {
    fields: [events.roomId],
    references: [rooms.id],
  }),
  host: one(users, {
    fields: [events.createdBy],
    references: [users.id],
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
export type insertParticipant = typeof participant.$inferInsert;
export type selectParticipant = typeof participant.$inferSelect;

export type eventStatusEnum = 'draft' | 'published' | 'cancelled';

export const insertParticipant = participant.$inferInsert;
export const selectParticipant = participant.$inferSelect;

export const insertEventsToParticipant = eventHasParticipant.$inferInsert;
export const selectEventsToParticipant = eventHasParticipant.$inferSelect;
