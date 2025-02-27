import { generateID } from '@/(server)/_shared/utils/generateid';
import { eventRepo, roomRepo, roomService } from '@/(server)/api/_index';
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
import { DB, db } from '@/(server)/_shared/database/database';
import { ServiceError } from '../_service';
import { getUserByEmail } from '../user/repository';
import EmailScheduledMeetingCancelled from 'emails/event/EventScheduleMeetingCancelled';
import { selectUser } from '../user/schema';

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

    if (emails && emails.length > 0) {
      for (const email of emails) {
        ICS.addAttendee({
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
      .setLink(joinRoomURL)
      .setLocation(joinRoomURL)
      .setSummary(summary);

    const emailTemplate = await render(
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

  async cancelScheduledMeeting(
    slugOrID: string,
    user: selectUser
  ): Promise<EventDetails | undefined> {
    return await db.transaction(async (trx) => {
      const existingEvent = await eventRepo.getBySlugOrID(
        slugOrID,
        undefined,
        trx
      );

      if (!existingEvent) {
        throw new ServiceError('ScheduledMeeting', 'Event not found', 404);
      }

      if (existingEvent.createdBy != user.id) {
        throw new ServiceError('ScheduledMeeting', 'Event not found', 404);
      }

      if (existingEvent.category.name != 'meetings') {
        throw new ServiceError('ScheduledMeeting', 'Event not found', 404);
      }

      if (existingEvent.roomId) {
        await roomRepo.removeRoom(existingEvent.roomId, user.id);
      }

      const hostUser = await eventRepo.getEventHostByEventId(existingEvent.id);

      existingEvent.status = 'cancelled';
      existingEvent.roomId = null;
      const updatedEvent = await eventRepo.updateEvent(
        user.id,
        existingEvent.id,
        existingEvent,
        trx
      );

      if (!updatedEvent) {
        throw new ServiceError('ScheduledMeeting', 'Event not found', 404);
      }

      const participants = await eventRepo.getRegisteredParticipants(
        existingEvent.id.toString(),
        undefined,
        trx
      );

      const ICS = new DefaultICS(updatedEvent, { ...user });
      ICS.setDescription({
        plain: generateCancelledMeetingDesc(updatedEvent),
      });
      ICS.setSummary(`${updatedEvent.name}`);
      ICS.setStatus(ICalEventStatus.CANCELLED);
      ICS.setMethod(ICalCalendarMethod.CANCEL);
      // Send cancellation email to participants
      participants.data.forEach(async (participant) => {
        ICS.setSequence(participant.updateCount);

        const emailCancelledTemplate = await render(
          EmailScheduledMeetingCancelled({
            event: { ...updatedEvent, roomID: updatedEvent.roomId! },
            host: {
              name: hostUser ? hostUser.name : '',
            },
          })
        );

        sendEmail(
          { html: emailCancelledTemplate },
          {
            destination: participant.user.email,
            keyValues: undefined,
            inlineAttachment: {
              data: Buffer.from(ICS.icalCalendar.toString(), 'utf-8'),
              filename: 'invite.ics',
              contentType:
                'application/ics; charset=utf-8; method=CANCEL; name=invite.ics',
              contentDisposition: 'inline; filename=invite.ics',
              contentTransferEncoding: 'base64',
            },
            subject: `Meeting invitation has cancelled : ${updatedEvent.name}`,
          }
        );
      });

      return updatedEvent;
    });
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
        .setLink(joinRoomURL)
        .setLocation(joinRoomURL)
        .setSummary(summary);

      // Send Email Function
      const emailTemplate = await render(
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

      const oldEvent = await eventRepo.getBySlugOrID(
        slugOrId,
        category.name,
        tx
      );

      if (!oldEvent) {
        throw new ServiceError('ScheduledMeeting', 'Event not found', 404);
      }

      if (oldEvent.category.name != 'meetings') {
        throw new ServiceError('ScheduledMeeting', 'invalid request', 400);
      }

      if (oldEvent.createdBy != host.userID) {
        throw new ServiceError('ScheduleMeeting', 'Event not found', 404);
      }

      const hostUser = await getUserByEmail(host.email);

      if (!hostUser) {
        throw new ServiceError('ScheduleMeeting', 'Host not found', 404);
      }

      // Don't forget to push the host into the email list
      emails.push(hostUser.email);

      // Update Event Data
      const updatedEvent = await eventRepo.updateEvent(
        host.userID,
        oldEvent.id,
        {
          categoryID: oldEvent.categoryID,
          endTime: newEvent.endTime,
          startTime: newEvent.startTime,
          name: newEvent.title,
          slug: oldEvent.slug,
        }
      );

      if (!updatedEvent) {
        throw new ServiceError(
          'ScheduledMeeting',
          'No Scheduled Meeting to be updated',
          404
        );
      }

      const { ICS } = generateICSTemplate(updatedEvent, host);

      const { removedParticipants, existingParticipants, newParticipants } =
        await processParticipants(updatedEvent, emails, tx);

      const addAttendees = (
        participants: EventParticipant[],
        status: ICalAttendeeStatus
      ) => {
        participants.forEach((val) => {
          ICS.addAttendee({
            name: val.user.name,
            email: val.user.email,
            rsvp: true,
            status: status,
            role: ICalAttendeeRole.REQ,
          });
        });
      };

      const invitedParticipants = existingParticipants.concat(newParticipants);
      addAttendees(invitedParticipants, ICalAttendeeStatus.NEEDSACTION);
      addAttendees(removedParticipants, ICalAttendeeStatus.DECLINED);

      const emailInviteTemplate = await render(
        EmailScheduledMeeting({
          event: {
            endTime: oldEvent.endTime,
            name: oldEvent.name,
            roomID: oldEvent.roomId!,
            slug: oldEvent.slug,
            startTime: oldEvent.startTime,
          },
          host: {
            name: hostUser.name,
          },
        })
      );

      const emailCancelledTemplate = await render(
        EmailScheduledMeetingCancelled({
          event: { ...updatedEvent, roomID: updatedEvent.roomId! },
          host: {
            name: hostUser.name,
          },
        })
      );

      // Send Invite Email
      newParticipants.forEach(async (val) => {
        await sendMeetingEmail({
          template: emailInviteTemplate,
          participantDest: val,
          ICS: ICS,
          event: oldEvent,
          subject: `Meeting invitation : ${oldEvent.name}`,
        });
      });

      // Send Updated Email
      existingParticipants.forEach(async (val) => {
        await sendMeetingEmail({
          template: emailInviteTemplate,
          participantDest: val,
          ICS: ICS,
          event: oldEvent,
          subject: `Meeting invitation : ${oldEvent.name}`,
        });
      });

      // Send Cancelled Email
      const cancelledEventICS = ICS.createCopy();
      cancelledEventICS.setStatus(ICalEventStatus.CANCELLED);
      cancelledEventICS.setMethod(ICalCalendarMethod.CANCEL);
      cancelledEventICS.setDescription({
        plain: generateCancelledMeetingDesc(oldEvent),
      });
      cancelledEventICS.setSummary(`${oldEvent.name}`);

      removedParticipants.forEach(async (val) => {
        await sendMeetingEmail({
          template: emailCancelledTemplate,
          participantDest: val,
          ICS: cancelledEventICS,
          event: oldEvent,
          subject: `Meeting invitation has cancelled: ${oldEvent.name}`,
        });
      });

      return {
        event: {
          ...oldEvent,
          category: category,
          host: hostUser,
        },
        participants: invitedParticipants,
      };
    });
  }
}

async function sendMeetingEmail(data: {
  template: string;
  participantDest: EventParticipant;
  ICS: DefaultICS;
  event: selectEvent;
  subject: string;
}) {
  const res = await sendEmail(
    {
      html: data.template,
    },
    {
      destination: data.participantDest.user.email,
      inlineAttachment: {
        data: Buffer.from(data.ICS.icalCalendar.toString(), 'utf-8'),
        filename: 'invite.ics',
        contentType:
          'application/ics; charset=utf-8; method=REQUEST; name=invite.ics',
        contentDisposition: 'inline; filename=invite.ics',
        contentTransferEncoding: 'base64',
      },
      subject: `Meeting invitation : ${data.event.name}`,
    }
  );

  if (res && res.status >= 400) {
    Sentry.captureEvent({
      message: 'failed send scheduled meeting email',
      level: 'info',
      extra: {
        name: data.participantDest.user.name,
        email: data.participantDest.user.email,
        event,
        res,
      },
    });
  }
}

async function processParticipants(
  event: selectEvent,
  emails: string[],
  tx: DB
) {
  const oldParticipants = await eventRepo.getRegisteredParticipants(
    event.slug,
    undefined,
    tx
  );

  const existingParticipants = oldParticipants.data.filter((p) =>
    emails.includes(p.user.email)
  );
  const removedParticipants = oldParticipants.data.filter(
    (p) => !emails.includes(p.user.email)
  );
  const newEmails = emails.filter(
    (email) => !oldParticipants.data.some((p) => p.user.email === email)
  );

  await eventRepo.updateParticipantCount(event.id);
  await eventRepo.removeParticipant(
    event.id,
    removedParticipants.map((p) => p.user.email)
  );

  const newParticipants = (
    await Promise.all(
      newEmails.map((email) =>
        eventService.registerParticipant(email, event.id, 'viewer')
      )
    )
  ).filter(
    // Make sure there's no undefined participant
    (participant): participant is EventParticipant => participant !== undefined
  );

  return {
    existingParticipants,
    newParticipants,
    removedParticipants,
  };
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

function generateCancelledMeetingDesc(oldEvent: selectEvent): string {
  const { eventDate, eventStartTime, eventEndTime } = generateDateTime(
    { start: oldEvent.startTime, end: oldEvent.endTime },
    'Asia/Jakarta'
  );
  return `Hi there,
  
  Unfortunately, your previous event "${oldEvent.name}" has been cancelled.
  
  What: ${oldEvent.name}
  
  When: ${eventDate} 
  ${eventStartTime} - ${eventEndTime}
  
  We apologize for any inconvenience caused.`;
}

export const scheduledMeetingService = new ScheduledMeetingService();

function generateICSTemplate(
  event: selectEvent,
  host: { userID: number; name: string; email: string }
) {
  const ICS = new DefaultICS(event, host);
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

  ICS.setDescription({ plain: description });
  ICS.setSummary(summary);
  ICS.setLocation(joinRoomURL);
  ICS.setLink(joinRoomURL);

  return { ICS, joinRoomURL };
}
