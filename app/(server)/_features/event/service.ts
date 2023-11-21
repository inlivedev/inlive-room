import { iEventService } from '@/(server)/api/_index';
import { insertEvent, selectEvent } from './schema';
import { generateID } from '@/(server)/_shared/utils/generateid';

export interface iEventRepo {
  addEvent(eventData: typeof insertEvent): Promise<typeof selectEvent>;
  getEvent(slug: string): Promise<Event | undefined>;
  getEvents(page: number, limit: number, userId?: number): Promise<Event[]>;
}

export interface EventParticipant {
  id: number;
  eventId: number;
  clientId: string;
  createdAt: Date;
}

export interface Event {
  id: number;
  slug: string;
  name: string | null;
  startTime: Date;
  createdAt: Date;
}

export class EventService implements iEventService {
  constructor(private repo: iEventRepo) {
    this.error.set('EVENT_NOT_FOUND', new Error('Event not found'));
  }

  error: Map<string, Error> = new Map();

  async createEvent(eventData: typeof insertEvent): Promise<Event> {
    eventData.slug = eventData.slug + '-' + generateID(8);
    const event = await this.repo.addEvent(eventData);
    return event;
  }

  async getEvent(slug: string) {
    const event = await this.repo.getEvent(slug);

    return event;
  }
}
