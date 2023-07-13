export type StreamsType = {
  [key: string]: MediaStream;
};

export class MediaManager {
  #localStream;
  #streams: StreamsType;
  constructor(localStream: MediaStream) {
    this.#localStream = localStream;
    this.#streams = {};
  }

  static async getUserMedia(constraints: MediaStreamConstraints) {
    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => mediaStream)
      .catch((error) => {
        throw error;
      });
  }

  getLocalStream() {
    return this.#localStream;
  }

  getRemoteStreams() {
    return this.#streams;
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
