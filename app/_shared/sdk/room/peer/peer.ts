import { CreateBandwidthController } from './bandwidth-controller';
import { VideoObserver } from './video-observer';
import {
  getBrowserName,
  CHROME,
  EDGE,
  OPERA,
  SAFARI,
} from '@/_shared/utils/get-browser-name';
import {
  BandwidthController,
  VideoSizeData,
  VideoSizeReport,
  PublisherStatsData,
  PublisherStatsReport,
} from './peer-types';

export const PeerEvents: RoomPeerType.PeerEvents = {
  PEER_CONNECTED: 'peerConnected',
  PEER_DISCONNECTED: 'peerDisconnected',
  STREAM_ADDED: 'streamAdded',
  STREAM_REMOVED: 'streamRemoved',
  _ADD_LOCAL_MEDIA_STREAM: 'addLocalMediaStream',
  _ADD_LOCAL_SCREEN_STREAM: 'addLocalScreenStream',
};

const maxBitrate = 1500 * 1000;
const midBitrate = 500 * 1000;
const minBitrate = 150 * 1000;

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
    _videoObserver: VideoObserver | null = null;
    _event;
    _streams;
    _stream;
    _internalChannel: RTCDataChannel | null = null;
    _bwController: BandwidthController;
    _prevBytesReceived;
    _prevHighBytesSent;
    _prevMidBytesSent;
    _prevLowBytesSent;
    _peerConnection: RTCPeerConnection | null = null;
    _pendingObservedVideo: Array<HTMLVideoElement> = [];

    constructor() {
      this._api = api;
      this._event = event;
      this._streams = streams;
      this._stream = createStream();
      this._internalChannel = null;
      this._prevBytesReceived = 0;

      this._prevHighBytesSent = 0;
      this._prevMidBytesSent = 0;
      this._prevLowBytesSent = 0;

      this._bwController = CreateBandwidthController(this);
    }

    connect = async (roomId: string, clientId: string) => {
      if (this._peerConnection) return;

      this._roomId = roomId;
      this._clientId = clientId;

      this._peerConnection = new RTCPeerConnection({
        iceServers: config.webrtc.iceServers,
      });

      this._addEventListener();
      this._event.emit(PeerEvents.PEER_CONNECTED, {
        roomId: this._roomId,
        clientId: this._clientId,
      });
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
      this._event.emit(PeerEvents.PEER_DISCONNECTED);
    };

    getClientId = () => {
      return this._clientId;
    };

    getRoomId = () => {
      return this._roomId;
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

    getStreamByTrackId = (trackId: string) => {
      return this._streams.getStreamByTrackId(trackId);
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

    sendStats = async (stats: PublisherStatsData) => {
      if (!this._internalChannel) return;

      if (this._internalChannel?.readyState !== 'open') return;

      const statsReport: PublisherStatsReport = {
        type: 'stats',
        data: stats,
      };

      try {
        await this._internalChannel.send(JSON.stringify(statsReport));
      } catch (error) {
        console.error(error);
      }
    };

    observeVideo = (videoElement: HTMLVideoElement) => {
      if (!this._videoObserver) {
        this._pendingObservedVideo.push(videoElement);
        return;
      }

      this._videoObserver.observe(videoElement);
    };

    unobserveVideo = (videoElement: HTMLVideoElement) => {
      if (!this._videoObserver) {
        return;
      }

      this._videoObserver.unobserve(videoElement);
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

      this._peerConnection.addEventListener('datachannel', (e) => {
        if (e.channel.label === 'internal') {
          this._internalChannel = e.channel;
          this._videoObserver = new VideoObserver(this._internalChannel, 1000);
          this._pendingObservedVideo.forEach((videoElement) => {
            this._videoObserver?.observe(videoElement);
          });
        }
      });

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

      if (this.hasStream(mediaStream.id)) {
        if (event.track.kind === 'video') {
          this.removeStream(mediaStream.id);
        } else {
          return;
        }
      }
      mediaStream.addEventListener('removetrack', (event) => {
        const target = event.target;

        if (!(target instanceof MediaStream)) return;

        if (this.hasStream(target.id) && target.getTracks().length === 0) {
          this.removeStream(target.id);
        }
      });

      const draftStream = this._streams.getDraft(mediaStream.id) || {};

      this.addStream(mediaStream.id, {
        clientId: draftStream.clientId || '',
        name: draftStream.name || '',
        origin: draftStream.origin || 'remote',
        source: draftStream.source || 'media',
        mediaStream: mediaStream,
      });

      this._streams.removeDraft(mediaStream.id);
    };

    _onBeforeUnload = async () => {
      if (this._roomId === '' || this._clientId === '') return;

      this.disconnect();
      await this._api.leaveRoom(this._roomId, this._clientId);
    };

    setAsLeftRoom = () => {
      this._roomId = '';
      this._clientId = '';
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

      const browserName = getBrowserName();
      const simulcastBrowsers = [SAFARI, CHROME, EDGE, OPERA];

      const simulcastInit: RTCRtpTransceiverInit = {
        direction: 'sendonly',
        streams: [stream.mediaStream],
      };

      if (browserName !== null && simulcastBrowsers.includes(browserName)) {
        console.log('simulcast enabled');

        simulcastInit['sendEncodings'] = [
          // for firefox order matters... first high resolution, then scaled resolutions...
          {
            rid: 'high',
            maxBitrate: maxBitrate,
            maxFramerate: 30,
          },
          {
            rid: 'mid',
            scaleResolutionDownBy: 2.0,
            maxFramerate: 30,
            maxBitrate: midBitrate,
          },
          {
            rid: 'low',
            scaleResolutionDownBy: 4.0,
            maxBitrate: minBitrate,
            maxFramerate: 30,
          },
        ];
      }

      this._peerConnection.addTransceiver(
        stream.mediaStream.getVideoTracks()[0],
        simulcastInit
      );
    };

    _sleep = (delay: number) =>
      new Promise((resolve) => setTimeout(resolve, delay));

    _onAddLocalScreenStream = (stream: RoomStreamType.InstanceStream) => {
      if (!this._peerConnection) return;

      for (const track of stream.mediaStream.getTracks()) {
        const transceiver = this._peerConnection.addTransceiver(track, {
          direction: 'sendonly',
          streams: [stream.mediaStream],
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
        getClientId: peer.getClientId,
        getRoomId: peer.getRoomId,
        getPeerConnection: peer.getPeerConnection,
        addStream: peer.addStream,
        removeStream: peer.removeStream,
        getAllStreams: peer.getAllStreams,
        getStream: peer.getStream,
        getStreamByTrackId: peer.getStreamByTrackId,
        getTotalStreams: peer.getTotalStreams,
        hasStream: peer.hasStream,
        turnOnCamera: peer.turnOnCamera,
        turnOnMic: peer.turnOnMic,
        turnOffCamera: peer.turnOffCamera,
        turnOffMic: peer.turnOffMic,
        replaceTrack: peer.replaceTrack,
        sendStats: peer.sendStats,
        setAsLeftRoom: peer.setAsLeftRoom,
        observeVideo: peer.observeVideo,
        unobserveVideo: peer.unobserveVideo,
      };
    },
  };
};
