/* eslint-disable prettier/prettier */
import { DB, db } from '@/(server)/_shared/database/database';
import {
  eventCategory,
  events,
  insertEvent,
  insertParticipant,
  participantRole,
  participants,
  selectEvent,
  selectParticipant,
} from './schema';
import { DBQueryConfig, SQL, and, count, eq, ilike, inArray, isNull, sql } from 'drizzle-orm';
import { PageMeta } from '@/_shared/types/types';
import { User, users } from '../user/schema';


export class EventRepo {
  async addEvent(event: insertEvent) {
    const data = await db.insert(events).values(event).returning()
    return data[0];
  }

  async getBySlugOrID(slugOrID: string, category?: string, _db: DB = db): Promise<selectEvent | undefined>{
    const event = await _db.transaction(async (tx) => {
      const isnum = /^\d+$/.test(slugOrID);
      
      const categoryID = category ? await tx.query.eventCategory.findFirst({
        where: ilike(eventCategory.name, category)
      }) : undefined;

      const data = await db.query.events.findFirst({
        where: and(
          isnum? eq(events.id, parseInt(slugOrID)) : eq(events.slug, slugOrID),
          isNull(events.deletedAt),
          categoryID ? eq(events.categoryID, categoryID.id) : undefined
        ),

      });

      if (!data) {
        return undefined;
      }

      return {
        ...data,
      };
    })

    return event;
  }


  async getEvents(
    page: number,
    limit: number,
    userId?: number,
    status?: string[],
    isStartAfter?: Date,
    isStartBefore?: Date,
    isEndAfter?: Date,
    isEndBefore?: Date,
    category?: string[]
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

    };

    const whereQuery: SQL[] = [];

    whereQuery.push(sql`${events.deletedAt} IS NULL`);

    if (userId) {
      whereQuery.push(sql`${events.createdBy} = ${userId}`);
    }

    if (isStartAfter && isStartBefore) {
      whereQuery.push(
        sql`${events.startTime
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
        sql`${events.endTime
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
      const categoryList = await tx.query.eventCategory.findMany({
        where: (category && category.length > 0) ? inArray(eventCategory.name, category) : undefined
      })

      const data = await tx.query.events.findMany({
        ...filter,
        where: and(
          finalFilter,
          categoryList.length == 0 ? undefined : inArray(events.categoryID, categoryList.map((c) => c.id))),
        with: {
          category: true
        }
      });

      const totalRows = await db
        .select({
          total: count(),
        })
        .from(events)
        .where(
          and(
            finalFilter,
            categoryList.length == 0 ? undefined : inArray(events.categoryID, categoryList.map((c) => c.id))
          ));

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

  async getOngoingEvents(
    type: string[]
  ) {
    const now = new Date();

    const res = db.transaction(async (tx) => {
      const category = await tx.query.eventCategory.findMany({
        where: inArray(eventCategory.name, type)
      })

      const query = await tx.query.events.findMany({
        where: and(
          sql`${events.endTime} > ${now.toISOString()}`,
          sql`${events.startTime} < ${now.toISOString()}`,
          category ? inArray(events.categoryID, category.map((c) => c.id)) : undefined
        )
      })

      return query;

    })

    return res

  }

  async getCategoryByName(name: string) {
    return await db.query.eventCategory.findFirst({
      where: ilike(eventCategory.name, name),
    });
  }

  async getShouldBeEndedEvents(
    userID: number,
    type: string[],
    page = 1,
    limit = 10,
  ) {
    const now = new Date();
    const query = await db.transaction(async (tx) => {
      const category = await tx.query.eventCategory.findMany({
        where: inArray(eventCategory.name, type)
      })

      const res = await tx.query.events.findMany({
        where: and(
          sql`${events.endTime} < ${now.toISOString()}`,
          eq(events.status, 'published'),
          eq(events.createdBy, userID),
          category ? inArray(events.categoryID, category.map((c) => c.id)) : undefined
        ),
        limit: limit,
        offset: (page - 1) * limit
      })

      const val = await tx.select({ val: count() }).from(events).where(
        and(
          sql`${events.endTime} < ${now.toISOString()}`,
          eq(events.status, 'published'),
          eq(events.createdBy, userID),
          category ? inArray(events.categoryID, category.map((c) => c.id)) : undefined
        )
      )

      return {
        data: res, meta: {
          current_page: page,
          total_page: Math.ceil(val[0].val / limit) || 1,
          per_page: limit,
          total_record: val[0].val
        }
      }
    })

    return query;
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
    const data = await db.transaction(async (tx) => {
      if (!event.thumbnailUrl) {
        await tx
          .update(events)
          .set({ thumbnailUrl: null })
          .where(eq(events.id, id));
      }

      const res = await tx
        .update(events)
        .set(event)
        .where(and(eq(events.id, id), eq(events.createdBy, userId)))
        .returning();

      if (res[0].status == 'published') {
        await tx
          .update(participants)
          .set({ updateCount: sql`${participants.updateCount} + 1` })
          .where(eq(participants.eventID, id))
          .returning();
      }

      return res

    });

    if (!data || data.length == 0) {
      return undefined;
    }

    return data[0];
  }

  async insertParticipant(userID : number, eventID: number, options:  Omit<insertParticipant,'userID' | 'eventID'>, _db: DB = db) : Promise<selectParticipant>{
      const [participant] = await _db.insert(participants).values({userID,eventID,...options}).returning()
      return participant
    }

  async countRegistiree(eventID: number, _db: DB = db) {
    const res = await _db
      .select({
        value: count(),
      })
      .from(participants)
      .where(eq(participants.eventID, eventID));

    return res[0].value;
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
          name:users.name,
          email: users.email,
          id: users.id,
          created_at: participants.createdAt,
        })
        .from(participants)
        .innerJoin(events, eq(participants.eventID, events.id))
        .where(
          and(
            eq(events.slug, slug),
            eq(events.createdBy, createdBy),
            eq(participants.roleID, 1))
        ).innerJoin(users, eq(participants.userID, users.id))

      const total = await tx
        .select({ total: count() })
        .from(participants)
        .innerJoin(events, eq(participants.eventID, events.id))
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

    const data = res.registeree.map((user) => {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      };
    });

    return { data: data, meta };
  }


  async getParticipantByClientId(clientID: string) {
    const res=  await db.query.participants.findFirst({
      where: eq(participants.clientID, clientID),
      with:{
        user:{
          columns:{
            name:true,
            email:true,
            pictureUrl:true,
            id:true
          }
        }
      }
    });

    return res ? {
      id: res.user?.id,
      email: res.user?.email,
      name: res.user?.name,
      pictureUrl: res.user?.pictureUrl,
      roleID: res.roleID,
      eventID: res.eventID,
      isInvited: res.isInvited,
      updateCount: res.updateCount,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
      clientID: res.clientID,
    } : undefined;
  }

  async getParticipant(userID: number, eventID: number, _db :DB = db) {
    const res = await _db.query.participants.findFirst({
      where: and(eq(participants.userID, userID), eq(participants.eventID, eventID)),
    });

    return res;

  }

  async getEventHostByEventId(eventId: number, _db: DB = db) {
    const event = await _db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (typeof event !== 'undefined' && event.createdBy !== null) {
      return await db.query.users.findFirst({
        where: eq(users.id, event.createdBy),
      });
    }

    return undefined;
  }

  async updateParticipantCount(eventId: number) {
    return await db
      .update(participants)
      .set({ updateCount: sql`${participants.updateCount} + 1` })
      .where(eq(participants.eventID, eventId))
      .returning();
  }

  async getByRoomID(id: string): Promise<selectEvent | undefined> {
    const res = await db.query.events.findFirst({
      where: eq(events.roomId, id),
    });

    return res;
  }

  async getRoleByName(name: string, _db: DB= db) {
    return _db.query.participantRole.findFirst({
      where: ilike(participantRole.name, name),
    });
  }

  async getRoleByID(id: number, _db: DB= db) {
    return _db.query.participantRole.findFirst({
      where: eq(participantRole.id, id),
    });
  }

}
