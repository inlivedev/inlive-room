import merge from 'lodash-es/merge.js';
import { createFetcher } from '../api/fetcher';
import { createApi } from '../api/api';
import { createEvent } from '../event/event';
import { createStreams } from '../stream/streams';
import { createStream } from '../stream/stream';
import { createPeer, PeerEvents } from '../peer/peer';
import { createChannel } from '../channel/channel';
import * as defaultConfig from '../config/config';

const config = {
  api: defaultConfig.api,
  webrtc: defaultConfig.webrtc,
};

export const createFacade = ({
  config,
  api: { createFetcher, createApi },
  event: { createEvent },
  stream: { createStream, createStreams },
  peer: { createPeer },
  channel: { createChannel },
  roomEvents,
}: RoomFacadeType.CreateFacadeDependencies) => {
  return (userConfig: RoomType.UserConfig) => {
    merge(config, userConfig);

    const baseUrl = `${config.api.baseUrl}/${config.api.version}`;
    const fetcher = createFetcher().createInstance(baseUrl);
    const api = createApi({
      fetcher,
    }).createInstance();
    const event = createEvent().createInstance();
    const streams = createStreams().createInstance();
    const peer = createPeer({
      api,
      config,
      createStream,
      event,
      streams,
    }).createInstance();
    const channel = createChannel({
      api,
      peer,
      streams,
    }).createInstance(baseUrl);

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
        ...roomEvents.peer,
      },
    };
  };
};

export const createInstanceFacade = createFacade({
  config,
  api: { createFetcher, createApi },
  event: { createEvent },
  stream: { createStream, createStreams },
  peer: { createPeer },
  channel: { createChannel },
  roomEvents: {
    peer: PeerEvents,
  },
});
