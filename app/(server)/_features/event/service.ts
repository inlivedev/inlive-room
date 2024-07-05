import { eventRepo } from '@/(server)/api/_index';
import { insertEvent, selectEvent } from './schema';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { EventType } from '@/_shared/types/event';
import { DefaultICS } from '@/(server)/_shared/calendar/calendar';
import { ICalAttendeeStatus, ICalAttendeeRole } from 'ical-generator';
import { getUserByEmail } from '../user/repository';

/**
 * Type used to represent all type of participant in an event
 *
 * This means a registered participants , that joined or not and
 * guest participant
 *
 * it's used for the the event details page
 * https://www.figma.com/proto/wjeG4AE78OXVZNxjWl09yn/inlive-room?node-id=1411-4390&t=X9WZ14pNuG2M6rKG-0&page-id=214%3A591&starting-point-node-id=245%3A519
 */
export type Participant = {
  clientID: string;
  name: string;
  email?: string | null;
  isRegistered: boolean;
  isJoined: boolean;
  isAttended?: boolean;
  joinDuration?: number;
};

export interface EventParticipant {
  id: number;
  eventId: number;
  clientId: string;
  createdAt: Date;
}

export class EventService {
  ICSError = new Error('Error generating ICS');

  async createEvent(eventData: insertEvent) {
    eventData.slug = eventData.slug + '-' + generateID(8);
    const event = await eventRepo.addEvent(eventData);
    return event;
  }

  async getEventBySlugOrID(
    slugOrId: string,
    userId?: number,
    category?: string
  ) {
    let event: EventType.Event | undefined;
    const isnum = /^\d+$/.test(slugOrId);

    if (isnum) {
      event = await eventRepo.getEventById(parseInt(slugOrId), category);
    } else {
      event = await eventRepo.getEventBySlug(slugOrId, category);
    }

    if (!event) {
      return undefined;
    }

    if (event?.createdBy != userId) {
      event.roomId = '';
    }

    return event;
  }
  async getParticipantById(id: number) {
    return await eventRepo.getParticipantById(id);
  }

  async getEventHostByEventId(eventId: number) {
    return await eventRepo.getEventHostByEventId(eventId);
  }

  async getAllParticipantsByEventId(eventId: number) {
    return await eventRepo.getEventParticipantsByEventId(eventId);
  }

  async generateICS(event: selectEvent, status: ICalAttendeeStatus) {
    const eventHost = await eventRepo.getEventHostByEventId(event.id);

    if (!eventHost) {
      throw this.ICSError;
    }

    const user = await getUserByEmail(eventHost?.email);

    if (!user) {
      throw this.ICSError;
    }

    const ICS = new DefaultICS(event, {
      name: user.name,
      email: user.email,
    });

    const participants = await eventRepo.getRegisteredParticipants(
      event.slug,
      user?.id
    );

    const participantWithoutHost = participants.data.filter(
      (participant) => participant.email !== eventHost.email
    );

    ICS.addParticipants(
      participantWithoutHost.map((participant) => {
        return {
          name:
            participant.firstName && participant.lastName
              ? `${participant.firstName} ${participant.lastName}`
              : participant.email,
          email: participant.email,
          status: status,
          role: ICalAttendeeRole.REQ,
        };
      })
    );

    return ICS;
  }
}

export const eventService = new EventService();
