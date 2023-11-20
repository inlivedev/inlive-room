import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { selectEvent } from '@/(server)/_features/event/schema';

const MAILER_API_KEY = process.env.MAILER_API_KEY || '';
const MAILER_DOMAIN = process.env.MAILER_DOMAIN || '';

const mg = new Mailgun(formData);
export const mailer = mg.client({
  key: MAILER_API_KEY,
  username: 'api',
});

export function SendEventInvitationEmail(
  name: string,
  email: string,
  event: typeof selectEvent
) {
  const eventDate = event.startTime.toDateString();
  const eventTime = event.startTime.toTimeString();

  mailer.messages.create(MAILER_DOMAIN, {
    template: 'event-invitation',
    from: 'inLive Room Events <notification@inlive.app>',
    to: email,
    title: `Your invitation URL for ${event.name}`,
    'v:room-url': event.roomId,
    'v:event-url': event.slug,
    'v:event-name': event.name,
    'v:event-description': event.description,
    'v:event-date': eventDate,
    'v:event-time': eventTime,
  });
}
