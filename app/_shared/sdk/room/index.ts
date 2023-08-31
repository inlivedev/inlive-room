import { apiFactory } from './api/api';
import { channelFactory } from './channel/channel';
import { eventFactory } from './event/event';
import { peerFactory, PeerEvent } from './peer/peer';
import { streamFactory } from './stream/stream';

export const Room = (config: RoomTypes.Config) => {
  const baseUrl = `${config.api.baseUrl}/${config.api.version}`;
  const api = apiFactory(baseUrl);
  const event = eventFactory();
  const stream = streamFactory();

  const peer = peerFactory({
    api,
    event,
    stream,
  });

  const channel = channelFactory({
    baseUrl,
    api,
    peer,
    stream,
  });

  return {
    createRoom: api.createRoom,
    createClient: api.registerClient,
    getRoom: api.getRoom,
    createPeer: (roomId: string, clientId: string) => {
      peer.connect(roomId, clientId);
      channel.connect(roomId, clientId);

      return peer;
    },
    on: event.on,
    leaveRoom: api.leaveRoom,
    terminateRoom: api.terminateRoom,
    event: {
      STREAM_ADDED: PeerEvent.STREAM_ADDED,
      STREAM_REMOVED: PeerEvent.STREAM_REMOVED,
    },
  };
};
