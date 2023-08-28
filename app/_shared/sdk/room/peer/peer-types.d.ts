import type { Api } from '../api/api';

type ReturnApi = ReturnType<typeof Api>;

export type PeerProps = {
  clientId: string;
  roomId: string;
  api: ReturnApi;
};

export as namespace RoomPeerTypes;
