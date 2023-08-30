import type { apiFactory } from '../api/api';
import type { channelFactory } from '../channel/channel';
import type { eventFactory } from '../event/event';
import type { streamFactory } from '../stream/stream';

type ReturnApi = ReturnType<typeof apiFactory>;
type ReturnChannel = ReturnType<typeof channelFactory>;
type ReturnEvent = ReturnType<typeof eventFactory>;
type ReturnStream = ReturnType<typeof streamFactory>;

export type PeerProps = {
  api: ReturnApi;
  event: ReturnEvent;
  stream: ReturnStream;
};

export type PeerFactoryProps = {
  api: ReturnApi;
  event: ReturnEvent;
  stream: ReturnStream;
};

export as namespace RoomPeerTypes;
