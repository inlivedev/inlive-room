const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

// reference: https://www.rfc-editor.org/rfc/rfc5545
export function GenerateIcal(
  event: {
    uuid: string;
    name: string;
    slug: string;
    roomId?: string | null;
    startTime: Date;
    endTime: Date;
    status: string;
  },
  type: 'webinar' | 'meeting',
  timezone: string,
  host: {
    name: string;
    email: string;
  },
  participant: {
    clientId: string;
    firstName: string;
    lastName: string;
    email: string;
    updateCount: number;
  }
) {
  const { eventDate, eventStartTime, eventEndTime, DTSTAMP, DTSTART, DTEND } =
    generateDateTime(
      {
        start: event.startTime,
        end: event.endTime,
      },
      timezone
    );

  const roomURL = `${PUBLIC_URL}/rooms/${event.roomId}?clientID=${participant.clientId}`;

  let eventStatus = 'CONFIRMED';
  let eventMethod = 'REQUEST';

  if (event.status === 'cancelled') {
    eventStatus = 'CANCELLED';
    eventMethod = 'CANCEL';
  }

  let eventDesc = '';

  switch (type) {
    case 'meeting':
      eventDesc = createMeetingDesc({
        eventDate,
        eventStartTime,
        eventEndTime,
        roomURL,
        host: host.name,
      });
      break;
    case 'webinar':
      eventDesc = createWebinarDesc({
        name: event.name,
        eventDate,
        eventStartTime,
        roomURL,
        slug: event.slug,
        host: host.name,
      });
      break;

    default:
      break;
  }

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
SEQUENCE:${participant.updateCount}
STATUS:${eventStatus}
DESCRIPTION:${eventDesc}
END:VEVENT
END:VCALENDAR`;
}

function generateDateTime(
  time: {
    start: Date;
    end: Date;
  },
  timezone: string
) {
  const eventDate = Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: timezone,
  }).format(time.start);

  const eventStartTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: timezone,
  }).format(time.start);

  const eventEndTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: timezone,
  }).format(time.end);

  const icalStartDate = Intl.DateTimeFormat('fr-CA', {
    timeZone: timezone,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
    .format(time.start)
    .replaceAll('-', '');

  const icalStartTime = Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timezone,
  })
    .format(time.start)
    .replaceAll(':', '');

  const icalEndDate = Intl.DateTimeFormat('fr-CA', {
    timeZone: timezone,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
    .format(time.end)
    .replaceAll('-', '');

  const icalEndTime = Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timezone,
  })
    .format(time.end)
    .replaceAll(':', '');

  const DTSTAMP = `${icalStartDate}T${icalStartTime}`;
  const DTSTART = `${icalStartDate}T${icalStartTime}`;
  const DTEND = `${icalEndDate}T${icalEndTime}`;
  return { eventDate, eventStartTime, eventEndTime, DTSTAMP, DTSTART, DTEND };
}

function createWebinarDesc(meta: {
  name: string;
  eventDate: string;
  eventStartTime: string;
  roomURL: string;
  slug: string;
  host: string;
}) {
  return `Hi there!\\n
  Thanks for registering for our upcoming webinar!\\n
  We're excited to have you join us to learn more about\\n
  \\n
  ${meta.name}\\n
  Hosted by ${meta.host}\\n
  \\n
  ${meta.eventDate} - ${meta.eventStartTime}\\n
  \\n
  Don't forget to mark your calendar on that date, see you there!\\n
  \\n
  About event : ${PUBLIC_URL}/events/${meta.slug}\\n
  Join the event : ${meta.roomURL}`;
}

function createMeetingDesc(meta: {
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  roomURL: string;
  host: string;
}) {
  return `
  Hi there! \\n

  ${meta.host} has scheduled a meeting with you. \\n
  ${meta.eventDate}
  ${meta.eventStartTime} - ${meta.eventEndTime} \\n

  Join the meeting : ${meta.roomURL} \\n
  `;
}
