import type { FetcherResponse } from '@/_shared/utils/fetcher';
import {
  insertParticipant,
  selectEvent,
} from '@/(server)/_features/event/schema';
import { selectUser } from '@/(server)/_features/user/schema';
import { PageMeta } from './types';

export declare namespace EventType {
  type Event = selectEvent & {
    host?: Partial<selectUser> | null;
  };

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
  };

  type RegisterParticipantResponse = FetcherResponse & {
    message: string;
    data: {
      event: Event;
      participant: Omit<insertParticipant, 'clientId'>;
    };
  };

  type RegistereeParticipant = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
  };

  type RegistereeParticipantResponse = FetcherResponse & {
    message: string;
    data: RegistereeParticipant[];
    meta: PageMeta;
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
