import { eventRepo } from '@/(server)/api/_index';
import {
  insertEvent,
  insertParticipant,
  selectEvent,
  selectRole,
} from './schema';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { EventType } from '@/_shared/types/event';
import { DefaultICS } from '@/(server)/_shared/calendar/calendar';
import { ICalAttendeeStatus, ICalAttendeeRole } from 'ical-generator';
import { addUser, getUserByEmail } from '../user/repository';
import { User, selectUser } from '../user/schema';

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
  user: User;
  eventID: number;
  clientID: string;
  createdAt: Date;
  role: selectRole;
  isInvited: boolean;
  updateCount: number;
}

export class EventError extends Error {
  errorCode: number;

  constructor(message: string, errorCode: number) {
    super(message); // Pass the message to the base Error class
    this.name = 'ServiceError';
    this.errorCode = errorCode; // HTTP status code
  }
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
          name: participant.name ? participant.name : participant.email,
          email: participant.email,
          status: status,
          role: ICalAttendeeRole.REQ,
        };
      })
    );

    return ICS;
  }

  async registerParticipant(
    email: string,
    eventID: number,
    role: string,
    options?: Pick<insertParticipant, 'isInvited'>
  ): Promise<EventParticipant> {
    let user: selectUser | undefined;

    user = await getUserByEmail(email);

    if (!user) {
      [user] = await addUser({
        email: email,
        name: email,
        isRegistered: false,
      });
    }

    if (!user) {
      throw new EventError('Failed to register user', 500);
    }

    const roleData = await eventRepo.getRoleByName(role);

    const participantData = await eventRepo.insertParticipant(
      user.id,
      eventID,
      {
        clientID: generateID(12),
        roleID: roleData?.id || 1,
        ...options,
      }
    );

    return {
      user: user,
      eventID: eventID,
      clientID: participantData.clientID,
      createdAt: participantData.createdAt,
      isInvited: participantData.isInvited,
      updateCount: participantData.updateCount,
      role: participantData.role!,
    };
  }
}

export const eventService = new EventService();
