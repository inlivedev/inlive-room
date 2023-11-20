import { db } from '@/(server)/_shared/database/database';
import { iEventRepo } from './service';
import { events, insertEvent } from './schema';
import { DBQueryConfig, and, eq } from 'drizzle-orm';

export class EventRepo implements iEventRepo {
  async addEvent(event: typeof insertEvent) {
    const data = await db.insert(events).values(event).returning();

    return data[0];
  }

  async getEvent(slug: string) {
    const data = await db.query.events.findFirst({
      where: eq(events.slug, slug),
    });

    return data;
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
}

export class EventParticipant {}
