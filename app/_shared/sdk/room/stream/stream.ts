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

      if (this.origin === 'local' && this.source === 'media') {
        await this._replaceMediaTrack(peerConnection, 'video');
      }

      if (
        (this.origin === 'local' && this.source === 'screen') ||
        (this.origin === 'remote' && this.source === 'media') ||
        (this.origin === 'remote' && this.source === 'screen')
      ) {
        this._setTrackEnabled(this.mediaStream, 'video', true);
      }

      this.videoEnabled = true;
      return true;
    };

    enableAudio = async () => {
      const peerConnection = this._peer.getPeerConnection();

      if (!peerConnection) {
        throw new Error('Cannot proceed. The peer is currently disconnected');
      }

      if (this.origin === 'local' && this.source === 'media') {
        await this._replaceMediaTrack(peerConnection, 'audio');
      }

      if (
        (this.origin === 'local' && this.source === 'screen') ||
        (this.origin === 'remote' && this.source === 'media') ||
        (this.origin === 'remote' && this.source === 'screen')
      ) {
        this._setTrackEnabled(this.mediaStream, 'audio', true);
      }

      this.audioEnabled = true;
      return true;
    };

    disableVideo = async () => {
      const peerConnection = this._peer.getPeerConnection();

      if (!peerConnection) {
        throw new Error('Cannot proceed. The peer is currently disconnected');
      }

      this._setTrackEnabled(this.mediaStream, 'video', false);

      if (this.origin === 'local' && this.source === 'media') {
        this._stopTrack(this.mediaStream, 'video');
      }

      this.videoEnabled = false;
      return true;
    };

    disableAudio = async () => {
      const peerConnection = this._peer.getPeerConnection();

      if (!peerConnection) {
        throw new Error('Cannot proceed. The peer is currently disconnected');
      }

      this._setTrackEnabled(this.mediaStream, 'audio', false);

      if (this.origin === 'local' && this.source === 'media') {
        this._stopTrack(this.mediaStream, 'audio');
      }

      this.audioEnabled = false;
      return true;
    };

    _setTrackEnabled = (
      mediaStream: MediaStream,
      kind: 'video' | 'audio',
      enabled: boolean
    ) => {
      for (const track of mediaStream.getTracks()) {
        if (track.kind === kind) {
          track.enabled = enabled;
        }
      }
    };

    _stopTrack = (mediaStream: MediaStream, kind: 'video' | 'audio') => {
      for (const track of mediaStream.getTracks()) {
        if (track.kind === kind) {
          track.stop();
        }
      }
    };

    _replaceMediaTrack = async (
      peerConnection: RTCPeerConnection,
      kind: 'video' | 'audio'
    ) => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: kind === 'video',
        audio: kind === 'audio',
      });

      for (const track of mediaStream.getTracks()) {
        for (const sender of peerConnection.getSenders()) {
          if (!sender.track) return;

          if (sender.track.kind === kind && track.kind === kind) {
            sender.replaceTrack(track);
          }
        }
      }
    };
  };

  return {
    createInstance: (data: RoomStreamType.StreamParams) => {
      const stream = new Stream(data);

      return Object.freeze({
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
      });
    },
  };
};
