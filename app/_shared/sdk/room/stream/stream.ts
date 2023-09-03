export const createStream = (peer: RoomPeerType.InstancePeer) => {
  const Stream = class {
    id;
    origin;
    source;
    mediaStream;
    audioEnabled;
    videoEnabled;
    _peer;

    constructor({ origin, source, mediaStream }: RoomStreamType.StreamParams) {
      this.id = mediaStream.id;
      this.origin = origin;
      this.source = source;
      this.mediaStream = mediaStream;
      this.audioEnabled = mediaStream.getAudioTracks()[0]?.enabled || false;
      this.videoEnabled = mediaStream.getVideoTracks()[0]?.enabled || false;
      this._peer = peer;
    }

    enableVideo = () => {
      this._setTrackEnabled(this.mediaStream, 'video', true);
      this.videoEnabled = true;
    };

    enableAudio = () => {
      this._setTrackEnabled(this.mediaStream, 'audio', true);
      this.audioEnabled = true;
    };

    disableVideo = () => {
      this._setTrackEnabled(this.mediaStream, 'video', false);
      this.videoEnabled = false;
    };

    disableAudio = () => {
      this._setTrackEnabled(this.mediaStream, 'audio', false);
      this.audioEnabled = false;
    };

    _setTrackEnabled = (
      mediaStream: MediaStream,
      kind: 'video' | 'audio',
      enabled: boolean
    ) => {
      for (const track of mediaStream.getTracks()) {
        if (track.kind === kind) {
          track.enabled = enabled;
        }
      }
    };
  };

  return {
    createInstance: (data: RoomStreamType.StreamParams) => {
      const stream = new Stream(data);

      return Object.freeze({
        id: stream.id,
        origin: stream.origin,
        source: stream.source,
        mediaStream: stream.mediaStream,
        audioEnabled: stream.audioEnabled,
        videoEnabled: stream.videoEnabled,
        disableVideo: stream.disableVideo,
        disableAudio: stream.disableAudio,
        enableVideo: stream.enableVideo,
        enableAudio: stream.enableAudio,
      });
    },
  };
};
