import { iEventService } from '@/(server)/api/_index';
import { insertEvent, selectEvent } from './schema';
import { generateID } from '@/(server)/_shared/utils/generateid';

export interface iEventRepo {
  addEvent(eventData: insertEvent): Promise<selectEvent>;
  getEventBySlug(slug: string): Promise<selectEvent | undefined>;
  getEventById(id: number): Promise<selectEvent | undefined>;
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
}
