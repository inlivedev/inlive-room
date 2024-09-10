import { generateID } from '@/(server)/_shared/utils/generateid';
import { eventRepo, roomService } from '@/(server)/api/_index';
import { selectEvent } from '../event/schema';
import { DefaultICS } from '@/(server)/_shared/calendar/calendar';
import { ICalAttendeeRole, ICalAttendeeStatus } from 'ical-generator';
import { sendEmail } from '@/(server)/_shared/mailer/mailer';
import { render } from '@react-email/components';
import EmailScheduledMeeting from 'emails/event/EventScheduleMeeting';
import * as Sentry from '@sentry/node';
import { generateDateTime } from '@/(server)/_shared/utils/generate-date-time';
import { EventParticipant, eventService } from '../event/service';
import { defaultLogger } from '@/(server)/_shared/logger/logger';

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

    const hostParticipant = await eventService.registerParticipant(
      host.email,
      event.id,
      'host'
    );

    if (!hostParticipant) {
      throw new Error('Failed to register host participant');
    }

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
    const joinRoomURL = `${BASE_URL}/rooms/${event.roomId}`;

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
      })
    );

    const res = await sendEmail(
      {
        html: emailTemplate,
      },
      {
        destination: hostParticipant.user.email,
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
          name: hostParticipant.user.name,
          email: hostParticipant.user.email,
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
        name: hostParticipant.user.name,
        email: hostParticipant.user.email,
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

    const listParticipant: EventParticipant[] = [];
    const replyEmails = new Array<string>();
    replyEmails.push(host.email);
    const emailCustomValue: { [key: string]: string } = {};

    for (const participant of participants) {
      const res = await eventService.registerParticipant(
        participant.email,
        event.id,
        'participant'
      );

      if (!res) {
        defaultLogger.captureException(
          new Error('Failed to register participant')
        );
        continue;
      }

      listParticipant.push(res);
      replyEmails.push(participant.email);
    }

    emailCustomValue['h:Reply-To'] = replyEmails.join(', ');

    // send email to participants
    for (const participant of listParticipant) {
      // create deep copy of ics
      const participantICS = ICS.createCopy();
      const joinRoomURL = `${BASE_URL}/rooms/${event.roomId}?clientID=${participant.clientID}`;

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
        })
      );

      const res = await sendEmail(
        {
          html: emailTemplate,
        },
        {
          destination: participant.user.email,
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
            name: participant.user.name,
            email: participant.user.email,
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
          name: participant.user.name,
          email: participant.user.email,
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
