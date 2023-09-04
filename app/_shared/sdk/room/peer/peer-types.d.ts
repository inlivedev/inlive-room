import type { createPeer } from './peer';

export type CreatePeer = typeof createPeer;
export type InstancePeer = {
  connect: (roomId: string, clientId: string) => void;
  disconnect: () => void;
  getPeerConnection: () => RTCPeerConnection | null;
  addStream: (key: string, value: RoomStreamType.StreamParams) => void;
  removeStream: (key: string) => RoomStreamType.InstanceStream | null;
  getAllStreams: () => RoomStreamType.InstanceStream[];
  getStream: (key: string) => RoomStreamType.InstanceStream | null;
  getTotalStreams: () => number;
  hasStream: (key: string) => boolean;
  enableCamera: () => void;
  enableMic: () => void;
  disableCamera: () => void;
  disableMic: () => void;
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
  _ADD_LOCAL_MEDIA_STREAM: 'addLocalMediaStream';
  _ADD_LOCAL_SCREEN_STREAM: 'addLocalScreenStream';
};

export as namespace RoomPeerType;
