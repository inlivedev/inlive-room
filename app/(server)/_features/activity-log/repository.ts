import { db } from '@/(server)/_shared/database/database';
import { activitiesLog, type InsertActivityLog } from './schema';
import { RoomType } from '@/_shared/types/room';
import { countDistinct, eq, sql, type SQL, isNull, and } from 'drizzle-orm';
import { participant } from '../event/schema';

export const addLog = async (data: InsertActivityLog) => {
  const res = await db.insert(activitiesLog).values(data).returning();

  return res[0];
};

/**
 *
 * @param userID
 * @param roomType
 * @returns number of duration in milliseconds
 */
export const aggregateRoomDuration = async (
  userID: number,
  roomType?: RoomType.Type
): Promise<number> => {
  const sqlChunks: SQL[] = [];

  // Create the SQL query
  sqlChunks.push(
    sql`SELECT SUM(CAST(${activitiesLog.meta}->>'duration' AS numeric)) AS total_duration FROM ${activitiesLog} `
  );
  sqlChunks.push(sql`WHERE `);
  sqlChunks.push(sql`${activitiesLog.createdBy} = ${userID} `);
  if (roomType) {
    sqlChunks.push(sql`AND ${activitiesLog.meta} ->> 'roomType' = ${roomType}`);
  }
  const finalSQL = sql.join(sqlChunks);

  const res = await db.execute(finalSQL);

  try {
    const duration = res[0].total_duration as number;
    return duration;
  } catch (e) {
    return 0;
  }
};

export const countRegisteredParticipant = async (roomID: string) => {
  const res = await db
    .select({ value: countDistinct(sql`${activitiesLog.meta} ->> 'clientID'`) })
    .from(activitiesLog)
    .innerJoin(
      participant,
      and(
        eq(sql`${activitiesLog.meta} ->> 'clientID'`, participant.clientId),
        eq(sql`${activitiesLog.meta} ->> 'roomID'`, roomID)
      )
    );

  return res[0];
};

export const countGuestParticipant = async (roomID: string) => {
  const res = await db
    .select({ value: countDistinct(sql`${activitiesLog.meta} ->> 'clientID'`) })
    .from(activitiesLog)
    .leftJoin(
      participant,
      and(
        eq(sql`${activitiesLog.meta} ->> 'clientID'`, participant.clientId),
        eq(sql`${activitiesLog.meta} ->> 'roomID'`, roomID)
      )
    )
    .where(
      and(
        isNull(participant.clientId),
        eq(sql`${activitiesLog.meta} ->> 'roomID'`, roomID)
      )
    );

  return res[0];
};

export const countParticipants = async (roomID: string) => {
  const res = await db
    .select({ value: countDistinct(sql`${activitiesLog.meta} ->> 'clientID'`) })
    .from(activitiesLog)
    .where(sql`${activitiesLog.meta} ->> 'roomID' = ${roomID}`);

  return res[0];
};
