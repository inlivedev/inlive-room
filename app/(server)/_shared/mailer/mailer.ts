import Mailgun, { MailgunMessageData } from 'mailgun.js';
import formData from 'form-data';

const MAILER_API_KEY = process.env.MAILER_API_KEY || '';
const MAILER_DOMAIN = process.env.MAILER_DOMAIN || '';
process.env.ROOM_RESCHED_EMAIL_TEMPLATE || '';
const ENABLE_MAILER = process.env.ENABLE_MAILER || false;

export function isMailerEnabled() {
  return ENABLE_MAILER === 'true';
}

export type EmailCustomValue = {
  [key: string]: string;
};

export async function sendEmail(
  email: {
    template?: string;
    html?: string;
  },
  data: {
    destination: string;
    keyValues?: EmailCustomValue;
    inlineAttachment?: {
      data: Buffer;
      filename: string;
      contentType: string;
      contentDisposition: string;
      contentTransferEncoding: string;
    };
    subject: string;
  }
) {
  if (!isMailerEnabled()) {
    return;
  }
  const mg = new Mailgun(formData);
  const mailer = mg.client({
    key: MAILER_API_KEY,
    username: 'api',
  });

  const mailgunData = {
    from: 'inLive Room Events <notification@inlive.app>',
    to: data.destination,
    ...data.keyValues,
    inline: data.inlineAttachment ? data.inlineAttachment : undefined,
    subject: data.subject,
  };

  if (email.html) {
    const mailgunDataHtml = {
      ...mailgunData,
      html: email.html,
    };
    const res = await mailer.messages.create(MAILER_DOMAIN, mailgunDataHtml);

    return res;
  }

  if (email.template) {
    const mailgunDataTemplate = {
      ...mailgunData,
      template: email.template,
    };

    const res = await mailer.messages.create(
      MAILER_DOMAIN,
      mailgunDataTemplate
    );
    return res;
  }

  return;
}
