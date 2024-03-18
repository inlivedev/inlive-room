import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  text,
  integer,
  serial,
  pgEnum,
  char,
} from 'drizzle-orm/pg-core';
import { rooms } from '../room/schema';

export const statusEnum = pgEnum('event_status_enum', [
  'draft',
  'published',
  'cancelled',
]);

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
  thumbnailUrl: text('thumbnail_url'),
  deletedAt: timestamp('deleted_at'),
  status: statusEnum('status').notNull().default('draft'),
});

// Participant Table
export const participant = pgTable('events_participant', {
  id: serial('id').primaryKey(),
  clientId: text('client_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  description: text('description'),
  eventID: integer('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  uniqueURL: char('unique_url', {
    length: 12,
  }).notNull(),
});

export type insertEvent = typeof events.$inferInsert;
export type selectEvent = typeof events.$inferSelect;
export type eventStatusEnum = 'draft' | 'published' | 'cancelled';

export const insertParticipant = participant.$inferInsert;
export const selectParticipant = participant.$inferSelect;
