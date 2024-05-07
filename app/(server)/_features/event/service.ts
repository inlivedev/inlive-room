import { eventRepo, iEventService } from '@/(server)/api/_index';
import {
  insertEvent,
  insertParticipant,
  selectEvent,
  selectParticipant,
} from './schema';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { selectUser } from '../user/schema';
import {
  SendEventCancelledEmail,
  SendEventManualInvitationEmail,
  SendEventRescheduledEmail,
  SendScheduledMeetinEmail,
} from '@/(server)/_shared/mailer/mailer';
import { PageMeta } from '@/_shared/types/types';
import { EventType } from '@/_shared/types/event';

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

export interface iEventRepo {
  addEvent(eventData: insertEvent): Promise<selectEvent>;
  getEventById(id: number): Promise<EventType.Event | undefined>;
  getEventBySlug(slug: string): Promise<EventType.Event | undefined>;
  getEventParticipantsByEventId(
    eventId: number
  ): Promise<selectParticipant[] | undefined>;
  getParticipantById(id: number): Promise<selectParticipant | undefined>;
  getEventHostByEventId(eventId: number): Promise<selectUser | undefined>;
  getAllParticipantsByEventId(
    eventId: number,
    limit: number,
    page: number
  ): Promise<
    | {
        data: Participant[];
        meta: PageMeta;
      }
    | undefined
  >;
}

export interface EventParticipant {
  id: number;
  eventId: number;
  clientId: string;
  createdAt: Date;
}

export class EventService implements iEventService {
  constructor(private repo: iEventRepo) {}

  async createEvent(eventData: insertEvent) {
    eventData.slug = eventData.slug + '-' + generateID(8);
    const event = await this.repo.addEvent(eventData);
    return event;
  }

  async getEventBySlugOrID(slugOrId: string, userId?: number) {
    let event: EventType.Event | undefined;
    const isnum = /^\d+$/.test(slugOrId);

    if (isnum) {
      event = await this.repo.getEventById(parseInt(slugOrId));
    } else {
      event = await this.repo.getEventBySlug(slugOrId);
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
    return await this.repo.getParticipantById(id);
  }

  async getEventHostByEventId(eventId: number) {
    return await this.repo.getEventHostByEventId(eventId);
  }

  async getAllParticipantsByEventId(eventId: number) {
    return await this.repo.getEventParticipantsByEventId(eventId);
  }
  async sendEmailsRescheduledEvent(
    oldEvent: selectEvent,
    newEvent: selectEvent
  ) {
    eventRepo.updateParticipantCount(newEvent.id);
    const participants = await this.repo.getEventParticipantsByEventId(
      oldEvent.id
    );
    const host = await this.repo.getEventHostByEventId(oldEvent.id);
    if (!host) {
      return;
    }

    if (!participants || participants.length == 0) {
      return;
    }

    for (const participant of participants) {
      SendEventRescheduledEmail(participant, newEvent, oldEvent, host);
    }
  }

  async sendEmailsCancelledEvent(eventId: number) {
    eventRepo.updateParticipantCount(eventId);
    const participants = await this.repo.getEventParticipantsByEventId(eventId);
    const event = await this.repo.getEventById(eventId);
    const host = await this.repo.getEventHostByEventId(eventId);
    if (!host) {
      return;
    }

    if (!event || !participants || participants.length == 0) {
      return;
    }

    for (const participant of participants) {
      SendEventCancelledEmail(participant, event, host);
    }
  }

  isEventRescheduled(event: selectEvent, newEvent: insertEvent) {
    if (
      event.status === 'published' &&
      (event.startTime != newEvent.startTime ||
        event.endTime != newEvent.endTime)
    ) {
      return true;
    }

    return false;
  }

  async inviteParticipant(event: EventType.Event, email: string) {
    // register into participant table
    const newParticipant: insertParticipant = {
      firstName: '',
      lastName: '',
      email: email,
      description: '',
      clientId: generateID(12),
      eventID: event.id,
      isInvited: true,
    };

    const participant = await eventRepo.registerParticipant(newParticipant);

    if (!event.host) {
      return;
    }

    // if event is webinar
    if (event.categoryID == 1) {
      SendEventManualInvitationEmail(event, event.host, email);
    }

    // scheduled meeting
    if (event.categoryID == 2) {
      SendScheduledMeetinEmail(event, event.host, participant, email);
    }
  }
}
