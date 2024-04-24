import { integer, pgTable, text, serial, pgEnum } from 'drizzle-orm/pg-core';
import jsonb from '@/(server)/_shared/database/custom-type';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

const jobsStatusEnum = pgEnum('job_status_enum', [
  'scheduled',
  'running',
  'completed',
  'failed',
]);

export const scheduledJobs = pgTable('scheduled_jobs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  status: jobsStatusEnum('status').notNull().default('scheduled'),
  retryCount: integer('retry_count').notNull().default(0),
  meta: jsonb('meta'),
});

export type ScheduledJobs = InferSelectModel<typeof scheduledJobs>;
export type insertScheduledJobs = InferInsertModel<typeof scheduledJobs>;
