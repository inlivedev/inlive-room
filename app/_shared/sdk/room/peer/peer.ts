import { iceServers } from '../config/webrtc';

export const PeerEvent = {
  STREAM_ADDED: 'streamAdded',
  STREAM_REMOVED: 'streamRemoved',
};

class Peer {
  _roomId = '';
  _clientId = '';
  _api;
  _event;
  _stream;
  _peerConnection: RTCPeerConnection | null = null;

  constructor({ api, event, stream }: RoomPeerTypes.PeerProps) {
    this._api = api;
    this._event = event;
    this._stream = stream;
  }

  connect = (roomId: string, clientId: string) => {
    if (this._peerConnection) return;

    this._roomId = roomId;
    this._clientId = clientId;

    this._peerConnection = new RTCPeerConnection({
      iceServers: iceServers,
    });

    this._peerConnection.addEventListener(
      'iceconnectionstatechange',
      this._onIceConnectionStateChange
    );

    this._peerConnection.addEventListener(
      'negotiationneeded',
      this._onNegotiationNeeded
    );

    this._peerConnection.addEventListener('icecandidate', this._onIceCandidate);
  };

  getPeerConnection = () => {
    return this._peerConnection;
  };

  addTrack = (stream: MediaStream) => {
    if (!this._peerConnection) return;

    if (stream instanceof MediaStream) {
      for (const track of stream.getTracks()) {
        this._peerConnection.addTrack(track, stream);
      }
    }
  };

  addStream = (key: string, value: RoomStreamType.Stream) => {
    if (!this._peerConnection) return;

    if (
      !key ||
      !value ||
      typeof value.origin !== 'string' ||
      typeof value.source !== 'string' ||
      !(value.stream instanceof MediaStream)
    ) {
      throw new Error('Wrong stream format input!');
    }

    const { origin, source, stream } = value;

    if (origin === 'local' && source === 'media') {
      for (const track of stream.getTracks()) {
        this._peerConnection.addTrack(track, stream);
      }
    }

    this._stream.addStream(key, value);
    this._event.emit(PeerEvent.STREAM_ADDED, { stream: value });
  };

  removeStream = (key: string) => {
    return this._stream.removeStream(key);
  };

  getAllStreams = () => {
    return this._stream.getAllStreams();
  };

  getStream = (key: string) => {
    return this._stream.getStream(key);
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
        await this._peerConnection.setRemoteDescription(sdpAnswer);
      }
    }
  };

  _onIceCandidate = async (event: RTCPeerConnectionIceEvent) => {
    if (!this._roomId || !this._clientId) return;

    const { candidate } = event;

    if (candidate) {
      await this._api.sendIceCandidate(this._roomId, this._clientId, candidate);
    }
  };
}

export const peerFactory = ({
  api,
  event,
  stream,
}: RoomPeerTypes.PeerFactoryProps) => {
  const peer = new Peer({
    api,
    event,
    stream,
  });

  return {
    connect: peer.connect,
    getPeerConnection: peer.getPeerConnection,
    addTrack: peer.addTrack,
    addStream: peer.addStream,
    removeStream: peer.removeStream,
    getAllStreams: peer.getAllStreams,
    getStream: peer.getStream,
  };
};
