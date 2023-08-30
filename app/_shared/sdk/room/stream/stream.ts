class Stream {
  _streams;

  constructor() {
    this._streams = new Map<string, RoomStreamType.Stream>();
  }

  addStream = (key: string, value: RoomStreamType.Stream) => {
    if (key.trim().length > 0) {
      this._streams.set(key, value);
    }
  };

  removeStream = (key: string) => {
    if (key.trim().length > 0) {
      this._streams.delete(key);
    }
  };

  getAllStreams = () => {
    return [...this._streams.values()];
  };

  getStream = (key: string) => {
    return this._streams.get(key);
  };

  getTotalStreams = () => {
    return this._streams.size;
  };
}

export const streamFactory = () => {
  const stream = new Stream();

  return {
    addStream: stream.addStream,
    removeStream: stream.removeStream,
    getAllStreams: stream.getAllStreams,
    getStream: stream.getStream,
    getTotalStreams: stream.getTotalStreams,
  };
};
