import { db } from '@/(server)/_shared/database/database';
import { activitiesLog, type InsertActivityLog } from './schema';
import { RoomType } from '@/_shared/types/room';
import { sql, type SQL } from 'drizzle-orm';

export const addLog = async (data: InsertActivityLog) => {
  return db.insert(activitiesLog).values(data).returning();
};

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
