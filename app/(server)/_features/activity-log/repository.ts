import { db } from '@/(server)/_shared/database/database';
import { activitiesLog, type InsertActivityLog } from './schema';
import { RoomType } from '@/_shared/types/room';
import { count, countDistinct, sql, type SQL } from 'drizzle-orm';

export const addLog = async (data: InsertActivityLog) => {
  return db.insert(activitiesLog).values(data).returning();
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

export const countJoinedUser = async (roomID: string) => {
  const res = await db
    .select({ value: countDistinct(activitiesLog.createdBy) })
    .from(activitiesLog)
    .where(
      sql`${activitiesLog.meta} ->> 'roomID' = ${roomID} AND ${activitiesLog.createdBy} IS NOT NULL`
    );

  return res[0];
};
