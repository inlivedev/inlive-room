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
      this.audioEnabled = true;
      this.videoEnabled = true;
      this._peer = peer;
    }
  };

  return {
    createInstance: (data: RoomStreamType.StreamParams) => {
      const stream = new Stream(data);

      return {
        id: stream.id,
        origin: stream.origin,
        source: stream.source,
        mediaStream: stream.mediaStream,
        audioEnabled: stream.audioEnabled,
        videoEnabled: stream.videoEnabled,
      };
    },
  };
};
