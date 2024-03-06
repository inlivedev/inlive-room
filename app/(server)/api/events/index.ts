import { selectEvent } from '@/(server)/_features/event/schema';
import { generateID } from '@/(server)/_shared/utils/generateid';

const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

export function GenerateIcal(event: selectEvent, timezone: string) {
  const { eventDate, eventTime, DTSTAMP, DTSTART, DTEND } = generateDateTime(
    event,
    timezone
  );

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
  About event : ${PUBLIC_URL}/events/${event.slug}\\n
  Join the event : ${PUBLIC_URL}/rooms/${event.roomId}`;

  // eslint-disable-next-line prettier/prettier
  return `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:REQUEST
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
UID:${generateID(12)}
DTSTAMP;TZID=${timezone}:${DTSTAMP}
DTSTART;TZID=${timezone}:${DTSTART}
DTEND;TZID=${timezone}:${DTEND}
SUMMARY:${event.name}
ORGANIZER:${event.host}
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTIONRSVP=TRUE:CN=${
    event.host
  }:MAILTO:example@example.com
URL;VALUE=URI:${PUBLIC_URL}/events/${event.slug}
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
