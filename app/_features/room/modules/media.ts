export type StreamsType = {
  [key: string]: MediaStream;
};

export class MediaManager {
  #localStreams: StreamsType;
  #streams: StreamsType;
  constructor(localStream: MediaStream) {
    this.#localStreams = {};
    this.#streams = {};

    this.#localStreams[localStream.id] = localStream;
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

  addLocalStream(stream: MediaStream) {
    if (stream instanceof MediaStream) {
      this.#localStreams[stream.id] = stream;
    }
  }

  removeLocalStream(streamId: string) {
    delete this.#localStreams[streamId];
  }

  addStream(stream: MediaStream) {
    if (stream instanceof MediaStream) {
      this.#streams[stream.id] = stream;
    }
  }

  removeStream(streamId: string) {
    delete this.#streams[streamId];
  }
}
