import { db } from '@/(server)/_shared/database/database';
import { iEventRepo } from './service';
import {
  events,
  eventsToParticipant,
  insertEvent,
  insertParticipant,
  participant as participants,
  selectEvent,
} from './schema';
import { DBQueryConfig, and, eq } from 'drizzle-orm';

export class EventRepo implements iEventRepo {
  async addEvent(event: typeof insertEvent) {
    const data = await db.insert(events).values(event).returning();

    return data[0];
  }

  async getEvent(slug: string): Promise<typeof selectEvent> {
    const data = await db.query.events.findFirst({
      where: eq(events.slug, slug),
    });

    return data as typeof selectEvent;
  }

  async getEvents(page: number, limit: number, userId?: number) {
    if (page <= 0) {
      page = 1;
    }

    if (limit <= 0) {
      limit = 10;
    }

    const filter: DBQueryConfig = {
      limit: limit,
      offset: page * limit,
      orderBy(fields, operators) {
        return [operators.desc(fields.createdAt)];
      },
    };

    if (userId) {
      filter.where = eq(events.createdBy, userId);
    }

    const data = await db.query.events.findMany(filter);

    return data;
  }

  async deleteEvent(id: number, userId: number) {
    return await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.id, userId)))
      .returning();
  }

  async deleteEventBySlug(slug: string, userId: number) {
    return await db
      .delete(events)
      .where(and(eq(events.slug, slug), eq(events.createdBy, userId)))
      .returning();
  }

  async updateEvent(userId: number, id: number, event: typeof insertEvent) {
    return await db
      .update(events)
      .set(event)
      .where(and(eq(events.id, id), eq(events.createdBy, userId)))
      .returning();
  }

  async updateEventBySlug(
    userId: number,
    slug: string,
    event: typeof insertEvent
  ) {
    return await db
      .update(events)
      .set(event)
      .where(and(eq(events.slug, slug), eq(events.createdBy, userId)))
      .returning();
  }

  async registerParticipant(
    participant: typeof insertParticipant,
    eventId: number
  ) {
    const insertedParticipant = await db
      .insert(participants)
      .values(participant)
      .returning();

    await db.insert(eventsToParticipant).values({
      eventId: eventId,
      participantId: insertedParticipant[0].id,
    });

    return await db.query.participant.findFirst({
      where: and(
        eq(participants.id, insertedParticipant[0].id),
        eq(eventsToParticipant.eventId, eventId)
      ),
      with: { events: true },
    });
  }
}

export class EventParticipant {}
