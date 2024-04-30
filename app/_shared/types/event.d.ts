import type { FetcherResponse } from '@/_shared/utils/fetcher';
import {
  selectEvent,
  selectParticipant,
} from '@/(server)/_features/event/schema';
import { selectUser } from '@/(server)/_features/user/schema';
import { PageMeta } from './types';
import { Participant } from '@/(server)/_features/event/service';

export declare namespace EventType {
  type Event = selectEvent & {
    host?: Partial<selectUser> | null;
    availableSlots?: number;
  };

  type DetailEventResponse = FetcherResponse & {
    message: string;
    data: Event;
  };

  type GetStatsResponse = FetcherResponse & {
    data: {
      count: {
        registered: number;
        attended: number;
        fullyAttended: number;

        // Guest is no longer able to join to event room, for old event only
        guest?: number;
        totalJoined?: number;
      };

      percentage: {
        attended?: string;
        fullyAttended?: string;
      };
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

  type ParticipantResponse = FetcherResponse & {
    message: string;
    data: RegisteredParticipant;
  };

  type RegisterParticipantResponse = FetcherResponse & {
    message: string;
    data: {
      event: Partial<Event>;
      participant: selectParticipant;
    };
  };

  export type GetParticipantsResponse = FetcherResponse & {
    message: string;
    data: Participant[];
    meta: PageMeta;
  };

  export type EventParticipant = Participant;

  type Registeree = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
  };

  type GetRegistereeResponse = FetcherResponse & {
    message: string;
    data: Registeree[];
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
