import type { Fetcher } from './fetcher';

export type BaseResponseBody = {
  code: number;
  ok: boolean;
};

export type CreateRoomResponseBody = BaseResponseBody & {
  data: {
    id: string;
  };
};

export type GetRoomResponseBody = BaseResponseBody & {
  data: {
    id: string;
    name: string;
  };
};

export type RegisterClientResponseBody = BaseResponseBody & {
  data: {
    client_id: string;
  };
};

export type NegotiateConnectionResponseBody = BaseResponseBody & {
  data: {
    answer: RTCSessionDescription;
  };
};

export type Fetcher = typeof Fetcher;

export type ReturnFetcher = ReturnType<typeof Fetcher>;

export as namespace SDKRoomAPITypes;
