import { EventRepo } from '@/(server)/_features/event/repository';
import { insertEvent } from '@/(server)/_features/event/schema';
import { Event, EventService } from '@/(server)/_features/event/service';

export interface iEventService {
  addEvent(eventData: typeof insertEvent): Promise<Event>;
  getEvent(slug: string): Promise<Event | undefined>;
}

export const eventService = new EventService(new EventRepo());
