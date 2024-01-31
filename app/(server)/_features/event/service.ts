import { iEventService } from '@/(server)/api/_index';
import { insertEvent, selectEvent } from './schema';
import { generateID } from '@/(server)/_shared/utils/generateid';

export interface iEventRepo {
  addEvent(eventData: typeof insertEvent): Promise<typeof selectEvent>;
  getEvent(slug: string): Promise<typeof selectEvent | undefined>;
  getEvents(
    page: number,
    limit: number,
    userId?: number
  ): Promise<(typeof selectEvent)[]>;
}

export interface EventParticipant {
  id: number;
  eventId: number;
  clientId: string;
  createdAt: Date;
}

export class EventService implements iEventService {
  constructor(private repo: iEventRepo) {}

  async createEvent(eventData: typeof insertEvent) {
    eventData.slug = eventData.slug + '-' + generateID(8);
    const event = await this.repo.addEvent(eventData);
    return event;
  }

  async getEvent(slug: string, userId?: number) {
    const event = await this.repo.getEvent(slug);

    if (!event) {
      return undefined;
    }

    if (event?.createdBy != userId) {
      event.roomId = '';
    }

    return event;
  }
}
