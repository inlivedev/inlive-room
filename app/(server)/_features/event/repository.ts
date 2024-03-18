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
import { DBQueryConfig, SQL, and, count, eq, isNull, sql } from 'drizzle-orm';
import { PageMeta } from '@/_shared/types/types';
import { User, users } from '../user/schema';

export class EventRepo implements iEventRepo {
  async addEvent(event: insertEvent) {
    const data = await db.insert(events).values(event).returning();

    return data[0];
  }

  async getEventBySlug(slug: string) {
    const data = await db.query.events.findFirst({
      with: {
        host: {
          columns: {
            id: true,
            name: true,
            pictureUrl: true,
          },
        },
      },
      where: and(eq(events.slug, slug), isNull(events.deletedAt)),
    });

    return data;
  }

  async getEventById(id: number) {
    const data = await db.query.events.findFirst({
      with: {
        host: {
          columns: {
            id: true,
            name: true,
            pictureUrl: true,
          },
        },
      },
      where: and(eq(events.id, id), isNull(events.deletedAt)),
    });

    return data;
  }

  /**
   * Retrive published events that not yet started and drafted and cancelled events by the user.
   */
  async getMyEvents(userID: number, page: number, limit: number) {
    page = page - 1;

    if (page < 0) {
      page = 0;
    }

    if (limit <= 0) {
      limit = 10;
    }

    const filter = sql`
    ${events.createdBy} = ${userID} AND
    ${events.deletedAt} IS NULL AND
    ((${events.status} = ${'published'} AND ${events.endTime} >= NOW()) 
    OR ${events.status} = ${'cancelled'} 
    OR ${events.status} = ${'draft'})`;

    const res = await db.query.events.findMany({
      where: filter,
      limit: limit,
      offset: page * limit,
    });

    const resCount = await db
      .select({ total: count() })
      .from(events)
      .where(filter);

    const pageMeta: PageMeta = {
      current_page: page + 1,
      total_page: Math.ceil(resCount[0].total / limit) || 1,
      per_page: limit,
      total_record: resCount[0].total,
    };

    return { data: res, meta: pageMeta };
  }
  async getEvents(
    page: number,
    limit: number,
    userId?: number,
    status?: string[],
    isStartAfter?: Date,
    isStartBefore?: Date,
    isEndAfter?: Date,
    isEndBefore?: Date
  ) {
    page = page - 1;

    if (page < 0) {
      page = 0;
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
      columns: { roomId: false },
    };

    const whereQuery: SQL[] = [];

    whereQuery.push(sql`${events.deletedAt} IS NULL`);

    if (userId) {
      whereQuery.push(sql`${events.createdBy} = ${userId}`);
    }

    if (isStartAfter && isStartBefore) {
      whereQuery.push(
        sql`${
          events.startTime
        } BETWEEN ${isStartAfter.toISOString()} AND ${isStartBefore.toISOString()}`
      );
    } else if (isStartAfter) {
      whereQuery.push(
        sql`${events.startTime} >= ${isStartAfter.toISOString()}`
      );
    } else if (isStartBefore) {
      whereQuery.push(
        sql`${events.startTime} <= ${isStartBefore.toISOString()}`
      );
    }

    if (isEndAfter && isEndBefore) {
      whereQuery.push(
        sql`${
          events.endTime
        } BETWEEN ${isEndAfter.toISOString()} AND ${isEndBefore.toISOString()}`
      );
    } else if (isEndAfter) {
      whereQuery.push(sql`${events.endTime} >= ${isEndAfter.toISOString()}`);
    } else if (isEndBefore) {
      whereQuery.push(sql`${events.endTime} <= ${isEndBefore.toISOString()}`);
    }

    const statusQuery: SQL[] = [];
    if (status && status.length > 0) {
      status.forEach((s) => {
        statusQuery.push(sql`${events.status} = ${s}`);
      });
    }

    const statusFilter = statusQuery.length
      ? sql.join(statusQuery, sql` OR `)
      : null;
    const whereFilter = sql.join(whereQuery, sql` AND `);

    const finalFilter = statusFilter
      ? sql`${whereFilter} AND (${statusFilter})`
      : whereFilter;

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx.query.events.findMany({
        ...filter,
        where: finalFilter,
      });

      const totalRows = await db
        .select({
          total: count(),
        })
        .from(events)
        .where(finalFilter);

      return { data, total: totalRows[0].total };
    });

    const meta: PageMeta = {
      current_page: page + 1,
      total_page: Math.ceil(total / limit) || 1,
      per_page: limit,
      total_record: total,
    };

    return {
      data,
      pageMeta: meta,
    };
  }

  async deleteEvent(id: number, userId: number) {
    return await db
      .update(events)
      .set({ deletedAt: new Date() })
      .where(and(eq(events.id, id), eq(events.id, userId)))
      .returning();
  }

  async deleteEventBySlug(slug: string, userId: number) {
    return await db
      .update(events)
      .set({ deletedAt: new Date() })
      .where(and(eq(events.slug, slug), eq(events.createdBy, userId)))
      .returning();
  }

  async updateEvent(
    userId: number,
    id: number,
    event: insertEvent
  ): Promise<selectEvent | undefined> {
    event.update_count = event.update_count ? event.update_count : 1 + 1;

    const data = await db.transaction(async (tx) => {
      if (!event.thumbnailUrl) {
        await tx
          .update(events)
          .set({ thumbnailUrl: null })
          .where(eq(events.id, id));
      }
      return await tx
        .update(events)
        .set(event)
        .where(and(eq(events.id, id), eq(events.createdBy, userId)))
        .returning();
    });

    if (!data || data.length == 0) {
      return undefined;
    }

    return data[0];
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

  async countRegistiree(eventID: number) {
    const res = await db
      .select({
        value: count(),
      })
      .from(eventHasParticipant)
      .where(eq(eventHasParticipant.eventId, eventID));

    return res[0];
  }

  /**
   * This function counts all published events for a given user, including those that have been canceled.
   *
   * @param userID The ID of the user for whom to count the events.
   * @returns A promise that resolves to the count of all published events for the given user.
   */
  async countNonDraftEvents(userID: number) {
    const res = await db
      .select({
        value: count(),
      })
      .from(events)
      .where(
        sql`${events.status} !='draft' AND ${events.createdBy} = ${userID}`
      );

    return res[0];
  }

  async getRegisteredParticipants(
    slug: string,
    createdBy: User['id'],
    limit = 10,
    page = 1
  ) {
    const res = await db.transaction(async (tx) => {
      const registeree = await tx
        .select({
          first_name: participants.firstName,
          last_name: participants.lastName,
          email: participants.email,
          id: participants.id,
          created_at: participants.createdAt,
        })
        .from(eventHasParticipant)
        .innerJoin(events, eq(eventHasParticipant.eventId, events.id))
        .innerJoin(
          participants,
          eq(eventHasParticipant.participantId, participants.id)
        )
        .where(and(eq(events.slug, slug), eq(events.createdBy, createdBy)));

      const total = await tx
        .select({ total: count() })
        .from(eventHasParticipant)
        .innerJoin(events, eq(eventHasParticipant.eventId, events.id))
        .innerJoin(
          participants,
          eq(eventHasParticipant.participantId, participants.id)
        )
        .where(and(eq(events.slug, slug), eq(events.createdBy, createdBy)));
      total[0].total = total[0].total || 0;

      return { total: total[0].total, registeree };
    });

    const meta: PageMeta = {
      current_page: page,
      total_page: Math.ceil(res.total / limit) || 1,
      per_page: limit,
      total_record: res.total,
    };
    return { data: res.registeree, meta };
  }

  async getEventParticipantsByEventId(eventId: number) {
    return await db.query.eventHasParticipant.findMany({
      columns: {
        participantId: false,
        eventId: false,
      },
      with: {
        participant: true,
      },
      where: (eventHasParticipant, { eq }) =>
        eq(eventHasParticipant.eventId, eventId),
    });
  }

  async getParticipantById(id: number) {
    return await db.query.participant.findFirst({
      where: eq(participants.id, id),
    });
  }

  async getEventHostByEventId(eventId: number) {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (typeof event !== 'undefined' && event.createdBy !== null) {
      return await db.query.users.findFirst({
        where: eq(users.id, event.createdBy),
      });
    }

    return undefined;
  }
}
