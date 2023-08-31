import type { apiFactory } from '../api/api';
import type { peerFactory } from '../peer/peer';

type ReturnApi = ReturnType<typeof apiFactory>;
type ReturnPeer = ReturnType<typeof peerFactory>;

export type ChannelProps = {
  baseUrl: string;
  api: ReturnApi;
  peer: ReturnPeer;
};

export type TrackSource = {
  track_id: string;
  source: string;
};

export type SubscribingTrack = {
  client_id: string;
  stream_id: string;
  track_id: string;
};

export as namespace RoomChannelType;
