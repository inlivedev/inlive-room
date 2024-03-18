import { iEventService } from '@/(server)/api/_index';
import { insertEvent, selectEvent, selectParticipant } from './schema';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { selectUser } from '../user/schema';
import {
  SendEventCancelledEmail,
  SendEventRescheduledEmail,
} from '@/(server)/_shared/mailer/mailer';

export interface iEventRepo {
  addEvent(eventData: insertEvent): Promise<selectEvent>;
  getEventById(id: number): Promise<
    | (selectEvent & {
        host:
          | {
              name: string;
              id: number;
              pictureUrl: string | null;
            }
          | null
          | undefined;
      })
    | undefined
  >;
  getEventBySlug(slug: string): Promise<
    | (selectEvent & {
        host:
          | {
              name: string;
              id: number;
              pictureUrl: string | null;
            }
          | null
          | undefined;
      })
    | undefined
  >;
  getEventParticipantsByEventId(eventId: number): Promise<
    {
      participant: selectParticipant;
    }[]
  >;
  getParticipantById(id: number): Promise<selectParticipant | undefined>;
  getEventHostByEventId(eventId: number): Promise<selectUser | undefined>;
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
    let event: selectEvent | undefined;

    if (!isNaN(Number(slugOrId))) {
      event = await this.repo.getEventById(Number(slugOrId));
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
    const participants = await this.repo.getEventParticipantsByEventId(
      oldEvent.id
    );
    const host = await this.repo.getEventHostByEventId(oldEvent.id);
    if (!host) {
      return;
    }

    if (participants.length == 0) {
      return;
    }

    for (const participant of participants) {
      SendEventRescheduledEmail(
        participant.participant,
        oldEvent,
        newEvent,
        host
      );
    }
  }

  async sendEmailsCancelledEvent(eventId: number) {
    const participants = await this.repo.getEventParticipantsByEventId(eventId);
    const event = await this.repo.getEventById(eventId);
    const host = await this.repo.getEventHostByEventId(eventId);
    if (!host) {
      return;
    }

    if (!event || participants.length == 0) {
      return;
    }

    for (const participant of participants) {
      SendEventCancelledEmail(participant.participant, event, host);
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
}
