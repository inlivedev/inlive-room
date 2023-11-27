import { selectEvent } from '@/(server)/_features/event/schema';
import { generateID } from '@/(server)/_shared/utils/generateid';

const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

export function GenerateIcal(event: typeof selectEvent) {
  const eventDate = Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: 'Asia/Jakarta',
  }).format(event.startTime);

  const eventTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(event.startTime);

  const eventDesc = `Hi there!\\n
  Thanks for registering for our upcoming webinar!\\n
  We're excited to have you join us to learn more about\\n
  \\n
  ${event.name}\\n
  Hosted by ${event.host}\\n
  \\n
  ${eventDate} - ${eventTime}\\n
  \\n
  Don't forget to mark your calendar on that date, see you there!\\n
  \\n
  About event : ${PUBLIC_URL}/event/${event.slug}\\n
  Joint the event : ${PUBLIC_URL}/room/${event.roomId}`;

  // eslint-disable-next-line prettier/prettier
  return `BEGIN:VCALENDAR\rVERSION:2.0\rCALSCALE:GREGORIAN\rMETHOD:REQUEST\rPRODID:-//inLive//inLive//EN\rBEGIN:VEVENT\rUID:${generateID(12)}\rDTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}\rDTSTART:${event.startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}\rDTEND:${event.endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}\rSUMMARY:${event.name}\rORGANIZER:${event.host}\rATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:CN=${event.host}:MAILTO:hello@inlive.app\rURL;VALUE=URI:${PUBLIC_URL}/event/${event.slug}\rDESCRIPTION:${eventDesc}\rEND:VEVENT\rEND:VCALENDAR`;
}
