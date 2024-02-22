import { db } from '@/(server)/_shared/database/database';
import { activitiesLog, type InsertActivityLog } from './schema';

export const addLog = async (data: InsertActivityLog) => {
  return db.insert(activitiesLog).values(data).returning();
};
