import type { apiFactory } from '../api/api';
import type { channelFactory } from '../channel/channel';
import type { eventFactory } from '../event/event';
import type { participantFactory } from '../participant/participant';

type ReturnApi = ReturnType<typeof apiFactory>;
type ReturnChannel = ReturnType<typeof channelFactory>;
type ReturnEvent = ReturnType<typeof eventFactory>;
type ReturnParticipant = ReturnType<typeof participantFactory>;

export type PeerProps = {
  api: ReturnApi;
  event: ReturnEvent;
  participant: ReturnParticipant;
};

export type PeerFactoryProps = {
  api: ReturnApi;
  event: ReturnEvent;
  participant: ReturnParticipant;
};

export as namespace RoomPeerTypes;
