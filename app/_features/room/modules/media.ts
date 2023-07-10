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

  addStream(stream: MediaStream) {
    stream.addEventListener('removetrack', (event) => {
      const target = event.target as MediaStream;
      if (target) {
        if (target.id in this.#streams && target.getTracks().length == 0) {
          delete this.#streams[target.id];
          // video.remove();
        }
      }
    });
    this.#streams[stream.id] = stream;
  }
}
