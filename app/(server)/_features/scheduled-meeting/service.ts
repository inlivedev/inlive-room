import { generateID } from '@/(server)/_shared/utils/generateid';
import { eventRepo, roomService } from '@/(server)/api/_index';
import {
  insertParticipant,
  selectEvent,
  selectParticipant,
} from '../event/schema';
import { DefaultICS } from '@/(server)/_shared/calendar/calendar';
import { ICalAttendeeRole, ICalAttendeeStatus } from 'ical-generator';
import { sendEmail } from '@/(server)/_shared/mailer/mailer';
import { render } from '@react-email/components';
import EmailScheduledMeeting from 'emails/event/EventScheduleMeeting';
import * as Sentry from '@sentry/node';
import { generateDateTime } from '@/(server)/_shared/utils/generate-date-time';

const BASE_URL = process.env.NEXT_PUBLIC_APP_ORIGIN;

class ScheduledMeetingService {
  //
  async createScheduledMeeting(
    data: {
      title: string;
      startTime: Date;
      endTime: Date;
      emails: string[];
      createdBy: number;
      description?: string;
      maximumSlots?: number;
    },
    host: {
      userID: number;
      name: string;
      email: string;
    },
    emails: string[]
  ) {
    const category = await eventRepo.getCategoryByName('meetings');

    if (!category) {
      return undefined;
    }

    const room = await roomService.createRoom(host.userID, 'meeting');

    const event = await eventRepo.addEvent({
      name: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      categoryID: category?.id,
      createdBy: data.createdBy,
      slug: generateID(12),
      roomId: room.id,
      status: 'published',
    });

    const hostParticipant = await eventRepo.registerParticipant({
      clientId: generateID(12),
      email: host.email,
      eventID: event.id,
      firstName: host.name,
      lastName: '',
    });

    if (!event) {
      return;
    }

    const ICS = new DefaultICS(event, host);
    const replyEmails = new Array<string>();
    replyEmails.push(host.email);
    const emailCustomValue: {
      [key: string]: string;
    } = {};

    for (const email of emails) {
      ICS.addParticipant({
        name: email,
        email: email,
        rsvp: true,
        status: ICalAttendeeStatus.NEEDSACTION,
        role: ICalAttendeeRole.REQ,
      });

      replyEmails.push(email);
    }

    emailCustomValue['h:Reply-To'] = replyEmails.join(', ');

    await this.inviteParticipants(
      event,
      emails.map((email) => {
        return {
          name: '',
          email: email,
        };
      }),
      host,
      ICS
    );

    // Send Email to Host
    const joinRoomURL = `${BASE_URL}/rooms/${event.roomId}?clientID=${hostParticipant.clientId}`;

    const description = generateScheduledMeetingDescription({
      startTime: event.startTime,
      endTime: event.endTime,
      joinRoomURL: joinRoomURL,
      host: host.name,
      event: event,
    });

    const summary = generateScheduledMeetingSummary({
      startTime: event.startTime,
      endTime: event.endTime,
      joinRoomURL: joinRoomURL,
      host: host.name,
      event: event,
    });

    ICS.addDescription(description)
      .addLink(joinRoomURL)
      .addLocation(joinRoomURL)
      .addSummary(summary);

    const emailTemplate = render(
      EmailScheduledMeeting({
        event: {
          endTime: event.endTime,
          name: event.name,
          roomID: event.roomId!,
          slug: event.slug,
          startTime: event.startTime,
        },
        host: {
          name: host.name,
        },
        participant: {
          clientId: hostParticipant.clientId,
        },
      })
    );

    const res = await sendEmail(
      {
        html: emailTemplate,
      },
      {
        destination: hostParticipant.email,
        inlineAttachment: {
          data: Buffer.from(ICS.icalCalendar.toString(), 'utf-8'),
          filename: 'invite.ics',
          contentType:
            'application/ics; charset=utf-8; method=REQUEST; name=invite.ics',
          contentDisposition: 'inline; filename=invite.ics',
          contentTransferEncoding: 'base64',
        },
        subject: `Meeting invitation : ${event.name}`,
      }
    );

    if (res && res.status >= 400) {
      Sentry.captureEvent({
        message: 'failed send scheduled meeting email',
        level: 'info',
        extra: {
          name: hostParticipant.firstName,
          email: hostParticipant.email,
          event,
          res,
        },
      });

      return;
    }

    Sentry.captureEvent({
      message: 'Succes send scheduled meeting email',
      level: 'info',
      extra: {
        name: hostParticipant.firstName,
        email: hostParticipant.email,
        event,
        res,
      },
    });

    return event;
  }

  async inviteParticipants(
    event: selectEvent,
    participants: {
      name: string;
      email: string;
    }[],
    host: {
      name: string;
      email: string;
    },
    ICS: DefaultICS
  ) {
    if (!event.roomId) {
      return;
    }

    const listParticipant: selectParticipant[] = [];
    const replyEmails = new Array<string>();
    replyEmails.push(host.email);
    const emailCustomValue: { [key: string]: string } = {};

    for (const participant of participants) {
      const newParticipant: insertParticipant = {
        firstName: '',
        lastName: '',
        email: participant.email,
        description: '',
        clientId: generateID(12),
        eventID: event.id,
        isInvited: true,
      };
      listParticipant.push(await eventRepo.registerParticipant(newParticipant));
      replyEmails.push(participant.email);
    }

    emailCustomValue['h:Reply-To'] = replyEmails.join(', ');

    // send email to participants
    for (const participant of listParticipant) {
      // create deep copy of ics
      const participantICS = ICS.createCopy();
      const joinRoomURL = `${BASE_URL}/rooms/${event.roomId}?clientID=${participant.clientId}`;

      const description = generateScheduledMeetingDescription({
        startTime: event.startTime,
        endTime: event.endTime,
        joinRoomURL: joinRoomURL,
        host: host.name,
        event: event,
      });

      const summary = generateScheduledMeetingSummary({
        startTime: event.startTime,
        endTime: event.endTime,
        joinRoomURL: joinRoomURL,
        host: host.name,
        event: event,
      });

      participantICS
        .addDescription(description)
        .addLink(joinRoomURL)
        .addLocation(joinRoomURL)
        .addSummary(summary);

      // Send Email Function
      const emailTemplate = render(
        EmailScheduledMeeting({
          event: {
            endTime: event.endTime,
            name: event.name,
            roomID: event.roomId,
            slug: event.slug,
            startTime: event.startTime,
          },
          host: {
            name: host.name,
          },
          participant: {
            clientId: participant.clientId,
          },
        })
      );

      const res = await sendEmail(
        {
          html: emailTemplate,
        },
        {
          destination: participant.email,
          inlineAttachment: {
            data: Buffer.from(participantICS.icalCalendar.toString(), 'utf-8'),
            filename: 'invite.ics',
            contentType:
              'application/ics; charset=utf-8; method=REQUEST; name=invite.ics',
            contentDisposition: 'inline; filename=invite.ics',
            contentTransferEncoding: 'base64',
          },
          keyValues: emailCustomValue,
          subject: `Meeting invitation : ${event.name}`,
        }
      );

      if (res && res.status >= 400) {
        Sentry.captureEvent({
          message: 'failed send scheduled meeting email',
          level: 'info',
          extra: {
            name: participant.firstName,
            email: participant.email,
            event,
            res,
          },
        });

        return;
      }

      Sentry.captureEvent({
        message: 'Succes send scheduled meeting email',
        level: 'info',
        extra: {
          name: participant.firstName,
          email: participant.email,
          event,
          res,
        },
      });
    }
  }
}

function generateScheduledMeetingSummary(meta: {
  startTime: Date;
  endTime: Date;
  joinRoomURL: string;
  host: string;
  event: selectEvent;
}) {
  return `
  ${meta.event.name}`;
}

function generateScheduledMeetingDescription(meta: {
  startTime: Date;
  endTime: Date;
  joinRoomURL: string;
  host: string;
  event: selectEvent;
}) {
  const { eventStartTime, eventDate, eventEndTime } = generateDateTime(
    { start: meta.startTime, end: meta.endTime },
    'Asia/Jakarta'
  );
  return `Hi There!

${meta.host} has invited you to a meeting

What:
${meta.event.name}

When:
${eventDate}
${eventStartTime} - ${eventEndTime}

Where:
Join in here  ${meta.joinRoomURL}
`;
}

export const scheduledMeetingService = new ScheduledMeetingService();
