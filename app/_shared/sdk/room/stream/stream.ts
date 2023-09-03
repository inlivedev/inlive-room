export const createStream = (peer: RoomPeerType.InstancePeer) => {
  const Stream = class {
    id;
    origin;
    source;
    mediaStream;
    audioEnabled;
    videoEnabled;
    _peer;

    constructor({ origin, source, mediaStream }: RoomStreamType.StreamParams) {
      this.id = mediaStream.id;
      this.origin = origin;
      this.source = source;
      this.mediaStream = mediaStream;
      this.audioEnabled = mediaStream.getAudioTracks()[0]?.enabled || false;
      this.videoEnabled = mediaStream.getVideoTracks()[0]?.enabled || false;
      this._peer = peer;
    }

    enableVideo = async () => {
      const peerConnection = this._peer.getPeerConnection();
      if (!peerConnection) {
        throw new Error('Cannot proceed. The peer is currently disconnected');
      }

      if (this.origin !== 'local') {
        throw new Error(
          'Cannot proceed. This method only works on local origin stream'
        );
      }

      this._replaceTrack(peerConnection, 'video');
    };

    enableAudio = async () => {
      const peerConnection = this._peer.getPeerConnection();
      if (!peerConnection) {
        throw new Error('Cannot proceed. The peer is currently disconnected');
      }

      if (this.origin !== 'local') {
        throw new Error(
          'Cannot proceed. This method only works on local origin stream'
        );
      }

      this._replaceTrack(peerConnection, 'audio');
    };

    disableVideo = () => {
      const peerConnection = this._peer.getPeerConnection();
      if (!peerConnection) {
        throw new Error('Cannot proceed. The peer is currently disconnected');
      }

      if (this.origin !== 'local') {
        throw new Error(
          'Cannot proceed. This method only works on local origin stream'
        );
      }

      this._stopTrack(peerConnection, 'video');
    };

    disableAudio = () => {
      const peerConnection = this._peer.getPeerConnection();
      if (!peerConnection) {
        throw new Error('Cannot proceed. The peer is currently disconnected');
      }

      if (this.origin !== 'local') {
        throw new Error(
          'Cannot proceed. This method only works on local origin stream'
        );
      }

      this._stopTrack(peerConnection, 'audio');
    };

    _replaceTrack = async (
      peerConnection: RTCPeerConnection,
      kind: 'video' | 'audio'
    ) => {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: kind === 'video',
        audio: kind === 'audio',
      });

      for (const track of localStream.getTracks()) {
        for (const sender of peerConnection.getSenders()) {
          if (!sender.track) return;

          if (sender.track.kind === kind && track.kind === kind) {
            sender.replaceTrack(track);
          }
        }
      }
    };

    _stopTrack = (
      peerConnection: RTCPeerConnection,
      kind: 'video' | 'audio'
    ) => {
      for (const sender of peerConnection.getSenders()) {
        if (!sender.track) return;

        if (sender.track.kind === kind) {
          sender.track.enabled = false;
          sender.track.stop();
        }
      }
    };
  };

  return {
    createInstance: (data: RoomStreamType.StreamParams) => {
      const stream = new Stream(data);

      return {
        id: stream.id,
        origin: stream.origin,
        source: stream.source,
        mediaStream: stream.mediaStream,
        audioEnabled: stream.audioEnabled,
        videoEnabled: stream.videoEnabled,
        disableVideo: stream.disableVideo,
        disableAudio: stream.disableAudio,
        enableVideo: stream.enableVideo,
        enableAudio: stream.enableAudio,
      };
    },
  };
};
