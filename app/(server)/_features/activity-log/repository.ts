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
) => {
  const sqlChunks: SQL[] = [];

  sqlChunks.push(sql`${activitiesLog.createdBy} = ${userID} `);

  if (roomType) {
    sqlChunks.push(sql`AND ${activitiesLog.meta} ->> ${roomType}`);
  }
  const finalSQL = sql.join(sqlChunks);

  const res = await db.select().from(activitiesLog).where(finalSQL);

  console.log(res);
};
