import type { Api } from '../api/api';
import type { Peer } from '../peer/peer';

type ReturnApi = ReturnType<typeof Api>;
type ReturnPeer = ReturnType<typeof Peer>;

export type ChannelProps = {
  clientId: string;
  roomId: string;
  hubBaseURL: string;
  api: ReturnApi;
  peer: ReturnPeer;
};

export as namespace RoomChannelTypes;
