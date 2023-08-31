class Stream {
  _streams;

  constructor() {
    this._streams = new Map<string, RoomStreamType.Stream>();
  }

  addStream = (key: string, value: RoomStreamType.Stream) => {
    if (
      key.trim().length === 0 ||
      !value ||
      typeof value.origin !== 'string' ||
      typeof value.source !== 'string' ||
      !(value.stream instanceof MediaStream)
    ) {
      throw new Error('Incorrect stream format!');
    }

    this._streams.set(key, value);
    return this.getStream(key);
  };

  removeStream = (key: string) => {
    if (key.trim().length === 0) {
      throw new Error('Please provide valid string key');
    }

    const stream = this.getStream(key);
    this._streams.delete(key);
    return stream;
  };

  getAllStreams = () => {
    return [...this._streams.values()];
  };

  getStream = (key: string) => {
    if (key.trim().length === 0) {
      throw new Error('Please provide valid string key');
    }

    return this._streams.get(key) || null;
  };

  getTotalStreams = () => {
    return this._streams.size;
  };

  hasStream = (key: string) => {
    if (key.trim().length === 0) {
      throw new Error('Please provide valid string key');
    }

    return this._streams.has(key);
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
    hasStream: stream.hasStream,
  };
};
