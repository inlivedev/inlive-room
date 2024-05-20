import { statusEnum } from '@/(server)/_features/event/schema';
import ical, {
  ICalCalendarMethod,
  ICalAttendeeType,
  ICalAttendeeData,
  ICalAttendeeStatus,
  ICalAttendeeRole,
} from 'ical-generator';

const PUBLIC_URL = process.env.NEXT_PUBLIC_PUBLIC_URL || '';

export type ICSParticipant = {
  firstName: string;
  lastName: string;
  email: string;
  clientId?: string;
  eventID?: number;
  updateCount: number;
};

type ICSEvent = {
  name: string;
  startTime: Date;
  endTime: Date;
  roomId?: string | null;
  slug: string;
  status: string;
  uuid: string;
};

type ICSHost = {
  name: string;
  email: string;
};

export function createICS(
  event: ICSEvent,
  host: ICSHost,
  category: 'webinar' | 'meeting',
  participant?: ICSParticipant,
  participants?: ICSParticipant[]
) {
  const ICS = ical();
  ICS.name(event.name);
  const roomURL = `${PUBLIC_URL}/rooms/${event.roomId}`;
  const joinRoomURL = `${PUBLIC_URL}/rooms/${event.roomId}/${
    participant ? `?clientID=${participant.clientId}` : ''
  }`;

  const summary =
    category === 'webinar'
      ? `Webinar: ${event.name}`
      : `Meeting with ${host.name}`;

  const description =
    category === 'webinar'
      ? createWebinarDesc({
          name: event.name,
          startTime: event.startTime,
          endTime: event.endTime,
          joinRoomURL,
          slug: event.slug,
          host: host.name,
        })
      : createMeetingDesc({
          startTime: event.startTime,
          endTime: event.endTime,
          joinRoomURL,
          host: host.name,
        });

  const attendees: ICalAttendeeData[] = [];

  if (participant) {
    attendees.push({
      name: participant.firstName,
      email: participant.email,
      rsvp: true,
      type: ICalAttendeeType.INDIVIDUAL,
      status: ICalAttendeeStatus.NEEDSACTION,
      role: ICalAttendeeRole.REQ,
    });
  }

  if (participants) {
    attendees.concat(
      participants?.map((participant) => {
        return {
          name: `${participant.firstName} ${participant.lastName}`,
          email: participant.email,
          rsvp: true,
          type: ICalAttendeeType.INDIVIDUAL,
          status: ICalAttendeeStatus.NEEDSACTION,
          role: ICalAttendeeRole.REQ,
        };
      })
    );
  }

  const organizer = {
    name: host.name,
    email: host.email,
  };

  switch (event.status) {
    case statusEnum.enumValues[2]:
      ICS.method(ICalCalendarMethod.CANCEL);
      break;
    default:
      ICS.method(ICalCalendarMethod.REQUEST);
      break;
  }

  const ICSEvent = ICS.createEvent({
    start: event.startTime,
    end: event.endTime,
    summary: event.name,
    id: event.uuid,
  });

  ICSEvent.organizer(organizer);

  if (attendees) {
    ICSEvent.attendees(attendees);
  }

  ICSEvent.url(joinRoomURL);
  ICSEvent.x([{ key: 'X-INLIVE-ROOM-ID', value: roomURL }]);
  ICSEvent.sequence(participant ? participant.updateCount : 0);
  ICSEvent.summary(summary);
  ICSEvent.description(description);
  ICSEvent.lastModified(new Date());

  ICS.prodId('-//inLive//inLive//EN');

  return ICS.events([ICSEvent]);
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
  startTime: Date;
  endTime: Date;
  joinRoomURL: string;
  slug: string;
  host: string;
}) {
  const { eventStartTime, eventDate } = generateDateTime(
    { start: meta.startTime, end: meta.endTime },
    'Asia/Jakarta'
  );

  return `Hi there!\\n
  Thanks for registering for our upcoming webinar!\\n
  We're excited to have you join us to learn more about\\n
  \\n
  ${meta.name}\\n
  Hosted by ${meta.host}\\n
  \\n
  ${eventDate} - ${eventStartTime}\\n
  \\n
  Don't forget to mark your calendar on that date, see you there!\\n
  \\n
  About event : ${PUBLIC_URL}/events/${meta.slug}\\n
  Join the event : ${meta.joinRoomURL}`;
}

function createMeetingDesc(meta: {
  startTime: Date;
  endTime: Date;
  joinRoomURL: string;
  host: string;
}) {
  const { eventStartTime, eventDate, eventEndTime } = generateDateTime(
    { start: meta.startTime, end: meta.endTime },
    'Asia/Jakarta'
  );
  return `
  Hi there! \\n

  ${meta.host} has scheduled a meeting with you. \\n
  ${eventDate}
  ${eventStartTime} - ${eventEndTime} \\n

  Join the meeting : ${meta.joinRoomURL} \\n
  `;
}
