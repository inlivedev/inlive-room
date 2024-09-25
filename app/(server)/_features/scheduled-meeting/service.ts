import { generateID } from '@/(server)/_shared/utils/generateid';
import { eventRepo, roomService } from '@/(server)/api/_index';
import { selectEvent } from '../event/schema';
import { DefaultICS } from '@/(server)/_shared/calendar/calendar';
import {
  ICalAttendeeRole,
  ICalAttendeeStatus,
  ICalCalendarMethod,
  ICalEventStatus,
} from 'ical-generator';
import { sendEmail } from '@/(server)/_shared/mailer/mailer';
import { render } from '@react-email/components';
import EmailScheduledMeeting from 'emails/event/EventScheduleMeeting';
import * as Sentry from '@sentry/node';
import { generateDateTime } from '@/(server)/_shared/utils/generate-date-time';
import { EventDetails, EventParticipant, eventService } from '../event/service';
import { defaultLogger } from '@/(server)/_shared/logger/logger';
import * as z from 'zod';
import { db } from '@/(server)/_shared/database/database';
import { ServiceError } from '../_service';
import EmailScheduledMeetingCancelled from 'emails/event/EventScheduleMeetingCancelled';
import { getUserById } from '../user/repository';

const BASE_URL = process.env.NEXT_PUBLIC_APP_ORIGIN;

class ScheduledMeetingService {
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
    emails?: string[]
  ): Promise<
    | {
        event: EventDetails;
        participants: EventParticipant[] | undefined;
      }
    | undefined
  > {
    let invitedParticipants: EventParticipant[] | undefined = [];

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

    if (emails) {
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

      invitedParticipants = await this.inviteParticipants(
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
    }

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

    return {
      event: { ...event, host: hostParticipant.user, category: category },
      participants: invitedParticipants,
    };
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
  ): Promise<EventParticipant[] | undefined> {
    if (!event.roomId) {
      return undefined;
    }

    const listParticipant: EventParticipant[] = [];
    const replyEmails = new Array<string>();
    replyEmails.push(host.email);
    const emailCustomValue: { [key: string]: string } = {};

    for (const participant of participants) {
      const res = await eventService.registerParticipant(
        participant.email,
        event.id,
        'viewer'
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
    return listParticipant;
  }

  async updateScheduledMeeting(
    newEvent: {
      id: number;
      slug: string;
      title: string;
      startTime: Date;
      endTime: Date;
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
  ): Promise<
    | {
        event: EventDetails;
        participants: EventParticipant[] | undefined;
      }
    | undefined
  > {
    if (!(newEvent.id || newEvent.slug)) {
      throw new ServiceError('ScheduledMeeting', 'Slug or ID is required', 400);
    }

    return db.transaction(async (tx) => {
      const category = await eventRepo.getCategoryByName('meetings', tx);

      if (!category) {
        throw new ServiceError(
          'ScheduledMeeting',
          'Meeting category not found',
          404
        );
      }

      const slugOrId = newEvent.id?.toString() || newEvent.slug;
      if (!slugOrId) {
        throw new ServiceError('ScheduledMeeting', 'Invalid slug or ID', 400);
      }

      const event = await eventRepo.getBySlugOrID(slugOrId, undefined, tx);

      if (!event) {
        throw new ServiceError('ScheduledMeeting', 'Event not found', 404);
      }

      if (event.createdBy != host.userID) {
        throw new ServiceError('ScheduleMeeting', 'Event not found', 404);
      }

      // Update Event Data
      const updatedEvent = await eventRepo.updateEvent(host.userID, event.id, {
        categoryID: event.categoryID,
        endTime: newEvent.endTime,
        startTime: newEvent.startTime,
        name: newEvent.title,
        slug: event.slug,
      });

      if (!updatedEvent) {
        throw new ServiceError(
          'ScheduledMeeting',
          'No Scheduled Meeting to be updated',
          404
        );
      }

      const ICS = new DefaultICS(updatedEvent, host);
      const joinRoomURL = `${BASE_URL}/rooms/${updatedEvent.roomId}`;

      const description = generateScheduledMeetingDescription({
        startTime: updatedEvent.startTime,
        endTime: updatedEvent.endTime,
        joinRoomURL: joinRoomURL,
        host: host.name,
        event: updatedEvent,
      });

      const summary = generateScheduledMeetingSummary({
        startTime: updatedEvent.startTime,
        endTime: updatedEvent.endTime,
        joinRoomURL: joinRoomURL,
        host: host.name,
        event: updatedEvent,
      });

      ICS.addDescription(description)
        .addLink(joinRoomURL)
        .addLocation(joinRoomURL)
        .addSummary(summary);

      emails.push(host.email);

      const oldParticipants = await eventRepo.getRegisteredParticipants(
        updatedEvent.slug,
        undefined,
        tx
      );

      const removedParticipantEmails = oldParticipants.data
        .filter((participant) => !emails.includes(participant.user.email))
        .map((participant) => participant.user.email);

      const newEmails = emails.filter(
        (email) =>
          !oldParticipants.data.some(
            (participant) => participant.user.email === email
          )
      );

      const existingParticipants = oldParticipants.data
        .filter((participant) => emails.includes(participant.user.email))
        .map((participant) => participant);

      // Update existing participants
      await eventRepo.updateParticipantCount(updatedEvent.id);

      const newParticipants: EventParticipant[] = [];

      // Add new participants
      newEmails.forEach(async (val) => {
        const registeredParticipant = await eventService.registerParticipant(
          val,
          updatedEvent.id,
          'viewer'
        );

        if (registeredParticipant) {
          newParticipants.push(registeredParticipant);
        }
      });

      // Remove participants not in the new list
      if (removedParticipantEmails) {
        const removedParticipants = await eventRepo.removeParticipant(
          updatedEvent.id,
          removedParticipantEmails
        );
        removedParticipants.forEach(async (val) => {
          const cancelledICS = ICS.createCopy();
          cancelledICS.setSequence(val.updateCount);
          cancelledICS.setStatus(ICalEventStatus.CANCELLED);
          cancelledICS.setMethod(ICalCalendarMethod.CANCEL);
          // send cancelled email
          const cancelledEmailTemplate = render(
            EmailScheduledMeetingCancelled({
              event: {
                endTime: updatedEvent.endTime,
                name: updatedEvent.name,
                roomID: updatedEvent.roomId!,
                slug: updatedEvent.slug,
                startTime: updatedEvent.startTime,
              },
              host: {
                name: host.name,
              },
            })
          );

          const res = await sendEmail(
            {
              html: cancelledEmailTemplate,
            },
            {
              destination: val.user.email,
              inlineAttachment: {
                data: Buffer.from(
                  cancelledICS.icalCalendar.toString(),
                  'utf-8'
                ),
                filename: 'invite.ics',
                contentType:
                  'application/ics; charset=utf-8; method=REQUEST; name=invite.ics',
                contentDisposition: 'inline; filename=invite.ics',
                contentTransferEncoding: 'base64',
              },
              subject: `Meeting invitation has cancelled : ${updatedEvent.name}`,
            }
          );

          if (res && res.status >= 400) {
            Sentry.captureEvent({
              message: 'failed send scheduled meeting email',
              level: 'info',
              extra: {
                name: val.user.name,
                email: val.user.email,
                event,
                res,
              },
            });
          }
        });
      }

      // Send Invited Email
      const invitedParticipants: EventParticipant[] = [
        ...existingParticipants,
        ...newParticipants,
      ];

      invitedParticipants.forEach(async (val) => {
        ICS.setSequence(val.updateCount);
        ICS.setStatus(ICalEventStatus.TENTATIVE);
        ICS.setMethod(ICalCalendarMethod.REQUEST);
        const inviteTemplate = render(
          EmailScheduledMeeting({
            event: {
              endTime: updatedEvent.endTime,
              name: updatedEvent.name,
              roomID: updatedEvent.roomId!,
              slug: updatedEvent.slug,
              startTime: updatedEvent.startTime,
            },
            host: {
              name: host.name,
            },
          })
        );

        const res = await sendEmail(
          {
            html: inviteTemplate,
          },
          {
            destination: val.user.email,
            inlineAttachment: {
              data: Buffer.from(ICS.icalCalendar.toString(), 'utf-8'),
              filename: 'invite.ics',
              contentType:
                'application/ics; charset=utf-8; method=REQUEST; name=invite.ics',
              contentDisposition: 'inline; filename=invite.ics',
              contentTransferEncoding: 'base64',
            },
            subject: `Meeting invitation has updated : ${updatedEvent.name}`,
          }
        );

        if (res && res.status >= 400) {
          Sentry.captureEvent({
            message: 'failed send scheduled meeting email',
            level: 'info',
            extra: {
              name: val.user.name,
              email: val.user.email,
              event,
              res,
            },
          });
        }
      });

      const hostUser = await getUserById(event.createdBy);

      return {
        event: {
          ...event,
          category: category,
          host: hostUser,
        },
        participants: invitedParticipants,
      };
    });
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
