import { selectEvent } from '@/(server)/_features/event/schema';
import ical, {
  ICalAttendeeData,
  ICalAttendeeRole,
  ICalAttendeeStatus,
  ICalCalendar,
  ICalCalendarMethod,
  ICalEventStatus,
} from 'ical-generator';

export class DefaultICS {
  icalCalendar: ICalCalendar;
  event: selectEvent;
  host: { email: string; name: string };
  constructor(
    event: selectEvent,
    host: {
      name: string;
      email: string;
    }
  ) {
    this.host = host;
    this.event = event;
    this.icalCalendar = ical({
      method:
        event.status === 'cancelled'
          ? ICalCalendarMethod.CANCEL
          : ICalCalendarMethod.REQUEST,
      prodId: '//room-inlive.app//EN',
    });

    this.icalCalendar.createEvent({
      start: event.startTime,
      end: event.endTime,
      id: event.uuid,
      organizer: {
        name: 'inLive Room',
        email: 'room-scheduler@inlive.app',
      },
      attendees: [
        {
          email: host.email,
          name: host.name,
          role: ICalAttendeeRole.CHAIR,
          status: ICalAttendeeStatus.ACCEPTED,
        },
      ],
    });
  }

  addDescription(description: string, html?: string) {
    this.icalCalendar.events()[0].description({
      plain: description,
      html: html,
    });

    return this;
  }

  addLink(link: string) {
    this.icalCalendar.events()[0].url(link);

    return this;
  }

  addLocation(location: string) {
    this.icalCalendar.events()[0].location(location);

    return this;
  }

  addSummary(summary: string) {
    this.icalCalendar.events()[0].summary(summary);

    return this;
  }

  addParticipant(participants: ICalAttendeeData) {
    this.icalCalendar.events()[0].attendees([participants]);

    return this;
  }

  addParticipants(participants: ICalAttendeeData[]) {
    this.icalCalendar.events()[0].attendees(participants);

    return this;
  }

  setSequence(sequence: number) {
    this.icalCalendar.events()[0].sequence(sequence);

    return this;
  }

  setStatus(status: ICalEventStatus) {
    this.icalCalendar.events()[0].status(status);

    return this;
  }

  createCopy() {
    const copy = new DefaultICS(this.event, this.host);
    copy.event = this.event;
    copy.host = this.host;
    copy.icalCalendar = this.icalCalendar;

    return copy;
  }
}
