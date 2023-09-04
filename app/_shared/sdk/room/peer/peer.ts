export const PeerEvents: RoomPeerType.PeerEvents = {
  STREAM_ADDED: 'streamAdded',
  STREAM_REMOVED: 'streamRemoved',
  _ADD_LOCAL_MEDIA_STREAM: 'addLocalMediaStream',
  _ADD_REMOTE_MEDIA_STREAM: 'addRemoteMediaStream',
  _ADD_LOCAL_SCREEN_STREAM: 'addLocalScreenStream',
  _ADD_REMOTE_SCREEN_STREAM: 'addRemoteScreenStream',
};

export const createPeer = ({
  api,
  createStream,
  event,
  streams,
  config,
}: RoomPeerType.PeerDependencies) => {
  const Peer = class {
    _roomId = '';
    _clientId = '';
    _api;
    _event;
    _streams;
    _stream;
    _peerConnection: RTCPeerConnection | null = null;

    constructor() {
      this._api = api;
      this._event = event;
      this._streams = streams;
      this._stream = createStream();
    }

    connect = (roomId: string, clientId: string) => {
      if (this._peerConnection) return;

      this._roomId = roomId;
      this._clientId = clientId;

      this._peerConnection = new RTCPeerConnection({
        iceServers: config.webrtc.iceServers,
      });

      this._addEventListener();
    };

    disconnect = () => {
      if (!this._peerConnection) return;

      for (const sender of this._peerConnection.getSenders()) {
        if (!sender.track) return;
        sender.track.enabled = false;
        sender.track.stop();
      }

      this._removeEventListener();
      this._peerConnection.close();
      this._peerConnection = null;
    };

    getPeerConnection = () => {
      return Object.freeze(this._peerConnection);
    };

    addStream = (key: string, data: RoomStreamType.StreamParams) => {
      const stream = this._stream.createInstance(data);

      if (stream.origin === 'local' && stream.source === 'media') {
        this._event.emit(PeerEvents._ADD_LOCAL_MEDIA_STREAM, stream);
      }

      if (stream.origin === 'local' && stream.source === 'screen') {
        this._event.emit(PeerEvents._ADD_LOCAL_SCREEN_STREAM, stream);
      }

      if (stream.origin === 'remote' && stream.source === 'media') {
        this._event.emit(PeerEvents._ADD_REMOTE_MEDIA_STREAM, stream);
      }

      if (stream.origin === 'remote' && stream.source === 'screen') {
        this._event.emit(PeerEvents._ADD_REMOTE_SCREEN_STREAM, stream);
      }

      this._event.emit(PeerEvents.STREAM_ADDED, { stream });
    };

    removeStream = (key: string) => {
      const removedStream = this._streams.removeStream(key);
      this._event.emit(PeerEvents.STREAM_REMOVED, { stream: removedStream });
      return removedStream;
    };

    getAllStreams = () => {
      return this._streams.getAllStreams();
    };

    getStream = (key: string) => {
      return this._streams.getStream(key);
    };

    getTotalStreams = () => {
      return this._streams.getTotalStreams();
    };

    hasStream = (key: string) => {
      return this._streams.hasStream(key);
    };

    enableCamera = () => {
      if (!this._peerConnection) return;
      this._setTrackEnabled(this._peerConnection, 'video', true);
    };

    enableMic = () => {
      if (!this._peerConnection) return;
      this._setTrackEnabled(this._peerConnection, 'audio', true);
    };

    disableCamera = () => {
      if (!this._peerConnection) return;
      this._setTrackEnabled(this._peerConnection, 'video', false);
    };

    disableMic = () => {
      if (!this._peerConnection) return;
      this._setTrackEnabled(this._peerConnection, 'audio', false);
    };

    _addEventListener = () => {
      if (!this._peerConnection) return;

      this._peerConnection.addEventListener(
        'iceconnectionstatechange',
        this._onIceConnectionStateChange
      );

      this._peerConnection.addEventListener(
        'negotiationneeded',
        this._onNegotiationNeeded
      );

      this._peerConnection.addEventListener(
        'icecandidate',
        this._onIceCandidate
      );

      this._peerConnection.addEventListener('track', this._onTrack);

      this._event.on(
        PeerEvents._ADD_LOCAL_MEDIA_STREAM,
        this._onAddLocalMediaStream
      );

      this._event.on(
        PeerEvents._ADD_LOCAL_SCREEN_STREAM,
        this._onAddLocalScreenStream
      );

      this._event.on(
        PeerEvents._ADD_REMOTE_MEDIA_STREAM,
        this._onAddRemoteMediaStream
      );

      this._event.on(
        PeerEvents._ADD_REMOTE_SCREEN_STREAM,
        this._onAddRemoteScreenStream
      );
    };

    _removeEventListener = () => {
      if (!this._peerConnection) return;

      this._peerConnection.removeEventListener(
        'iceconnectionstatechange',
        this._onIceConnectionStateChange
      );

      this._peerConnection.removeEventListener(
        'negotiationneeded',
        this._onNegotiationNeeded
      );

      this._peerConnection.removeEventListener(
        'icecandidate',
        this._onIceCandidate
      );

      this._peerConnection.removeEventListener('track', this._onTrack);
    };

    _setTrackEnabled = (
      peerConnection: RTCPeerConnection,
      kind: 'video' | 'audio',
      enabled: boolean
    ) => {
      for (const sender of peerConnection.getSenders()) {
        if (!sender.track) return;

        if (sender.track.kind === kind) {
          sender.track.enabled = enabled;
        }
      }
    };

    _onIceConnectionStateChange = () => {
      if (!this._peerConnection) return;

      console.log(
        'ice connection state changed to',
        this._peerConnection.iceConnectionState
      );
    };

    _onNegotiationNeeded = async () => {
      if (!this._roomId || !this._clientId) return;

      const allowNegotiateResponse = await this._api.checkNegotiateAllowed(
        this._roomId,
        this._clientId
      );

      if (allowNegotiateResponse.ok) {
        if (!this._peerConnection) return;

        const offer = await this._peerConnection.createOffer();
        await this._peerConnection.setLocalDescription(offer);

        if (this._peerConnection.localDescription) {
          const negotiateResponse = await this._api.negotiateConnection(
            this._roomId,
            this._clientId,
            this._peerConnection.localDescription
          );

          const { answer } = negotiateResponse.data;
          const sdpAnswer = new RTCSessionDescription(answer);
          this._peerConnection.setRemoteDescription(sdpAnswer);
        }
      }
    };

    _onIceCandidate = async (event: RTCPeerConnectionIceEvent) => {
      if (!this._roomId || !this._clientId) return;

      const { candidate } = event;

      if (candidate) {
        this._api.sendIceCandidate(this._roomId, this._clientId, candidate);
      }
    };

    _onTrack = async (event: RTCTrackEvent) => {
      const mediaStream = event.streams.find(
        (stream) => stream.active === true
      );

      const track = event.track;

      if (!(mediaStream instanceof MediaStream)) return;

      if (this.hasStream(mediaStream.id)) return;

      track.addEventListener('ended', () => {
        console.log('remote track ended');
      });

      mediaStream.addEventListener('removetrack', (event) => {
        const target = event.target;

        if (!(target instanceof MediaStream)) return;

        if (this.hasStream(target.id) && target.getTracks().length === 0) {
          this.removeStream(target.id);
        }
      });

      const draftStream = this._streams.getDraft(mediaStream.id) || {};

      this.addStream(mediaStream.id, {
        origin: draftStream.origin || 'remote',
        source: draftStream.source || 'media',
        mediaStream: mediaStream,
      });

      this._streams.removeDraft(mediaStream.id);
    };

    _onAddLocalMediaStream = (stream: RoomStreamType.InstanceStream) => {
      if (!this._peerConnection) return;

      for (const track of stream.mediaStream.getTracks()) {
        this._peerConnection.addTrack(track, stream.mediaStream);
      }

      this._streams.addStream(stream.mediaStream.id, stream);
    };

    _onAddLocalScreenStream = (stream: RoomStreamType.InstanceStream) => {
      if (!this._peerConnection) return;

      for (const track of stream.mediaStream.getTracks()) {
        const sender = this._peerConnection.addTrack(track, stream.mediaStream);

        track.addEventListener('ended', () => {
          if (!this._peerConnection) return;

          this.removeStream(stream.id);
          if (!sender) return;
          this._peerConnection.removeTrack(sender);
        });
      }

      stream.mediaStream.addEventListener('removetrack', (event) => {
        const target = event.target;

        if (!(target instanceof MediaStream)) return;

        if (this.hasStream(target.id) && target.getTracks().length === 0) {
          this.removeStream(target.id);
        }
      });

      this._streams.addStream(stream.mediaStream.id, stream);
    };

    _onAddRemoteMediaStream = (stream: RoomStreamType.InstanceStream) => {
      this._streams.addStream(stream.mediaStream.id, stream);
    };

    _onAddRemoteScreenStream = (stream: RoomStreamType.InstanceStream) => {
      this._streams.addStream(stream.mediaStream.id, stream);
    };
  };

  return {
    createInstance: () => {
      const peer = new Peer();

      return {
        connect: peer.connect,
        disconnect: peer.disconnect,
        getPeerConnection: peer.getPeerConnection,
        addStream: peer.addStream,
        removeStream: peer.removeStream,
        getAllStreams: peer.getAllStreams,
        getStream: peer.getStream,
        getTotalStreams: peer.getTotalStreams,
        hasStream: peer.hasStream,
        enableCamera: peer.enableCamera,
        enableMic: peer.enableMic,
        disableCamera: peer.disableCamera,
        disableMic: peer.disableMic,
      };
    },
  };
};
