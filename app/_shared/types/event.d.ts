import type { FetcherResponse } from '@/_shared/utils/fetcher';
import type { IEvent } from '@/(server)/_features/event/service';

export declare namespace EventType {
  type DetailEventResponse = FetcherResponse & {
    message: string;
    data: IEvent;
  };
}
