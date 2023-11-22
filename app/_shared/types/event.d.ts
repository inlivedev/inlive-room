import type { FetcherResponse } from '@/_shared/utils/fetcher';
import type { IEvent } from '@/(server)/_features/event/service';

export declare namespace EventType {
  type DetailEventResponse = FetcherResponse & {
    message: string;
    data: IEvent;
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
}
