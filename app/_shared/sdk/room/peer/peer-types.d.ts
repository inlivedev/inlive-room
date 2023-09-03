import type { createPeer } from './peer';

export type CreatePeer = typeof createPeer;
export type InstancePeer = {
  connect: (roomId: string, clientId: string) => void;
  disconnect: () => void;
  getPeerConnection: () => RTCPeerConnection | null;
  addTrack: (stream: MediaStream) => void;
  addStream: (key: string, value: RoomStreamType.StreamParams) => void;
  removeStream: (key: string) => boolean;
  getAllStreams: () => RoomStreamType.InstanceStream[];
  getStream: (key: string) => RoomStreamType.InstanceStream | null;
  getTotalStreams: () => number;
  hasStream: (key: string) => boolean;
};

export type PeerDependencies = {
  api: RoomAPIType.InstanceApi;
  createStream: RoomStreamType.CreateStream;
  event: RoomEventType.InstanceEvent;
  streams: RoomStreamType.InstanceStreams;
  config: RoomType.Config;
};

export type PeerEvents = {
  STREAM_ADDED: 'streamAdded';
  STREAM_REMOVED: 'streamRemoved';
};

export as namespace RoomPeerType;
