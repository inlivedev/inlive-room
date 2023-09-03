import type { createFacade } from './facade';

export type CreateFacade = typeof createFacade;
export type CreateInstanceFacade = ReturnType<CreateFacade>['createInstance'];

export type CreateFacadeDependencies = {
  config: RoomType.Config;
  api: {
    createFetcher: RoomAPIType.CreateFetcher;
    createApi: RoomAPIType.CreateApi;
  };
  event: {
    createEvent: RoomEventType.CreateEvent;
  };
  stream: {
    createStream: RoomStreamType.CreateStream;
    createStreams: RoomStreamType.CreateStreams;
  };
  peer: {
    createPeer: RoomPeerType.CreatePeer;
  };
  channel: {
    createChannel: RoomChannelType.CreateChannel;
  };
  roomEvents: {
    peer: RoomPeerType.PeerEvents;
  };
};

export as namespace RoomFacadeType;
