class Stream {
  _streams;
  _drafts;

  constructor() {
    this._streams = new Map<string, RoomStreamType.Stream>();
    this._drafts = new Map<string, RoomStreamType.DraftStream>();
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
    return this._streams.get(key);
  };

  removeStream = (key: string) => {
    if (key.trim().length === 0) {
      throw new Error('Please provide valid string key');
    }

    return this._streams.delete(key);
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

  addDraft = (key: string, value: RoomStreamType.DraftStream = {}) => {
    if (key.trim().length === 0) {
      throw new Error('Please provide valid string key');
    }

    const draft = this._drafts.get(key) || {};

    this._drafts.set(key, {
      origin: value.origin || draft.origin || undefined,
      source: value.source || draft.source || undefined,
      stream: value.stream || draft.stream || undefined
    });
  }

  getDraft = (key: string) => {
    if (key.trim().length === 0) {
      throw new Error('Please provide valid string key');
    }

    return this._drafts.get(key) || null;
  };

  removeDraft = (key: string) => {
    if (key.trim().length === 0) {
      throw new Error('Please provide valid string key');
    }

    return this._drafts.delete(key);
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
    addDraft: stream.addDraft,
    getDraft: stream.getDraft,
    removeDraft: stream.removeDraft,
  };
};
