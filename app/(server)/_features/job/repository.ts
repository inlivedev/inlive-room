import { db } from '@/(server)/_shared/database/database';
import { SQL, and, eq, inArray, lt, sql } from 'drizzle-orm';
import { ScheduledJobs, scheduledJobs } from './schema';

export const getScheduledJobs = async (
  type: string
): Promise<ScheduledJobs[]> => {
  const jobs = db.transaction(async (tx) => {
    const jobs = await tx.query.scheduledJobs.findMany({
      where: and(
        eq(scheduledJobs.type, type),
        eq(scheduledJobs.status, 'scheduled')
      ),
    });

    const failedJobs = await tx.query.scheduledJobs.findMany({
      where: and(
        eq(scheduledJobs.type, type),
        eq(scheduledJobs.status, 'failed'),
        lt(scheduledJobs.retryCount, 3)
      ),
    });

    return [...jobs, ...failedJobs];
  });

  return jobs;
};

export const batchUpdateJobStatus = async (jobs: ScheduledJobs[]) => {
  const sqlStatusChunk: SQL[] = [];
  sqlStatusChunk.push(sql`(case`);
  for (const job of jobs) {
    sqlStatusChunk.push(
      sql`when ${scheduledJobs.id} = ${job.id} then ${job.status}`
    );
  }
  sqlStatusChunk.push(sql`end)`);
  const finalStatusSQL: SQL = sql.join(sqlStatusChunk, sql.raw(' '));

  const sqlRetryCountChunk: SQL[] = [];
  sqlRetryCountChunk.push(sql`(case`);
  for (const job of jobs) {
    sqlRetryCountChunk.push(
      sql`when ${scheduledJobs.id} = ${job.id} then ${job.retryCount}`
    );
  }
  sqlRetryCountChunk.push(sql`end)`);

  const finalRetryCountSQL: SQL = sql.join(sqlRetryCountChunk, sql.raw(' '));

  const updatedJobs = await db
    .update(scheduledJobs)
    .set({ status: finalStatusSQL, retryCount: finalRetryCountSQL })
    .where(
      inArray(
        scheduledJobs.id,
        jobs.map((job) => job.id)
      )
    )
    .returning();

  return updatedJobs;
};
