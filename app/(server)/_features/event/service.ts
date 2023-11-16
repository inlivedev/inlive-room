import { iEventService } from '@/(server)/api/events/_index';
import { insertEvent } from './schema';

export interface iEventRepo {
  addEvent(eventData: typeof insertEvent): Promise<Event>;
  getEvent(slug: string): Promise<Event | undefined>;
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
  constructor(private repo: iEventRepo) {}

  async addEvent(eventData: typeof insertEvent): Promise<Event> {
    const event = await this.repo.addEvent(eventData);

    return event;
  }

  async getEvent(slug: string) {
    const event = await this.repo.getEvent(slug);

    return event;
  }
}
