import { selectEvent } from '@/(server)/_features/event/schema';
import { generateID } from '@/(server)/_shared/utils/generateid';

const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

export function GenerateIcal(event: typeof selectEvent) {
  return `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:REQUEST
PRODID:-//inLive//inLive//EN
BEGIN:VEVENT
UID:${generateID(12)}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}
DTSTART:${event.startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}
DTEND:${event.endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}
SUMMARY:${event.name}
ORGANIZER:${event.host}
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;
URL;VALUE=URI:${PUBLIC_URL}/event/${event.slug}
DESCRIPTION:${event.name} - ${PUBLIC_URL}/event/${event.slug}
END:VEVENT
END:VCALENDAR`;
}
