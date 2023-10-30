import type { createFetcher } from './fetcher';
import type { createApi } from './api';

export type CreateFetcher = typeof createFetcher;
export type CreateApi = typeof createApi;

export type InstanceFetcher = ReturnType<
  ReturnType<CreateFetcher>['createInstance']
>;
export type InstanceApi = ReturnType<ReturnType<CreateApi>['createInstance']>;

export type ApiDependencies = {
  fetcher: RoomAPIType.InstanceFetcher;
};

export type TrackSourcesRequestBody = {
  track_id: string;
  source: string;
};

export type SubscribeTracksRequestBody = {
  client_id: string;
  stream_id: string;
  track_id: string;
};

export type RegisterClientRequestBody = {
  uid?: string;
  name?: string;
};

export type Bitrates = {
  audio: number;
  audio_red: number;
  video: number;
  video_high: number;
  video_mid: number;
  video_low: number;
  initial_bandwidth: number;
};

export type SetClientNameResponse = BaseResponseBody & {
  data: {
    client_id: string;
    name: string;
    bitrates: Bitrates;
  };
};

export type BaseResponseBody = {
  code: number;
  ok: boolean;
  message: string;
};

export type GetClientResponseBody = BaseResponseBody & {
  data: {
    id: string;
    name: string;
    peer_connection_state: RTCPeerConnectionState;
    ice_peer_connection_state: RTCIceConnectionState;
    events: {
      [key: string]: {
        name: string;
        timestamp: number;
        data: { [key: string]: string };
      };
    };
  };
};

export type CreateRoomResponseBody = BaseResponseBody & {
  data: {
    room_id: string;
    name: string;
    bitrates_config: Bitrates;
  };
};

export type GetRoomResponseBody = BaseResponseBody & {
  data: {
    room_id: string;
    name: string;
  };
};

export type RegisterClientResponseBody = BaseResponseBody & {
  data: {
    client_id: string;
    name: string;
    bitrates: Bitrates;
  };
};

export type NegotiateConnectionResponseBody = BaseResponseBody & {
  data: {
    answer: RTCSessionDescription;
  };
};

export as namespace RoomAPIType;
