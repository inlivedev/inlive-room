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
  getStreamByTrackId: (trackId: string) => RoomStreamType.InstanceStream | null;
  getTotalStreams: () => number;
  hasStream: (key: string) => boolean;
  turnOnCamera: () => void;
  turnOnMic: () => void;
  turnOffCamera: () => void;
  turnOffMic: () => void;
  sendStats: (stats: PublisherStats) => void;
};

export type BandwidthController = {
  getAvailable: () => Promise<number>;
  getVideoOutboundTracksLength: () => number;
  getAudioOutboundTracksLength: () => number;
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

export interface RTCOutboundRtpStreamStatsExtra
  extends RTCOutboundRtpStreamStats {
  qualityLimitationReason?: string;
}

export type PublisherStats = {
  available_outgoing_bitrate: number;
  quality_limitation_reason: string;
};

export type Bitrates = {
  low: number;
  mid: number;
  high: number;
  total: number;
};

export as namespace RoomPeerType;
