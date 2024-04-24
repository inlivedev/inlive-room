import { CronJob } from 'cron';
import {
  batchUpdateJobStatus,
  getScheduledJobs,
} from '@/(server)/_features/job/repository';
import { eventRepo } from '@/(server)/api/_index';
import {
  SendEventCancelledEmail,
  SendEventRescheduledEmail,
} from '../mailer/mailer';

const sendEventUpdateEmailsJob = new CronJob(
  '*/15 * * * *',
  () => {
    getScheduledJobs('send_event_update_email').then(async (jobs) => {
      for (const job of jobs) {
        if (job.status === 'failed') {
          job.retryCount += 1;
        }

        try {
          const eventID = job.meta.eventID;
          const event = await eventRepo.getEventById(eventID);
          if (!event) {
            continue;
          }
          // Send email
          const eventParticipant = await eventRepo.getRegisteredParticipants(
            event?.id,
            false
          );

          for (const participant of eventParticipant.data) {
            if (event.status === 'cancelled') {
              SendEventCancelledEmail(participant, event, event.host);
            } else if (event.status === 'published') {
              SendEventRescheduledEmail(participant, event, event, event.host);
            }
          }

          job.status = 'completed';
        } catch (error) {
          job.status = 'failed';
        }

        // Batch update job status
      }
      batchUpdateJobStatus(jobs);
    });
  },
  null,
  true,
  undefined
);

export function runCronJobs() {
  sendEventUpdateEmailsJob.start();
}
