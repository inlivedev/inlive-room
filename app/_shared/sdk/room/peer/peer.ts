export const PeerEvents: RoomPeerType.PeerEvents = {
  STREAM_ADDED: 'streamAdded',
  STREAM_REMOVED: 'streamRemoved',
  _ADD_LOCAL_MEDIA_STREAM: 'addLocalMediaStream',
  _ADD_LOCAL_SCREEN_STREAM: 'addLocalScreenStream',
};
interface BwController {
  lowBitrate: number;
  midBitrate: number;
  highBitrate: number;
  available: number;
  tracks: {
    [key: string]: TrackStats;
  };
}

interface TrackStats {
  prevBytesReceived: number;
  currentBytesReceived: number;
  currentBitrates: number;
}

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
    _maxHighBitrate = 1250 * 1000;
    _minLowBitrate = 140 * 1000;
    _bwController: BwController;
    _prevBytesReceived;
    _prevHighBytesSent;
    _prevMidBytesSent;
    _prevLowBytesSent;
    _peerConnection: RTCPeerConnection | null = null;

    constructor() {
      this._api = api;
      this._event = event;
      this._streams = streams;
      this._stream = createStream();

      this._prevBytesReceived = 0;

      this._prevHighBytesSent = 0;
      this._prevMidBytesSent = 0;
      this._prevLowBytesSent = 0;

      this._bwController = {
        lowBitrate: 0,
        midBitrate: 0,
        highBitrate: 0,
        available: 0,
        tracks: {},
      };
    }

    connect = async (roomId: string, clientId: string) => {
      if (this._peerConnection) return;

      this._roomId = roomId;
      this._clientId = clientId;

      this._peerConnection = new RTCPeerConnection({
        iceServers: config.webrtc.iceServers,
      });

      this._addEventListener();

      this._enableBwMonitor();
    };

    _enableBwMonitor = async () => {
      this._monitorStats();
      console.log('bandwidth monitor enabled');
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

    addStream = (key: string, data: RoomStreamType.AddStreamParams) => {
      this._streams.validateKey(key);
      this._streams.validateStream(data);

      const stream = this._stream.createInstance({
        id: key,
        ...data,
      });

      this._streams.addStream(key, stream);

      if (stream.origin === 'local' && stream.source === 'media') {
        this._event.emit(PeerEvents._ADD_LOCAL_MEDIA_STREAM, stream);
      }

      if (stream.origin === 'local' && stream.source === 'screen') {
        this._event.emit(PeerEvents._ADD_LOCAL_SCREEN_STREAM, stream);
      }

      this._event.emit(PeerEvents.STREAM_ADDED, { stream });
    };

    removeStream = (key: string) => {
      this._streams.validateKey(key);
      const removedStream = this._streams.removeStream(key);
      this._event.emit(PeerEvents.STREAM_REMOVED, { stream: removedStream });
      return removedStream;
    };

    getAllStreams = () => {
      return this._streams.getAllStreams();
    };

    getStream = (key: string) => {
      this._streams.validateKey(key);
      return this._streams.getStream(key);
    };

    getTotalStreams = () => {
      return this._streams.getTotalStreams();
    };

    hasStream = (key: string) => {
      this._streams.validateKey(key);
      return this._streams.hasStream(key);
    };

    turnOnCamera = () => {
      if (!this._peerConnection) return;
      this._setTrackEnabled(this._peerConnection, 'video', true);
    };

    turnOnMic = () => {
      if (!this._peerConnection) return;
      this._setTrackEnabled(this._peerConnection, 'audio', true);
    };

    turnOffCamera = () => {
      if (!this._peerConnection) return;
      this._setTrackEnabled(this._peerConnection, 'video', false);
    };

    turnOffMic = () => {
      if (!this._peerConnection) return;
      this._setTrackEnabled(this._peerConnection, 'audio', false);
    };

    replaceTrack = async (track: MediaStreamTrack) => {
      if (!this._peerConnection) return;

      for (const transceiver of this._peerConnection.getTransceivers()) {
        if (
          transceiver.sender.track &&
          transceiver.sender.track.kind === track.kind
        ) {
          await transceiver.sender.replaceTrack(track);
        }
      }
    };

    adjustBitrate = (min: number, max: number) => {
      if (max > this._bwController.available) {
        max = this._bwController.available;
      }

      if (max > this._maxHighBitrate) {
        max = this._maxHighBitrate;
      }

      const idealMin = Math.floor(max / 9);

      if (min > idealMin) {
        min = idealMin;
      }

      if (min < this._minLowBitrate) {
        min = this._minLowBitrate;
      }

      let updatedParams = false;
      const delta = max - min;
      const mid = min + Math.floor((delta * 1) / 3);

      this._peerConnection?.getSenders().forEach((sender) => {
        if (sender.track != null && sender.track.kind == 'video') {
          const stream = this._streams.getStreamByTrackId(sender.track.id);
          if (!stream) return;
          else if (stream.source != 'media') return;

          const params = sender.getParameters();

          if (params.encodings.length == 1) {
            return;
          }

          params.encodings.forEach((encoding, i) => {
            switch (encoding.rid) {
              case 'high':
                params.encodings[i].maxBitrate = max;
                updatedParams = true;
                break;

              case 'mid':
                params.encodings[i].maxBitrate = mid;
                updatedParams = true;
                break;
              case 'low':
                params.encodings[i].maxBitrate = min;
                updatedParams = true;
                break;
            }
          });

          const nextTotalBw = params.encodings.reduce((acc, encoding) => {
            if (typeof encoding.maxBitrate == 'undefined') {
              return acc;
            }

            return acc + encoding.maxBitrate;
          }, 0);

          if (updatedParams) {
            console.log(
              `min: ${min}, mid: ${mid}, max: ${max}, nextTotalBw: ${nextTotalBw}`
            );
            sender.setParameters(params);
          }
        }
      });
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

      window.addEventListener('beforeunload', this._onBeforeUnload);
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

      window.removeEventListener('beforeunload', this._onBeforeUnload);
    };

    _setTrackEnabled = (
      peerConnection: RTCPeerConnection,
      kind: 'video' | 'audio',
      enabled: boolean
    ) => {
      const stream = this._streams.getAllStreams().find((stream) => {
        return stream.origin === 'local' && stream.source === 'media';
      });

      if (!stream) {
        throw new Error(
          'You must add a user MediaStream in order to proceed this operation'
        );
      }

      const mediaTrack = stream.mediaStream.getTracks().find((track) => {
        return track.kind === kind;
      });

      if (!mediaTrack) return;

      for (const sender of peerConnection.getSenders()) {
        if (!sender.track) return;

        if (
          sender.track.kind === mediaTrack.kind &&
          sender.track.id === mediaTrack.id
        ) {
          sender.track.enabled = enabled;
        }
      }
    };

    _restartNegotiation = async () => {
      if (!this._peerConnection) return;

      const allowNegotiateResponse = await this._api.checkNegotiateAllowed(
        this._roomId,
        this._clientId
      );

      if (!allowNegotiateResponse.ok) return;

      try {
        const offer = await this._peerConnection.createOffer({
          iceRestart: true,
        });

        await this._peerConnection.setLocalDescription(offer);

        if (!this._peerConnection.localDescription) {
          throw new Error(
            'Failed to set the local description on restart negotiation'
          );
        }

        await this._api.negotiateConnection(
          this._roomId,
          this._clientId,
          this._peerConnection.localDescription
        );
      } catch (error) {
        console.error(error);
      }
    };

    _onIceConnectionStateChange = async () => {
      if (!this._peerConnection) return;

      const { iceConnectionState } = this._peerConnection;

      console.log('ice connection state changed to', iceConnectionState);

      if (iceConnectionState === 'failed') {
        await this._restartNegotiation();
      }
    };

    _onNegotiationNeeded = async () => {
      if (!this._roomId || !this._clientId) return;

      const allowNegotiateResponse = await this._api.checkNegotiateAllowed(
        this._roomId,
        this._clientId
      );

      if (!allowNegotiateResponse.ok || !this._peerConnection) return;

      try {
        const offer = await this._peerConnection.createOffer();
        await this._peerConnection.setLocalDescription(offer);

        if (!this._peerConnection.localDescription) {
          throw new Error(
            'Failed to set the local description on negotiationneeded'
          );
        }

        const negotiateResponse = await this._api.negotiateConnection(
          this._roomId,
          this._clientId,
          this._peerConnection.localDescription
        );

        if (!negotiateResponse.ok || !negotiateResponse.data) {
          throw new Error('Failed to get a negotiate response');
        }

        const { answer } = negotiateResponse.data;
        const sdpAnswer = new RTCSessionDescription(answer);
        await this._peerConnection.setRemoteDescription(sdpAnswer);
      } catch (error) {
        console.error(error);
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

      if (!(mediaStream instanceof MediaStream)) return;

      if (this.hasStream(mediaStream.id)) return;

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

    _onBeforeUnload = async () => {
      if (!this._roomId || !this._clientId) return;

      this.disconnect();
      await this._api.leaveRoom(this._roomId, this._clientId);
    };

    _onAddLocalMediaStream = (stream: RoomStreamType.InstanceStream) => {
      if (!this._peerConnection) return;

      this._peerConnection.addTransceiver(
        stream.mediaStream.getAudioTracks()[0],
        {
          direction: 'sendonly',
          streams: [stream.mediaStream],
          sendEncodings: [{ priority: 'high' }],
        }
      );

      this._peerConnection.addTransceiver(
        stream.mediaStream.getVideoTracks()[0],
        {
          direction: 'sendonly',
          streams: [stream.mediaStream],
          sendEncodings: [
            // for firefox order matters... first high resolution, then scaled resolutions...
            {
              rid: 'high',
              maxBitrate: 700 * 1000,
              maxFramerate: 30,
            },
            {
              rid: 'mid',
              scaleResolutionDownBy: 2.0,
              maxFramerate: 20,
              maxBitrate: 190 * 1000,
            },
            {
              rid: 'low',
              scaleResolutionDownBy: 4.0,
              maxBitrate: 130 * 1000,
              maxFramerate: 15,
            },
          ],
        }
      );
    };

    _sleep = (delay: number) =>
      new Promise((resolve) => setTimeout(resolve, delay));

    _monitorStats = async () => {
      const intervalSec = 3;

      while (true) {
        if (
          !this._peerConnection ||
          this._peerConnection?.connectionState != 'connected'
        ) {
          await this._sleep(1000 * intervalSec);
          continue;
        }

        const stats = await this._peerConnection?.getStats();
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            if (
              typeof this._bwController.tracks[report.trackIdentifier] ==
              'undefined'
            ) {
              this._bwController.tracks[report.trackIdentifier] = {
                prevBytesReceived: 0,
                currentBytesReceived: 0,
                currentBitrates: 0,
              };
            }

            if (
              this._bwController.tracks[report.trackIdentifier]
                .prevBytesReceived == 0 ||
              report.bytesReceived == 0
            ) {
              this._bwController.tracks[
                report.trackIdentifier
              ].prevBytesReceived = report.bytesReceived;
              return;
            }

            const deltaBytes =
              report.bytesReceived -
              this._bwController.tracks[report.trackIdentifier]
                .prevBytesReceived;
            this._bwController.tracks[
              report.trackIdentifier
            ].prevBytesReceived = report.bytesReceived;
            const bitrate = deltaBytes * 8;
            this._bwController.tracks[
              report.trackIdentifier
            ].currentBytesReceived = report.bytesReceived;
            this._bwController.tracks[report.trackIdentifier].currentBitrates =
              bitrate;

            console.log(
              `stats for ${report.trackIdentifier}: \n ${bitrate}, fps: ${report.framesPerSecond}, resolution: ${report.frameWidth}x${report.frameHeight}`
            );
          }

          if (
            report.type === 'candidate-pair' &&
            typeof report.availableOutgoingBitrate !== 'undefined'
          ) {
            this._bwController.available = report.availableOutgoingBitrate;
          }

          if (report.type === 'outbound-rtp' && report.kind === 'video') {
            if (report.rid === 'high' || typeof report.rid === 'undefined') {
              if (this._prevHighBytesSent === 0 || report.bytesSent == 0) {
                this._prevHighBytesSent = report.bytesSent;
                return;
              }

              const deltaBytes = report.bytesSent - this._prevHighBytesSent;
              this._prevHighBytesSent = report.bytesSent;
              const bitrate = deltaBytes * 8;
              this._bwController.highBitrate = Math.ceil(bitrate / intervalSec);
            }

            if (report.rid === 'mid') {
              if (this._prevMidBytesSent === 0 || report.bytesSent == 0) {
                this._prevMidBytesSent = report.bytesSent;
                return;
              }

              const deltaBytes = report.bytesSent - this._prevMidBytesSent;
              this._prevMidBytesSent = report.bytesSent;
              const bitrate = deltaBytes * 8;
              this._bwController.midBitrate = Math.ceil(bitrate / intervalSec);
            }

            if (report.rid === 'low') {
              if (this._prevLowBytesSent === 0 || report.bytesSent == 0) {
                this._prevLowBytesSent = report.bytesSent;
                return;
              }

              const deltaBytes = report.bytesSent - this._prevLowBytesSent;
              this._prevLowBytesSent = report.bytesSent;
              const bitrate = deltaBytes * 8;
              this._bwController.lowBitrate = Math.ceil(bitrate / intervalSec);
            }
          }
        });

        console.log(`available bitrate: ${this._bwController.available}`);
        console.log(
          `total bitrate: ${
            this._bwController.lowBitrate +
            this._bwController.midBitrate +
            this._bwController.highBitrate
          }, high bitrate: ${this._bwController.highBitrate}, mid bitrate: ${
            this._bwController.midBitrate
          }, low bitrate: ${this._bwController.lowBitrate}`
        );

        await this._sleep(3000);
      }
    };

    _onAddLocalScreenStream = (stream: RoomStreamType.InstanceStream) => {
      if (!this._peerConnection) return;

      for (const track of stream.mediaStream.getTracks()) {
        const transceiver = this._peerConnection.addTransceiver(track, {
          direction: 'sendonly',
          streams: [stream.mediaStream],
          sendEncodings: [{ priority: 'high' }],
        });

        track.addEventListener('ended', () => {
          if (!this._peerConnection || !transceiver.sender) return;
          this._peerConnection.removeTrack(transceiver.sender);
          this.removeStream(stream.id);
        });
      }
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
        adjustBitrate: peer.adjustBitrate,
        removeStream: peer.removeStream,
        getAllStreams: peer.getAllStreams,
        getStream: peer.getStream,
        getTotalStreams: peer.getTotalStreams,
        hasStream: peer.hasStream,
        turnOnCamera: peer.turnOnCamera,
        turnOnMic: peer.turnOnMic,
        turnOffCamera: peer.turnOffCamera,
        turnOffMic: peer.turnOffMic,
        replaceTrack: peer.replaceTrack,
      };
    },
  };
};
