import {
  selectEvent,
  selectParticipant,
} from '@/(server)/_features/event/schema';
import { User } from '@/(server)/_features/user/schema';

const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

// reference: https://www.rfc-editor.org/rfc/rfc5545
export function GenerateIcal(
  event: selectEvent,
  timezone: string,
  host: User,
  participant: selectParticipant
) {
  const { eventDate, eventTime, DTSTAMP, DTSTART, DTEND } = generateDateTime(
    event,
    timezone
  );

  let eventStatus = 'CONFIRMED';
  let eventMethod = 'REQUEST';

  if (event.status === 'cancelled') {
    eventStatus = 'CANCELLED';
    eventMethod = 'CANCEL';
  }

  const eventDesc = `Hi there!\\n
  Thanks for registering for our upcoming webinar!\\n
  We're excited to have you join us to learn more about\\n
  \\n
  ${event.name}\\n
  Hosted by ${host.name}\\n
  \\n
  ${eventDate} - ${eventTime}\\n
  \\n
  Don't forget to mark your calendar on that date, see you there!\\n
  \\n
  About event : ${PUBLIC_URL}/events/${event.slug}\\n
  Join the event : ${PUBLIC_URL}/rooms/${event.roomId}`;

  // eslint-disable-next-line prettier/prettier
  return `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:${eventMethod}
PRODID:-//inLive//inLive//EN
BEGIN:VTIMEZONE
TZID:Asia/Jakarta
LAST-MODIFIED:20230911T053111Z
TZURL:https://www.tzurl.org/zoneinfo-outlook/Asia/Jakarta
X-LIC-LOCATION:Asia/Jakarta
BEGIN:STANDARD
TZNAME:WIB
TZOFFSETFROM:+0700
TZOFFSETTO:+0700
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
UID:${event.uuid}
DTSTAMP;TZID=${timezone}:${DTSTAMP}
DTSTART;TZID=${timezone}:${DTSTART}
DTEND;TZID=${timezone}:${DTEND}
SUMMARY:${event.name}
ORGANIZER;CN=${host.name}:mailto:${host.email}
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${participant.firstName} ${participant.lastName};X-NUM-GUESTS=0:mailto:${participant.email}
URL;VALUE=URI:${PUBLIC_URL}/events/${event.slug}
X-INLIVE-ROOM:${PUBLIC_URL}/rooms/${event.roomId}
SEQUENCE:${event.update_count}
STATUS:${eventStatus}
DESCRIPTION:${eventDesc}
END:VEVENT
END:VCALENDAR`;
}

function generateDateTime(event: selectEvent, timezone: string) {
  const eventDate = Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: timezone,
  }).format(event.startTime);

  const eventTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: timezone,
  }).format(event.startTime);

  const icalStartDate = Intl.DateTimeFormat('fr-CA', {
    timeZone: timezone,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
    .format(event.startTime)
    .replaceAll('-', '');

  const icalStartTime = Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timezone,
  })
    .format(event.startTime)
    .replaceAll(':', '');

  const icalEndDate = Intl.DateTimeFormat('fr-CA', {
    timeZone: timezone,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
    .format(event.endTime)
    .replaceAll('-', '');

  const icalEndTime = Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timezone,
  })
    .format(event.endTime)
    .replaceAll(':', '');

  const DTSTAMP = `${icalStartDate}T${icalStartTime}`;
  const DTSTART = `${icalStartDate}T${icalStartTime}`;
  const DTEND = `${icalEndDate}T${icalEndTime}`;
  return { eventDate, eventTime, DTSTAMP, DTSTART, DTEND };
}
