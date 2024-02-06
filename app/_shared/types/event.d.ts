import type { FetcherResponse } from '@/_shared/utils/fetcher';
import type { IEvent } from '@/(server)/_features/event/service';
import { selectEvent } from '@/(server)/_features/event/schema';
import { PageMeta } from './types';

export declare namespace EventType {
  type DetailEventResponse = FetcherResponse & {
    message: string;
    data: typeof selectEvent;
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
      event: IEvent;
      participant: RegisteredParticipant;
    };
  };

  type ListEventsResponse = FetcherResponse & {
    message: string;
    data: (typeof selectEvent)[];
    meta: PageMeta;
  };
}
