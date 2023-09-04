export const createStream = () => {
  const Stream = class {
    id;
    origin;
    source;
    mediaStream;

    constructor({ origin, source, mediaStream }: RoomStreamType.StreamParams) {
      this.id = mediaStream.id;
      this.origin = origin;
      this.source = source;
      this.mediaStream = mediaStream;
    }
  };

  return {
    createInstance: (data: RoomStreamType.StreamParams) => {
      const stream = new Stream(data);

      return Object.freeze({
        id: stream.id,
        origin: stream.origin,
        source: stream.source,
        mediaStream: stream.mediaStream,
      });
    },
  };
};
