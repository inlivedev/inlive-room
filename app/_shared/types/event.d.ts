import type { FetcherResponse } from '@/_shared/utils/fetcher';
import { selectEvent } from '@/(server)/_features/event/schema';
import { PageMeta } from './types';

export declare namespace EventType {
  type Event = selectEvent;

  type DetailEventResponse = FetcherResponse & {
    message: string;
    data: Event;
  };

  type Stat = FetcherResponse & {
    data: {
      registeredUsers: number;
      joinedUsers: number;
      joinedGuests: number;
      percentageJoined: string;
      percentageGuest: string;
    };
  };

  type RegisteredParticipant = FetcherResponse & {
    id: number;
    clientId: string;
    createdAt: string;
    email: string;
    firstName: string;
    lastName: string;
    description: string;
    data?: Map<string, string>;
  };

  type RegisterParticipantResponse = FetcherResponse & {
    message: string;
    data: {
      event: Event;
      participant: RegisteredParticipant;
    };
  };

  type ListEventsResponse = FetcherResponse & {
    message: string;
    data?: Event[];
    meta: PageMeta;
  };

  type CreateLimit = FetcherResponse & {
    data: {
      count: number;
      limit: number;
    };
    message: string;
  };
}
