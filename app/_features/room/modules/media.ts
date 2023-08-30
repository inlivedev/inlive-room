export type StreamsType = {
  [key: string]: MediaStreamType;
};

export type MediaStreamType = {
  stream: MediaStream;
  source: string;
};

export type AvailableStreamType = {
  [key: string]: {
    clientid: string;
    streamid: string;
    source: string;
  };
};

export class MediaManager {
  #localStreams: StreamsType;
  #streams: StreamsType;
  #availableStreams: AvailableStreamType;

  constructor(localStream: MediaStream, source: string) {
    this.#localStreams = {};
    this.#streams = {};
    this.#availableStreams = {};

    this.#localStreams[localStream.id] = {
      stream: localStream,
      source,
    };
  }

  static async getUserMedia(constraints: MediaStreamConstraints) {
    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => mediaStream)
      .catch((error) => {
        throw error;
      });
  }

  static async getDisplayMedia(constraints: MediaStreamConstraints) {
    return navigator.mediaDevices
      .getDisplayMedia(constraints)
      .then((mediaStream) => mediaStream)
      .catch((error) => {
        throw error;
      });
  }

  getLocalStreams() {
    return this.#localStreams;
  }

  getRemoteStreams() {
    return this.#streams;
  }

  getStreamSource(streamId: string) {
    return this.#streams[streamId].source;
  }

  getLocalStreamSource(streamId: string) {
    return this.#localStreams[streamId].source;
  }

  addLocalStream(stream: MediaStream, source: string) {
    if (stream instanceof MediaStream) {
      this.#localStreams[stream.id] = {
        stream: stream,
        source: source,
      };
    }
  }

  removeLocalStream(streamId: string) {
    delete this.#localStreams[streamId];
  }

  addAvailableStream(clientid: string, streamid: string, source: string) {
    this.#availableStreams[streamid] = {
      clientid: clientid,
      streamid: streamid,
      source: source,
    };
  }

  addStream(stream: MediaStream) {
    if (stream instanceof MediaStream) {
      console.log(this.#availableStreams);
      this.#streams[stream.id] = {
        stream: stream,
        source: this.#availableStreams[stream.id].source,
      };
    }
  }

  removeStream(streamId: string) {
    delete this.#streams[streamId];
    delete this.#availableStreams[streamId];
  }
}
