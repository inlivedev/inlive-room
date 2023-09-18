export const createStream = () => {
  const Stream = class {
    id;
    origin;
    source;
    mediaStream;

    constructor({
      id,
      origin,
      source,
      mediaStream,
    }: RoomStreamType.StreamParams) {
      this.id = id;
      this.origin = origin;
      this.source = source;
      this.mediaStream = mediaStream;
    }

    replaceTrack = (newTrack: MediaStreamTrack) => {
      const currentTrack = this.mediaStream.getTracks().find((currentTrack) => {
        return currentTrack.kind === newTrack.kind;
      });

      if (currentTrack) {
        this.mediaStream.removeTrack(currentTrack);
        this.mediaStream.addTrack(newTrack);
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
        replaceTrack: stream.replaceTrack,
      });
    },
  };
};
