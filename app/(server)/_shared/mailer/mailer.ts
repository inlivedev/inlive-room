import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { selectEvent } from '@/(server)/_features/event/schema';
import * as Sentry from '@sentry/nextjs';

const MAILER_API_KEY = process.env.MAILER_API_KEY || '';
const MAILER_DOMAIN = process.env.MAILER_DOMAIN || '';
const ROOM_INV_EMAIL_TEMPLATE = process.env.ROOM_INV_EMAIL_TEMPLATE || '';
const ENABLE_MAILER = process.env.ENABLE_MAILER || false;

export function isMailerEnabled(): boolean {
  if (ENABLE_MAILER === 'true') return true;
  return false;
}

const mg = new Mailgun(formData);
const mailer = mg.client({
  key: MAILER_API_KEY,
  username: 'api',
});

export async function SendEventInvitationEmail(
  name: string,
  email: string,
  event: typeof selectEvent
) {
  const eventDate = event.startTime.toDateString();
  const eventTime = event.startTime.toTimeString();

  const res = await mailer.messages.create(MAILER_DOMAIN, {
    template: ROOM_INV_EMAIL_TEMPLATE,
    from: 'inLive Room Events <notification@inlive.app>',
    to: email,
    subject: `Your invitation URL for ${event.name}`,
    'v:room-url': event.roomId,
    'v:event-url': event.slug,
    'v:event-name': event.name,
    'v:event-description': event.description,
    'v:event-date': eventDate,
    'v:event-time': eventTime,
  });

  if (res.status >= 400) {
    Sentry.captureEvent({
      message: 'Event Invitation Email Request Fail',
      level: 'info',
      extra: {
        name,
        email,
        event,
        res,
      },
    });

    return;
  }

  Sentry.captureEvent({
    message: 'Event Invitation Email Request Success',
    level: 'info',
    extra: { name, email, event, res },
  });
}
