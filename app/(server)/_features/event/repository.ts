/* eslint-disable prettier/prettier */
import { db } from '@/(server)/_shared/database/database';
import { Participant, iEventRepo } from './service';
import {
  events,
  insertEvent,
  insertParticipant,
  participant,
  participant as participants,
  selectEvent,
  selectParticipant,
} from './schema';
import { DBQueryConfig, SQL, and, count, eq, isNull, sql } from 'drizzle-orm';
import { PageMeta } from '@/_shared/types/types';
import { User, users } from '../user/schema';
import { activitiesLog } from '../activity-log/schema';
import { z } from 'zod';
import { ArrayRoomDurationMeta, RoomDurationMeta } from '@/(server)/api/user/activity/route';

type participantAttendances = {
  participant: {
    clientID: string;
    joinDuration: number;
    isAttended: boolean;
  }[],
  attendedCount: number;
  totalCount: number;
  eventDuration: number;
}



export class EventRepo implements iEventRepo {
  async addEvent(event: insertEvent) {
    const data = await db.insert(events).values(event).returning()
    return data[0];
  }

  async getEventBySlug(slug: string) {
    const event = await db.transaction(async (tx) => {
      const data = await db.query.events.findFirst({
        with: {
          host: {
            columns: {
              id: true,
              name: true,
              pictureUrl: true,
              email: true,
            },
          },
        },
        where: and(eq(events.slug, slug), isNull(events.deletedAt)),
      });

      if (!data) {
        return undefined;
      }

      const countRegistered = data.maximumSlots ? (await tx.select({
        count: count(),
      }).from(participants).where(eq(participants.eventID, data.id)))[0] : { count: 0 };

      return {
        ...data,
        availableSlots: data.maximumSlots ? data.maximumSlots - countRegistered.count : undefined,
      };
    })

    return event;
  }

  async getEventById(id: number) {
    const event = await db.transaction(async (tx) => {
      const data = await db.query.events.findFirst({
        with: {
          host: {
            columns: {
              id: true,
              name: true,
              pictureUrl: true,
              email: true,
            },
          },
        },
        where: and(eq(events.id, id), isNull(events.deletedAt)),
      });

      if (!data) {
        return undefined;
      }

      const countRegistered = data.maximumSlots ? (await tx.select({
        count: count(),
      }).from(participants).
      where(
        and(
          eq(participants.eventID, data.id),
          eq(participants.roleID, 1)
        )
        ))[0] : { count: 0 };

      return {
        ...data,
        availableSlots: data.maximumSlots ? data.maximumSlots - countRegistered.count : undefined,
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
    category: "webinar" | "meeting" | undefined = undefined
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

    if (category) {
      switch (category) {
        case 'webinar':
          whereQuery.push(sql`${events.categoryID} = ${1}`);
          break;

        case 'meeting':
          whereQuery.push(sql`${events.categoryID} = ${2}`);
          break;
      }
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

  async getOngoingEvents(
    type: "webinar" | "meeting" | undefined,
  ) {
    const now = new Date();
    const query = await db.query.events.findMany({
      where: and(
        sql`${events.endTime} > ${now.toISOString()}`,
        sql`${events.startTime} < ${now.toISOString()}`,

        type ? sql`${events.categoryID} = ${type === 'webinar' ? 1 : 2}` : undefined
      )
    })

    return query;
  }

  async getShouldBeEndedEvents(
    userID: number,
    type: "webinar" | "meeting" | undefined,
    page = 1,
    limit = 10,
  ) {
    const now = new Date();
    const query = await db.transaction(async (tx) => {
      const res = await tx.query.events.findMany({
        where: and(
          sql`${events.endTime} < ${now.toISOString()}`,
          eq(events.status, 'published'),
          eq(events.createdBy, userID),
          type ? sql`${events.categoryID} = ${type === 'webinar' ? 1 : 2}` : undefined
        ),
        limit: limit,
        offset: (page - 1) * limit
      })

      const val = await tx.select({val : count()}).from(events).where(
        and(
          sql`${events.endTime} < ${now.toISOString()}`,
          eq(events.status, 'published'),
          eq(events.createdBy, userID),
          type ? sql`${events.categoryID} = ${type === 'webinar' ? 1 : 2}` : undefined
        )
      )

      return {data: res, meta: {
        current_page: page,
        total_page: Math.ceil(val[0].val / limit) || 1,
        per_page: limit,
        total_record: val[0].val
      }}
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

  async registerParticipant(participant: insertParticipant) {
    const res = await db.insert(participants).values(participant)
      .returning()

    return res[0];
  }

  async countRegistiree(eventID: number) {
    const res = await db
      .select({
        value: count(),
      })
      .from(participants)
      .where(eq(participants.eventID, eventID));

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
        .from(participants)
        .innerJoin(events, eq(participants.eventID, events.id))
        .where(
          and(
            eq(events.slug, slug),
            eq(events.createdBy, createdBy),
            eq(participants.roleID, 1))
        )

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
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
      };
    });

    return { data: data, meta };
  }

  async getEventParticipantsByEventId(eventId: number) {
    const res = await db.query.participant.findMany({
      where: eq(participants.eventID, eventId),
    });

    return res;
  }

  async getParticipantById(id: number) {
    return await db.query.participant.findFirst({
      where: eq(participants.id, id),
    });
  }

  async getParticipantByClientId(clientId: string) {
    return await db.query.participant.findFirst({
      where: eq(participants.clientId, clientId),
    });
  }

  async updateParticipant(participant: selectParticipant) {
    const res = await db.update(participants).set(participant).where(eq(participants.id, participant.id)).returning()
    return res[0]
  }


  async getEventParticipantByEmail(email: string, eventID: number): Promise<selectParticipant | undefined>;
  async getEventParticipantByEmail(email: string, eventSlug: string): Promise<selectParticipant | undefined>;

  async getEventParticipantByEmail(email: string, eventIDorSlug: number | string): Promise<selectParticipant | undefined> {
    if (typeof eventIDorSlug === 'number') {
      return await db.query.participant.findFirst({
        where: and(eq(participants.email, email), eq(participants.eventID, eventIDorSlug)),
      });
    }

    if (typeof eventIDorSlug === 'string') {
      const res = await db.select(
        {
          participants: participants,
        }
      ).from(participants).innerJoin(events, eq(participants.eventID, events.id)).where(
        and(
          eq(participants.email, email),
          eq(events.slug, eventIDorSlug)
        )
      ).limit(1);

      return res[0].participants
    }

    throw new Error('Invalid eventIDorSlug');
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

  async getAllParticipantsByEventId(
    eventId: number,
    limit: number,
    page: number
  ): Promise<{
    data: Participant[];
    meta: PageMeta;
  } | undefined> {

    if (page < 1) {
      page = 1;
    }

    if (limit < 1) {
      limit = 10;
    }

    const subQueryConnectedClient = db
      .select(
        {
          meta: activitiesLog.meta,
          eventID: events.id
        }
      )
      .from(activitiesLog)
      .innerJoin(
        events,
        and(eq(events.roomId, sql`${activitiesLog.meta} ->> 'roomID'`), eq(activitiesLog.name, "RoomDuration"))
      )
      .where(eq(events.id, eventId))
      .as('ConnectedClientsLog');

    // Removes the duplicates clientID
    const subQueryUniqueConnectedClient = db
      .selectDistinctOn([sql`${subQueryConnectedClient.meta} ->> 'clientID'`], {
        clientID:
          sql<string>`${subQueryConnectedClient.meta} ->> 'clientID'`.as(
            'clientID'
          ),
        name: sql<string>`${subQueryConnectedClient.meta} ->> 'name'`.as(
          'name'
        ),
        eventID: subQueryConnectedClient.eventID,
      })
      .from(subQueryConnectedClient)
      .as('UniqueConnectedClients');

    // TODO : Query the alias for same clientID with same name
    // subQueryGetAlias

    const participantMatchEventID = db.
      select().
      from(participants).
      where(
        and(
          eq(participants.eventID, eventId),
          eq(participant.roleID, 1))
      ).
      as('participantEventID');

    // add the isRegistered and isJoined field and email
    const finalQuery = await db
      .select({
        clientID: subQueryUniqueConnectedClient.clientID,
        name: sql<string>`
        CASE
          WHEN ${participantMatchEventID.firstName} IS NULL THEN ${subQueryUniqueConnectedClient.name}
          ELSE CONCAT_WS(' ', ${participantMatchEventID.firstName}, ${participantMatchEventID.lastName})
        END
          `.as('name'),
        email: participantMatchEventID.email,
        isRegistered: sql<boolean>`
        CASE
          WHEN ${participantMatchEventID.clientId} IS NULL THEN ${false}
          ELSE ${true}
        END
        `.as('isRegistered'),
        isJoined: sql<boolean>`
        CASE
          WHEN (${participantMatchEventID.clientId} IS NOT NULL AND ${subQueryUniqueConnectedClient.clientID} IS NOT NULL)
            OR (${participantMatchEventID.clientId} IS NULL AND ${subQueryUniqueConnectedClient.clientID} IS NOT NULL) THEN ${true}
          ELSE ${false}
        END
        `.as('isJoined'),
        eventID: sql<number>` COALESCE(${participantMatchEventID.eventID},${subQueryUniqueConnectedClient.eventID})`.as('eventID')
      })
      .from(subQueryUniqueConnectedClient)
      .fullJoin(
        participantMatchEventID,
        eq(participantMatchEventID.clientId, subQueryUniqueConnectedClient.clientID)
      ).as('participants')

    const { data, meta } = await db.transaction(async (tx) => {
      const data = await tx.select().from(finalQuery)
        .limit(limit)
        .offset((page - 1) * limit);

      const total = await tx.select({ total: count() }).from(finalQuery);

      const meta: PageMeta = {
        current_page: page,
        total_page: Math.ceil(total[0].total / limit) || 1,
        per_page: limit,
        total_record: total[0].total
      }

      return { data, meta };
    })

    return { data, meta };
  }

  /**
   * Get the list of participants that fully attended the event based on the percentage of the event duration
   *
   *
   * @param eventId the eventID
   * @param percentage percentage value to be counted as fully attended (0-100)
   * @returns list of participant that satisfy the percentage condition
   */
  async getFullyAttendedParticipant(eventId: number, percentage: number): Promise<participantAttendances> {
    const { participants, event } = await db.transaction(async (tx) => {
      const event = await tx.query.events.findFirst({
        where: eq(events.id, eventId)
      })

      if (!event) {
        throw new Error('Event not found');
      }

      const registeredParticipants = await tx
        .select({
          clientID: sql<string>`${activitiesLog.meta} ->> 'clientID'`.as('clientID'),
          combined_logs: sql<z.infer<typeof RoomDurationMeta>[]>`ARRAY_AGG(meta ORDER BY ${activitiesLog.meta} ->> 'joinTime')`.as('combined_logs')
        })
        .from(activitiesLog)
        .innerJoin(
          participant,
          and(
            eq(sql<object[]>`${activitiesLog.meta} ->> 'roomID'`, event.roomId),
            eq(sql<string>`${activitiesLog.meta} ->> 'clientID'`, sql<string>`${participant.clientId}`)))
        .groupBy(sql<string>`${activitiesLog.meta} ->> 'clientID'`);
      return { participants: registeredParticipants, event };
    })

    const eventDuration = (event.endTime.getTime() - event.startTime.getTime()) / 1000;

    const participantAttendance = participants.map((participant) => {
      const parsedLogs = ArrayRoomDurationMeta.parse(participant.combined_logs)
      const totalDuration = getTotalJoinDuration(parsedLogs, event.startTime, event.endTime) / 1000;
      const isAttended = ((totalDuration / eventDuration) * 100) >= percentage;
      return {
        clientID: participant.clientID,
        joinDuration: totalDuration,
        isAttended,
      }
    })

    const attendedCount = participantAttendance.filter((participant) => participant.isAttended).length;
    const totalCount = participantAttendance.length;

    return {
      participant: participantAttendance,
      attendedCount,
      totalCount,
      eventDuration
    }

  }

}


function getTotalJoinDuration(intervals: z.infer<typeof RoomDurationMeta>[], sessionStartTime: Date, sessionEndTime: Date): number {
  // Sort intervals by joinTime
  intervals.sort((a, b) => a.joinTime.getTime() - b.joinTime.getTime());

  let totalDuration = 0;
  let currentEndTime: number | null = null;

  for (const interval of intervals) {
    // Check if interval is within session start and end time
    const validJoinTime = interval.joinTime >= sessionStartTime && interval.joinTime <= sessionEndTime;
    const validLeaveTime = interval.leaveTime <= sessionEndTime;

    if (validJoinTime && validLeaveTime) {
      if (currentEndTime === null || interval.joinTime.getTime() >= currentEndTime) {
        // No overlap, add duration
        totalDuration += interval.duration;
      } else if (interval.leaveTime.getTime() > (currentEndTime || 0)) {
        // Overlap, add only the additional duration beyond the current end time
        totalDuration += interval.leaveTime.getTime() - (currentEndTime || 0);
      }
      // Update currentEndTime
      currentEndTime = Math.max(currentEndTime || 0, interval.leaveTime.getTime());
    } else if (validJoinTime && !validLeaveTime) {
      // Partial overlap
      if (currentEndTime === null || interval.joinTime.getTime() >= currentEndTime) {
        // No overlap, add duration until session end time
        totalDuration += sessionEndTime.getTime() - interval.joinTime.getTime();
      } else {
        // Overlap, add only the additional duration until session end time
        totalDuration += sessionEndTime.getTime() - (currentEndTime || 0);
      }
      // No need to process further intervals if we've reached session end time
      break;
    }
    // Ignore intervals outside session start and end time
  }

  return totalDuration;
}
