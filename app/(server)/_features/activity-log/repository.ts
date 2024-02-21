import { db } from '@/(server)/_shared/database/database';
import { activitiesLog, type InsertEventLog } from './schema';

export const addLog = async (data: InsertEventLog) => {
  db.insert(activitiesLog).values(data).returning();
};
