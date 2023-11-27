import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { selectEvent } from '@/(server)/_features/event/schema';
import * as Sentry from '@sentry/nextjs';
import { GenerateIcal } from '@/(server)/api/events';

const MAILER_API_KEY = process.env.MAILER_API_KEY || '';
const MAILER_DOMAIN = process.env.MAILER_DOMAIN || '';
const ROOM_INV_EMAIL_TEMPLATE = process.env.ROOM_INV_EMAIL_TEMPLATE || '';
const ENABLE_MAILER = process.env.ENABLE_MAILER || false;
const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

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
  firstName: string,
  lastName: string,
  address: string,
  event: typeof selectEvent
) {
  const eventDate = Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: 'Asia/Jakarta',
  }).format(event.startTime);

  const eventTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(event.startTime);

  const icalString = GenerateIcal(event);
  const iCalendarBuffer = Buffer.from(icalString, 'utf-8');

  const res = await mailer.messages.create(MAILER_DOMAIN, {
    template: ROOM_INV_EMAIL_TEMPLATE,
    from: 'inLive Room Events <notification@inlive.app>',
    to: address,
    subject: `Your invitation URL for ${event.name}`,
    'v:room-url': `${PUBLIC_URL}/room/${event.roomId}`,
    'v:event-url': `${PUBLIC_URL}/event/${event.slug}`,
    'v:event-name': event.name,
    'v:event-description': event.description,
    'v:event-date': eventDate,
    'v:event-time': eventTime,
    'v:event-host': event.host,
    'v:event-calendar': `${PUBLIC_URL}/api/events/${event.slug}/calendar`,
    'v:user-firstname': firstName,
    'v:user-lastname': lastName,
    inline: {
      data: iCalendarBuffer,
      filename: 'invite.ics',
      contentType:
        'application/ics; charset=utf-8; method=REQUEST; name=invite.ics',
      contentDisposition: 'inline; filename=invite.ics',
      contentTransferEncoding: 'base64',
    },
  });

  if (res.status >= 400) {
    Sentry.captureEvent({
      message: 'Event Invitation Email Request Fail',
      level: 'info',
      extra: {
        name: firstName,
        email: address,
        event,
        res,
      },
    });

    return;
  }

  Sentry.captureEvent({
    message: 'Event Invitation Email Request Success',
    level: 'info',
    extra: { name: firstName, email: address, event, res },
  });
}
