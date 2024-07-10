import {
  pgTable,
  timestamp,
  text,
  uuid,
  integer,
  serial,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { rooms } from '../room/schema';
import { users } from '../user/schema';
import { relations } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('event_status_enum', [
  'draft',
  'published',
  'cancelled',
  'completed',
]);

// Event Table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull(),
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
  maximumSlots: integer('available_slots').default(50),
  categoryID: integer('category_id')
    .references(() => eventCategory.id)
    .notNull(),
});

export const participants = pgTable(
  'event_participants',
  {
    eventID: integer('event_id')
      .references(() => events.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    userID: integer('user_id')
      .references(() => users.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    roleID: integer('role_id')
      .references(() => participantRole.id, {
        onDelete: 'set null',
      })
      .default(1)
      .notNull(),
    isInvited: boolean('is_invited').default(false).notNull(),
    updateCount: integer('update_count').default(0).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    clientID: text('client_id').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.eventID, table.userID] }),
    };
  }
);

export const eventCategory = pgTable('event_category', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const participantRelations = relations(participants, ({ one }) => ({
  event: one(events, {
    fields: [participants.eventID],
    references: [events.id],
  }),
  user: one(users, {
    fields: [participants.userID],
    references: [users.id],
  }),
  role: one(participantRole, {
    fields: [participants.roleID],
    references: [participantRole.id],
  }),
}));

export const eventsRelations = relations(events, ({ many, one }) => ({
  participants: many(participants),
  category: one(eventCategory, {
    fields: [events.categoryID],
    references: [eventCategory.id],
  }),
  host: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
}));

export const participantRole = pgTable('participant_role', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const roleRelations = relations(participantRole, ({ one }) => ({
  role: one(participants, {
    fields: [participantRole.id],
    references: [participants.roleID],
  }),
}));

export type insertEvent = typeof events.$inferInsert;
export type selectEvent = typeof events.$inferSelect;
export type insertParticipant = typeof participants.$inferInsert;
export type selectParticipant = typeof participants.$inferSelect;

export type selectRole = typeof participantRole.$inferSelect;
export type selectCategory = typeof eventCategory.$inferSelect;

export type eventStatusEnum = 'draft' | 'published' | 'cancelled' | 'completed';
