import type { FetcherResponse } from '@/_shared/utils/fetcher';

export declare namespace ClientType {
  type ClientData = {
    clientID: string;
    clientName: string;
  };

  type SetClientNameResponse = FetcherResponse & {
    message: string;
    data: {
      roomID: string;
      clientID: string;
      name: string;
    };
  };
}
