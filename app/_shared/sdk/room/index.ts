import { apiFactory } from './api/api';
import { channelFactory } from './channel/channel';
import { eventFactory } from './event/event';
import { peerFactory, PeerEvent } from './peer/peer';
import { participantFactory } from './participant/participant';

export const Room = (config: RoomTypes.Config) => {
  const baseUrl = `${config.api.baseUrl}/${config.api.version}`;
  const api = apiFactory(baseUrl);
  const event = eventFactory();
  const participant = participantFactory();

  const peer = peerFactory({
    api,
    event,
    participant,
  });

  const channel = channelFactory({
    baseUrl,
    api,
    peer,
  });

  const { connect: connectToPeer, ...restOfPeer } = peer;
  const { connect: connectToChannel } = channel;

  return {
    createRoom: api.createRoom,
    createClient: api.registerClient,
    getRoom: api.getRoom,
    createPeer: (roomId: string, clientId: string) => {
      connectToPeer(roomId, clientId);
      connectToChannel(roomId, clientId);

      return restOfPeer;
    },
    on: event.on,
    leaveRoom: api.leaveRoom,
    terminateRoom: api.terminateRoom,
    event: {
      ...PeerEvent,
    },
  };
};
