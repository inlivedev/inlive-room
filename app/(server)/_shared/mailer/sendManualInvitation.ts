import { selectEvent } from '@/(server)/_features/event/schema';
import { render } from '@react-email/render';
import EventManualInvitation from 'emails/event/EventManualInvitation';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const MAILER_API_KEY = process.env.MAILER_API_KEY || '';
const MAILER_DOMAIN = process.env.MAILER_DOMAIN || '';

export async function SendEventManualInvitationEmail(
  event: selectEvent,
  email: string
) {
  const mg = new Mailgun(formData);
  const mailer = mg.client({
    key: MAILER_API_KEY,
    username: 'api',
  });

  const html = render(
    EventManualInvitation({
      event,
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
