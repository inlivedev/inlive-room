export const createStreams = () => {
  const Streams = class {
    _streams;
    _drafts;

    constructor() {
      this._streams = new Map<string, RoomStreamType.InstanceStream>();
      this._drafts = new Map<string, RoomStreamType.DraftStream>();
    }

    addStream = (key: string, stream: RoomStreamType.InstanceStream) => {
      if (key.trim().length === 0) {
        throw new Error('Please provide valid string key');
      }

      this._streams.set(key, stream);
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
        mediaStream: value.mediaStream || draft.mediaStream || undefined,
      });
    };

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
  };

  return {
    createInstance: () => {
      const streams = new Streams();

      return {
        addStream: streams.addStream,
        removeStream: streams.removeStream,
        getAllStreams: streams.getAllStreams,
        getStream: streams.getStream,
        getTotalStreams: streams.getTotalStreams,
        hasStream: streams.hasStream,
        addDraft: streams.addDraft,
        getDraft: streams.getDraft,
        removeDraft: streams.removeDraft,
      };
    },
  };
};
