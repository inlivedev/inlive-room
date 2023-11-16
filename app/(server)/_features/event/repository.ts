import { db } from '@/(server)/_shared/database/database';
import { iEventRepo } from './service';
import { events, insertEvent } from './schema';
import { eq } from 'drizzle-orm';

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
}

export class EventParticipant {}
