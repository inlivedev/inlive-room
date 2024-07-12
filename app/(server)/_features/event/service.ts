import { eventRepo } from '@/(server)/api/_index';
import {
  insertEvent,
  insertParticipant,
  selectEvent,
  selectRole,
} from './schema';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { DefaultICS } from '@/(server)/_shared/calendar/calendar';
import { ICalAttendeeStatus, ICalAttendeeRole } from 'ical-generator';
import { addUser, getUserByEmail, getUserById } from '../user/repository';
import { User, selectUser } from '../user/schema';
import { db } from '@/(server)/_shared/database/database';
import { ServiceError } from '../_service';

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

export interface EventDetails extends selectEvent {
  host?: selectUser;
  availableSlots?: number;
}

export class EventService {
  ICSError = new Error('Error generating ICS');

  async createEvent(eventData: insertEvent) {
    eventData.slug = eventData.slug + '-' + generateID(8);
    const event = await eventRepo.addEvent(eventData);
    return event;
  }

  async getParticipantByID(
    id: number,
    eventSlugOrID: string
  ): Promise<EventParticipant | undefined> {
    const data = await db.transaction(async (tx) => {
      const user = await getUserById(id, tx);

      if (!user) {
        return;
      }

      const event = await eventRepo.getBySlugOrID(eventSlugOrID, undefined, tx);

      if (!event) {
        return;
      }

      const participant = await eventRepo.getParticipant(
        user?.id,
        event?.id,
        tx
      );

      if (!participant) {
        return;
      }

      const role = await eventRepo.getRoleByID(participant.roleID, tx);

      if (!role) {
        return;
      }

      return {
        user: user,
        ...participant,
        role: role,
      };
    });

    return data;
  }

  async getEventBySlugOrID(
    slugOrID: string,
    category?: string
  ): Promise<EventDetails | undefined> {
    const data = await db.transaction(async (tx) => {
      const event = await eventRepo.getBySlugOrID(slugOrID, category, tx);

      if (!event) {
        return;
      }

      const host = await eventRepo.getEventHostByEventId(event.id, tx);

      const countRegisteree = await eventRepo.countRegistiree(event?.id, tx);

      return {
        event,
        host,
        countRegisteree,
      };
    });

    if (!data) {
      return;
    }

    let availableSlots: number | undefined = undefined;
    if (data.event.maximumSlots) {
      availableSlots = data.event.maximumSlots - data.countRegisteree;
    }
    return {
      ...data.event,
      host: data.host,
      availableSlots: availableSlots,
    };
  }

  async getParticipantByEmail(
    email: string,
    eventSlugOrID: string
  ): Promise<EventParticipant | undefined> {
    const data = await db.transaction(async (tx) => {
      const user = await getUserByEmail(email, tx);

      if (!user) {
        return;
      }

      const event = await eventRepo.getBySlugOrID(eventSlugOrID, undefined, tx);

      if (!event) {
        return;
      }

      const participant = await eventRepo.getParticipant(
        user?.id,
        event?.id,
        tx
      );

      if (!participant) {
        return;
      }

      const role = await eventRepo.getRoleByID(participant?.roleID, tx);

      if (!role) {
        return;
      }

      return {
        user: user,
        ...participant,
        role: role,
      };
    });

    return data;
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

    const res = await db.transaction(async (tx) => {
      user = await getUserByEmail(email, tx);

      if (!user) {
        [user] = await addUser({
          email: email,
          name: email,
          isRegistered: false,
        });
      }

      if (!user) {
        throw new ServiceError('EventError', 'Failed to register user', 500);
      }

      const roleData = await eventRepo.getRoleByName(role, tx);

      const participantData = await eventRepo.insertParticipant(
        user.id,
        eventID,
        {
          clientID: generateID(12),
          roleID: roleData?.id || 1,
          ...options,
        },
        tx
      );

      return {
        user,
        roleData,
        participantData,
      };
    });

    return {
      user: res.user,
      eventID: eventID,
      clientID: res.participantData.clientID,
      createdAt: res.participantData.createdAt,
      isInvited: res.participantData.isInvited,
      updateCount: res.participantData.updateCount,
      role: res.roleData!,
    };
  }
}

export const eventService = new EventService();
