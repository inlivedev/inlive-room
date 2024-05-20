import Mailgun from 'mailgun.js';
import formData from 'form-data';
import {
  selectEvent,
  selectParticipant,
} from '@/(server)/_features/event/schema';
import * as Sentry from '@sentry/nextjs';
import { createICS } from '@/(server)/api/events';
import { render } from '@react-email/render';
import EventManualInvitation from 'emails/event/EventManualInvitation';
import { EventType } from '@/_shared/types/event';
import EmailScheduledMeeting from 'emails/event/EventScheduleMeeting';

const MAILER_API_KEY = process.env.MAILER_API_KEY || '';
const MAILER_DOMAIN = process.env.MAILER_DOMAIN || '';
const ROOM_INV_EMAIL_TEMPLATE = process.env.ROOM_INV_EMAIL_TEMPLATE || '';
const ROOM_CANCEL_EMAIL_TEMPLATE = process.env.ROOM_CANCEL_EMAIL_TEMPLATE || '';
const ROOM_RESCHED_EMAIL_TEMPLATE =
  process.env.ROOM_RESCHED_EMAIL_TEMPLATE || '';
const ENABLE_MAILER = process.env.ENABLE_MAILER || false;
const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

export function isMailerEnabled() {
  return ENABLE_MAILER === 'true';
}

export async function SendEventInvitationEmail(
  event: selectEvent,
  host: EventType.Host,
  participant?: selectParticipant
) {
  const mg = new Mailgun(formData);
  const mailer = mg.client({
    key: MAILER_API_KEY,
    username: 'api',
  });

  const eventDate = Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: 'Asia/Jakarta',
  }).format(event.startTime);

  const eventTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(event.startTime);

  const ICSString = createICS(
    { ...event },
    host,
    'webinar',
    participant
  ).toString();
  const iCalendarBuffer = Buffer.from(ICSString, 'utf-8');

  const recipient = createRecipient(event, host, participant);

  const res = await mailer.messages.create(MAILER_DOMAIN, {
    template: ROOM_INV_EMAIL_TEMPLATE,
    from: 'inLive Room Events <notification@inlive.app>',
    to: recipient.email,
    subject: `Your invitation URL for ${event.name}`,
    'v:room-url': recipient.joinRoomURL,
    'v:event-url': `${PUBLIC_URL}/events/${event.slug}`,
    'v:event-name': event.name,
    'v:event-description': event.description,
    'v:event-date': eventDate,
    'v:event-time': eventTime,
    'v:event-host': host.name,
    'v:event-calendar': recipient.calendarURL,
    'v:user-firstname': recipient.firstName,
    'v:user-lastname': recipient.lastName,
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
        name: recipient.firstName + ' ' + recipient.lastName,
        email: recipient.email,
        event,
        res,
      },
    });

    return;
  }

  Sentry.captureEvent({
    message: 'Event Invitation Email Request Success',
    level: 'info',
    extra: {
      name: recipient.firstName + ' ' + recipient.lastName,
      email: recipient.email,
      event,
      res,
    },
  });
}

export async function SendEventCancelledEmail(
  event: selectEvent,
  host: EventType.Host,
  participant?: selectParticipant
) {
  const mg = new Mailgun(formData);
  const mailer = mg.client({
    key: MAILER_API_KEY,
    username: 'api',
  });

  const eventDate = Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: 'Asia/Jakarta',
  }).format(event.startTime);

  const eventTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(event.startTime);

  const ICSString = createICS(
    { ...event },
    host,
    'webinar',
    participant
  ).toString();
  const iCalendarBuffer = Buffer.from(ICSString, 'utf-8');

  const recipient = createRecipient(event, host, participant);

  const res = await mailer.messages.create(MAILER_DOMAIN, {
    template: ROOM_CANCEL_EMAIL_TEMPLATE,
    from: 'inLive Room Events <notification@inlive.app>',
    to: recipient.email,
    subject: `Your event ${event.name} has been cancelled`,
    'v:room-url': `${PUBLIC_URL}/rooms/${event.roomId}`,
    'v:event-url': `${PUBLIC_URL}/events/${event.slug}`,
    'v:event-name': event.name,
    'v:event-description': event.description,
    'v:event-date': eventDate,
    'v:event-time': eventTime,
    'v:event-host': host.name,
    'v:event-calendar': recipient.calendarURL,
    'v:user-firstname': recipient.firstName,
    'v:user-lastname': recipient.lastName,
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
      message: 'Event Cancelled Email Request Fail',
      level: 'info',
      extra: {
        name: recipient.firstName + ' ' + recipient.lastName,
        email: recipient.email,
        event,
        res,
      },
    });

    return;
  }

  Sentry.captureEvent({
    message: 'Event Cancelled Email Request Success',
    level: 'info',
    extra: {
      name: recipient.firstName + ' ' + recipient.lastName,
      email: recipient.email,
      event,
      res,
    },
  });
}

export async function SendEventRescheduledEmail(
  newEvent: selectEvent,
  oldEvent: selectEvent,
  host: EventType.Host,
  participant?: selectParticipant
) {
  const mg = new Mailgun(formData);
  const mailer = mg.client({
    key: MAILER_API_KEY,
    username: 'api',
  });

  const oldEventDate = Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: 'Asia/Jakarta',
  }).format(oldEvent.startTime);

  const oldEventTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(oldEvent.startTime);

  const newEventDate = Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: 'Asia/Jakarta',
  }).format(newEvent.startTime);

  const newEventTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(newEvent.startTime);

  const ICSString = createICS(
    { ...newEvent },
    host,
    'webinar',
    participant
  ).toString();
  const iCalendarBuffer = Buffer.from(ICSString, 'utf-8');

  const recipient = createRecipient(newEvent, host, participant);

  const res = await mailer.messages.create(MAILER_DOMAIN, {
    template: ROOM_RESCHED_EMAIL_TEMPLATE,
    from: 'inLive Room Events <notification@inlive.app>',
    to: recipient.email,
    subject: `Your event ${oldEvent.name} has been rescheduled`,
    'v:room-url': recipient.joinRoomURL,
    'v:event-url': `${PUBLIC_URL}/events/${newEvent.slug}`,
    'v:new-event-name': newEvent.name,
    'v:new-event-description': newEvent.description,
    'v:new-event-date': newEventDate,
    'v:new-event-time': newEventTime,
    'v:old-event-name': oldEvent.name,
    'v:old-event-description': oldEvent.description,
    'v:old-event-date': oldEventDate,
    'v:old-event-time': oldEventTime,
    'v:event-host': host.name,
    'v:event-calendar': recipient.calendarURL,
    'v:user-firstname': recipient.firstName,
    'v:user-lastname': recipient.lastName,
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
      message: 'Event Rescheduled Email Request Fail',
      level: 'info',
      extra: {
        name: recipient.firstName,
        email: recipient.email,
        newEvent,
        res,
      },
    });

    return;
  }

  Sentry.captureEvent({
    message: 'Event Rescheduled Email Request Success',
    level: 'info',
    extra: {
      name: recipient.firstName,
      email: recipient.email,
      newEvent,
      res,
    },
  });
}

export async function SendEventManualInvitationEmail(
  event: selectEvent,
  host: EventType.Host,
  email: string
) {
  const mg = new Mailgun(formData);
  const mailer = mg.client({
    key: MAILER_API_KEY,
    username: 'api',
  });

  const html = render(
    EventManualInvitation({
      event: {
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime,
        thumbnailUrl: event.thumbnailUrl,
        slug: event.slug,
      },
      host: {
        name: host.name,
      },
    }),
    { pretty: true }
  );

  mailer.messages.create(MAILER_DOMAIN, {
    html: html,
    from: 'inLive Room Events <notification@inlive.app>',
    to: email,
    subject: `Webinar Invitation: ${event.name}`,
  });
}

export async function SendScheduledMeetinEmail(
  event: selectEvent,
  host: EventType.Host,
  email: string,
  participant?: selectParticipant,
  participants?: selectParticipant[]
) {
  const mg = new Mailgun(formData);
  const mailer = mg.client({
    key: MAILER_API_KEY,
    username: 'api',
  });

  const ICSString = createICS(
    { ...event },
    host,
    'meeting',
    participant,
    participants
  ).toString();
  const iCalendarBuffer = Buffer.from(ICSString, 'utf-8');

  const html = render(
    EmailScheduledMeeting({
      event: {
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime,
        slug: event.slug,
        roomID: event.roomId || '',
      },
      host: {
        name: host.name,
      },
      clientID: participant ? participant.clientId : undefined,
    }),
    { pretty: true }
  );

  mailer.messages.create(MAILER_DOMAIN, {
    html: html,
    from: 'inLive Room Events <notification@inlive.app>',
    to: email,
    subject: `Webinar Invitation: ${event.name}`,
    inline: {
      data: iCalendarBuffer,
      filename: 'invite.ics',
      contentType:
        'application/ics; charset=utf-8; method=REQUEST; name=invite.ics',
      contentDisposition: 'inline; filename=invite.ics',
      contentTransferEncoding: 'base64',
    },
  });
}

function createRecipient(
  event: selectEvent,
  host: EventType.Host,
  participant?: selectParticipant
) {
  return {
    joinRoomURL: participant
      ? `${PUBLIC_URL}/rooms/${event.roomId}/?clientID=${participant.clientId}`
      : `${PUBLIC_URL}/rooms/${event.roomId}`,
    firstName: participant ? participant.firstName : host.name,
    lastName: participant ? participant.lastName : '',
    calendarURL: `${PUBLIC_URL}/api/events/${event.slug}/calendar/${
      participant ? participant.id : 0
    }`,
    email: participant ? participant.email : host.email,
  };
}
