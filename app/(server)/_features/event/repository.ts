import { db } from '@/(server)/_shared/database/database';
import { iEventRepo } from './service';
import {
  events,
  eventHasParticipant,
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

  async getEventBySlug(slug: string): Promise<typeof selectEvent | undefined> {
    const data = await db.query.events.findFirst({
      where: eq(events.slug, slug),
    });

    if (data) return data as typeof selectEvent;
    else return undefined;
  }

  async getEventById(id: number): Promise<typeof selectEvent | undefined> {
    const data = await db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (data) return data as typeof selectEvent;
    else return undefined;
  }

  async getEvents(page: number, limit: number, userId?: number) {
    if (page < 0) {
      page = 0;
    }

    if (limit <= 0) {
      limit = 10;
    }

    const filter: DBQueryConfig = {
      limit: limit,
      offset: page,
      orderBy(fields, operators) {
        return [operators.desc(fields.createdAt)];
      },
      columns: { roomId: false },
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

  async updateEvent(
    userId: number,
    id: number,
    event: typeof insertEvent
  ): Promise<typeof selectEvent | undefined> {
    const data = await db.transaction(async (tx) => {
      if (!event.thumbnailUrl) {
        await tx
          .update(events)
          .set({ thumbnailUrl: null })
          .where(eq(events.id, id));
        return await tx
          .update(events)
          .set(event)
          .where(and(eq(events.id, id), eq(events.createdBy, userId)))
          .returning();
      }
    });

    if (!data || data.length == 0) {
      return undefined;
    }

    return data[0];
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
    const res = await db.transaction(async (tx) => {
      const insertedParticipant = await tx
        .insert(participants)
        .values(participant)
        .returning();

      await tx
        .insert(eventHasParticipant)
        .values({
          eventId: eventId,
          participantId: insertedParticipant[0].id,
        })
        .returning();

      const event = await db.query.events.findFirst({
        where: eq(events.id, eventId),
        columns: { roomId: false },
      });

      return { participant: insertedParticipant[0], event: event };
    });

    return res;
  }
}
