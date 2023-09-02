import type { Fetcher, factoryFetcher } from './fetcher';
import type { Api, factoryApi } from './api';

export type Fetcher = typeof Fetcher;
export type Api = typeof Api;

export type FactoryFetcher = typeof factoryFetcher;
export type FactoryApi = typeof factoryApi;

export type CreateFetcher = ReturnType<FactoryFetcher>['create'];
export type CreateApi = ReturnType<FactoryApi>['create'];

export type TrackSourcesRequestBody = {
  track_id: string;
  source: string;
};

export type SubscribeTracksRequestBody = {
  client_id: string;
  stream_id: string;
  track_id: string;
};

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

export as namespace RoomAPIType;
