export const createStreams = () => {
  const Streams = class {
    _streams;
    _drafts;

    constructor() {
      this._streams = new Map<string, RoomStreamType.InstanceStream>();
      this._drafts = new Map<string, RoomStreamType.DraftStream>();
    }

    addStream = (key: string, stream: RoomStreamType.InstanceStream) => {
      this._streams.set(key, stream);
      return this._streams.get(key);
    };

    removeStream = (key: string) => {
      const stream = this._streams.get(key) || null;
      this._streams.delete(key);
      return stream;
    };

    getAllStreams = () => {
      return [...this._streams.values()];
    };

    getStream = (key: string) => {
      return this._streams.get(key) || null;
    };

    getStreamByTrackId = (trackId: string) => {
      const track = [...this._streams.values()].find((stream) => {
        return stream.mediaStream.getTracks().some((track) => {
          return track.id === trackId;
        });
      });

      return track || null;
    };

    getTotalStreams = () => {
      return this._streams.size;
    };

    hasStream = (key: string) => {
      return this._streams.has(key);
    };

    addDraft = (key: string, value: RoomStreamType.DraftStream = {}) => {
      this.validateKey(key);

      const draft = this._drafts.get(key) || {};

      this._drafts.set(key, {
        clientId: value.clientId || draft.clientId || undefined,
        name: value.name || draft.name || undefined,
        origin: value.origin || draft.origin || undefined,
        source: value.source || draft.source || undefined,
        mediaStream: value.mediaStream || draft.mediaStream || undefined,
      });
    };

    getDraft = (key: string) => {
      this.validateKey(key);
      return this._drafts.get(key) || null;
    };

    removeDraft = (key: string) => {
      this.validateKey(key);
      return this._drafts.delete(key);
    };

    validateKey = (key: string) => {
      if (key.trim().length === 0) {
        throw new Error('Please provide valid string key');
      }

      return true;
    };

    validateStream = (data: RoomStreamType.AddStreamParams) => {
      if (
        !data ||
        !(data.mediaStream instanceof MediaStream) ||
        typeof data.origin !== 'string' ||
        typeof data.source !== 'string' ||
        typeof data.clientId !== 'string' ||
        typeof data.name !== 'string'
      ) {
        throw new Error(
          'Please provide valid stream data (clientId, name, origin, source, MediaStream)'
        );
      }

      return true;
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
        getStreamByTrackId: streams.getStreamByTrackId,
        getTotalStreams: streams.getTotalStreams,
        hasStream: streams.hasStream,
        addDraft: streams.addDraft,
        getDraft: streams.getDraft,
        removeDraft: streams.removeDraft,
        validateKey: streams.validateKey,
        validateStream: streams.validateStream,
      };
    },
  };
};
