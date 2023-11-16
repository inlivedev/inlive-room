import { iEventService } from '@/(server)/api/events/_index';
import { insertEvent } from './schema';

export interface iEventRepo {
  addEvent(eventData: typeof insertEvent): Promise<Event>;
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

  async addEvent(eventData: typeof insertEvent): Promise<Event> {
    const event = await this.repo.addEvent(eventData);

    return event;
  }

  async getEvent(slug: string) {
    const event = await this.repo.getEvent(slug);

    return event;
  }

  async getEvents(page: number, limit: number, userId?: number) {
    const events = await this.repo.getEvents(page, limit, userId);

    if (events.length === 0) {
      throw this.error.get('EVENT_NOT_FOUND');
    }

    return events;
  }
}
