import type { apiFactory } from '../api/api';
import type { peerFactory } from '../peer/peer';

type ReturnApi = ReturnType<typeof apiFactory>;
type ReturnPeer = ReturnType<ReturnType<typeof peerFactory>['createPeer']>;

export type ChannelProps = {
  baseUrl: string;
  api: ReturnApi;
  peer: ReturnPeer;
};

export as namespace RoomChannelTypes;
